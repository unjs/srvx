import type {
  FetchHandler,
  NodeHttpHandler,
  Server,
  ServerHandler,
  ServerOptions,
  ServerRequest,
} from "../types.ts";
import NodeHttp from "node:http";
import NodeHttps from "node:https";
import { readFileSync } from "node:fs";
import { sendNodeResponse } from "../_node-compat/send.ts";
import { NodeRequestProxy } from "../_node-compat/request.ts";
import { fmtURL, resolvePort } from "../_utils.ts";
import { wrapFetch } from "../_plugin.ts";

export { NodeFastResponse as Response } from "../_node-compat/response.ts";

export function serve(options: ServerOptions): Server {
  return new NodeServer(options);
}

export function toNodeHandler(fetchHandler: FetchHandler): NodeHttpHandler {
  return (
    nodeReq: NodeHttp.IncomingMessage,
    nodeRes: NodeHttp.ServerResponse,
  ) => {
    const request = new NodeRequestProxy(nodeReq) as ServerRequest;
    request.node = { req: nodeReq, res: nodeRes };
    const res = fetchHandler(request);
    return res instanceof Promise
      ? res.then((resolvedRes) => sendNodeResponse(nodeRes, resolvedRes))
      : sendNodeResponse(nodeRes, res);
  };
}

// https://nodejs.org/api/http.html
// https://nodejs.org/api/https.html

class NodeServer implements Server {
  readonly runtime = "node";
  readonly options: ServerOptions;
  readonly node: Server["node"];
  readonly serveOptions: ServerOptions["node"];
  readonly fetch: ServerHandler;
  readonly isHttps: boolean;

  #listeningPromise?: Promise<void>;

  constructor(options: ServerOptions) {
    this.options = options;
    this.isHttps = !!options.https;

    const fetchHandler = wrapFetch(this, this.options.fetch);
    this.fetch = fetchHandler;

    const handler = (
      nodeReq: NodeHttp.IncomingMessage,
      nodeRes: NodeHttp.ServerResponse,
    ) => {
      const request = new NodeRequestProxy(nodeReq) as ServerRequest;
      request.node = { req: nodeReq, res: nodeRes };
      const res = fetchHandler(request);
      return res instanceof Promise
        ? res.then((resolvedRes) => sendNodeResponse(nodeRes, resolvedRes))
        : sendNodeResponse(nodeRes, res);
    };

    this.serveOptions = {
      port: resolvePort(this.options.port, globalThis.process?.env.PORT),
      host: this.options.hostname,
      exclusive: !this.options.reusePort,
      ...this.options.node,
    };

    if (
      this.isHttps &&
      this.options.https &&
      (this.options.https.key || this.options.https.inlineKey) &&
      (this.options.https.cert || this.options.https.inlineCert)
    ) {
      const key = this.options.https.inlineKey || 
        (this.options.https.key ? readFileSync(this.options.https.key) : undefined);
      
      const cert = this.options.https.inlineCert ||
        (this.options.https.cert ? readFileSync(this.options.https.cert) : undefined);

      const ca = this.options.https.inlineCa ||
        (this.options.https.ca?.map(caPath => readFileSync(caPath)));

      this.serveOptions = {
        ...this.serveOptions,
        ...this.options.https,
        key,
        cert,
        ca,
      };
    }

    // Create HTTPS server if HTTPS options are provided, otherwise create HTTP server
    const server = this.isHttps
      ? NodeHttps.createServer(this.serveOptions, handler)
      : NodeHttp.createServer(this.serveOptions, handler);

    this.node = { server, handler };

    if (!options.manual) {
      this.serve();
    }
  }

  serve() {
    if (this.#listeningPromise) {
      return Promise.resolve(this.#listeningPromise).then(() => this);
    }
    this.#listeningPromise = new Promise<void>((resolve) => {
      this.node!.server!.listen(this.serveOptions, () => resolve());
    });
  }

  get url() {
    const addr = this.node?.server?.address();
    if (!addr) {
      return;
    }

    return typeof addr === "string"
      ? addr /* socket */
      : fmtURL(addr.address, addr.port, this.isHttps);
  }

  ready(): Promise<Server> {
    return Promise.resolve(this.#listeningPromise).then(() => this);
  }

  close(closeAll?: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (closeAll) {
        this.node?.server?.closeAllConnections?.();
      }
      this.node?.server?.close((error?: Error) =>
        error ? reject(error) : resolve(),
      );
    });
  }
}

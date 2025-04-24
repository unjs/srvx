import type {
  FetchHandler,
  NodeHttpHandler,
  Server,
  ServerHandler,
  ServerOptions,
} from "../types.ts";
import NodeHttp from "node:http";
import NodeHttps from "node:https";
import {
  sendNodeResponse,
  sendNodeUpgradeResponse,
} from "../_node-compat/send.ts";
import { NodeRequest } from "../_node-compat/request.ts";
import {
  fmtURL,
  resolveTLSOptions,
  printListening,
  resolvePortAndHost,
} from "../_utils.node.ts";
import { wrapFetch } from "../_plugin.ts";
import { errorPlugin } from "../_error.ts";
import { wsUpgradePlugin } from "../_ws.ts";

export { FastURL as URL } from "../_url.ts";

export {
  NodeRequest as Request,
  NodeResponse as Response,
  NodeRequest,
  NodeResponse,
  NodeRequestHeaders,
  NodeResponseHeaders,
} from "../_node-compat/index.ts";

export function serve(options: ServerOptions): Server {
  return new NodeServer(options);
}

export function toNodeHandler(fetchHandler: FetchHandler): NodeHttpHandler {
  return (
    nodeReq: NodeHttp.IncomingMessage,
    nodeRes: NodeHttp.ServerResponse,
  ) => {
    const request = new NodeRequest({ req: nodeReq, res: nodeRes });
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

  #listeningPromise?: Promise<void>;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = (this.fetch = wrapFetch(this, [
      errorPlugin,
      wsUpgradePlugin,
    ]));

    const handler = (
      nodeReq: NodeHttp.IncomingMessage,
      nodeRes: NodeHttp.ServerResponse,
    ) => {
      const request = new NodeRequest({ req: nodeReq, res: nodeRes });
      const res = fetchHandler(request);
      return res instanceof Promise
        ? res.then((resolvedRes) => sendNodeResponse(nodeRes, resolvedRes))
        : sendNodeResponse(nodeRes, res);
    };

    const tls = resolveTLSOptions(this.options);
    const { port, hostname: host } = resolvePortAndHost(this.options);
    this.serveOptions = {
      port,
      host,
      exclusive: !this.options.reusePort,
      ...(tls
        ? { cert: tls.cert, key: tls.key, passphrase: tls.passphrase }
        : {}),
      ...this.options.node,
    };

    // Create HTTPS server if HTTPS options are provided, otherwise create HTTP server
    const server = (this.serveOptions as { cert: string }).cert
      ? NodeHttps.createServer(
          this.serveOptions as NodeHttps.ServerOptions,
          handler,
        )
      : NodeHttp.createServer(this.serveOptions, handler);

    // Listen to upgrade events if there is a hook
    if (this.options.upgrade) {
      server.on("upgrade", (nodeReq, socket, header) => {
        const request = new NodeRequest({
          req: nodeReq,
          upgrade: { socket, header },
        });
        const res = fetchHandler(request);
        return res instanceof Promise
          ? res.then((resolvedRes) =>
              sendNodeUpgradeResponse(socket, resolvedRes),
            )
          : sendNodeUpgradeResponse(socket, res);
      });
    }

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
      this.node!.server!.listen(this.serveOptions, () => {
        printListening(this.options, this.url);
        resolve();
      });
    });
  }

  get url() {
    const addr = this.node?.server?.address();
    if (!addr) {
      return;
    }

    return typeof addr === "string"
      ? addr /* socket */
      : fmtURL(
          addr.address,
          addr.port,
          this.node!.server! instanceof NodeHttps.Server,
        );
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

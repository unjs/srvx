import type {
  Server,
  ServerHandler,
  ServerOptions,
  ServerRequest,
} from "../types.ts";
import NodeHttp from "node:http";
import { sendNodeResponse } from "../_node-compat/send.ts";
import { NodeRequestProxy } from "../_node-compat/request.ts";
import { fmtURL, resolvePort } from "../_utils.ts";
import { wrapFetch } from "../_plugin.ts";

export { NodeFastResponse as Response } from "../_node-compat/response.ts";

export function serve(options: ServerOptions): Server {
  return new NodeServer(options);
}

// https://nodejs.org/api/http.html

class NodeServer implements Server {
  readonly runtime = "node";
  readonly options: ServerOptions;
  readonly node: Server["node"];
  readonly fetch: ServerHandler;

  #listeningPromise?: Promise<void>;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = (this.fetch = wrapFetch(this, this.options.fetch));

    const nodeHandler = (
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

    const nodeServer = NodeHttp.createServer(
      this.options.node || {},
      nodeHandler,
    );

    this.#listeningPromise = new Promise<void>((resolve) => {
      nodeServer.listen(
        {
          port: resolvePort(this.options.port, globalThis.process?.env.PORT),
          host: this.options.hostname,
          exclusive: !this.options.reusePort,
          ...this.options.node,
        },
        () => resolve(),
      );
    });

    this.node = { server: nodeServer, handler: nodeHandler };
  }

  get url() {
    const addr = this.node?.server?.address();
    if (!addr) {
      return;
    }
    return typeof addr === "string"
      ? addr /* socket */
      : fmtURL(addr.address, addr.port, false);
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

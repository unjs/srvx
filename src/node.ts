import type { ServerOptions, xRequest } from "./types";
import NodeHttp from "node:http";
import { Server } from "./server";
import { sendNodeResponse, NodeRequestProxy } from "./node-utils/index.ts";
import { resolvePort } from "./_common.ts";

export function serve(options: ServerOptions): Server {
  return new NodeServer(options);
}

// https://nodejs.org/api/http.html

class NodeServer extends Server {
  readonly runtime = "node";

  protected _listen() {
    const nodeServer = (this.nodeServer = NodeHttp.createServer(
      {
        ...this.options.node,
      },
      (nodeReq, nodeRes) => {
        const request = new NodeRequestProxy(nodeReq) as xRequest;
        request.xNode = { req: nodeReq, res: nodeRes };
        const res = this.fetch(request);
        return res instanceof Promise
          ? res.then((resolvedRes) => sendNodeResponse(nodeRes, resolvedRes))
          : sendNodeResponse(nodeRes, res);
      },
    ));

    return new Promise<void>((resolve) => {
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
  }

  get port() {
    const addr = this.#addr;
    if (!addr) {
      return null;
    }
    return addr.port;
  }

  get addr() {
    const addr = this.#addr;
    if (!addr) {
      return null;
    }
    return addr.address;
  }

  get #addr() {
    const addr = this.nodeServer?.address();
    if (addr && typeof addr !== "string") {
      return addr;
    }
  }

  close(closeAll?: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (closeAll) {
        this.nodeServer?.closeAllConnections?.();
      }
      this.nodeServer?.close((error?: Error) =>
        error ? reject(error) : resolve(),
      );
    });
  }
}

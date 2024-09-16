import type { ServerOptions } from "./types";
import { Server } from "./server.ts";
import { resolvePort } from "./_common.ts";

export function serve(options: ServerOptions): Server {
  return new BunServer(options);
}

// https://bun.sh/docs/api/http

class BunServer extends Server {
  readonly runtime = "bun";

  readonly bunServer: NonNullable<Server["bunServer"]>;

  constructor(options: ServerOptions) {
    super(options);

    let serverFetch = options.fetch;
    if (options.xRemoteAddress) {
      const userFetch = options.fetch;
      serverFetch = (request) => {
        Object.defineProperty(request, "xRemoteAddress", {
          get: () => this.bunServer?.requestIP(request as Request)?.address,
          enumerable: true,
        });
        return userFetch(request);
      };
    }

    this.bunServer = Bun.serve({
      port: resolvePort(options.port, globalThis.process?.env.PORT),
      hostname: this.options.hostname,
      reusePort: this.options.reusePort,
      ...this.options.bun,
      fetch: serverFetch,
    });
  }

  get port() {
    return this.bunServer.port;
  }

  get addr() {
    return this.bunServer.hostname;
  }

  close(closeAll?: boolean) {
    this.bunServer.stop(closeAll);
  }
}

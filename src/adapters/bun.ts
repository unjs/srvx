import type { Server, ServerHandler, ServerOptions } from "../types.ts";
import { resolvePort } from "../_utils.ts";
import { wrapFetch } from "../_plugin.ts";

export function serve(options: ServerOptions): Server {
  return new BunServer(options);
}

// https://bun.sh/docs/api/http

class BunServer implements Server {
  readonly runtime = "bun";
  readonly options: ServerOptions;
  readonly bun: Server["bun"];
  readonly fetch: ServerHandler;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = (this.fetch = wrapFetch(this, this.options.fetch));

    const server = Bun.serve({
      port: resolvePort(this.options.port, globalThis.process?.env.PORT),
      hostname: this.options.hostname,
      reusePort: this.options.reusePort,
      ...this.options.bun,
      fetch(request) {
        Object.defineProperties(request, {
          bun: { value: { server: this }, enumerable: true },
          remoteAddress: {
            get: () => this?.requestIP(request as Request)?.address,
            enumerable: true,
          },
        });
        return fetchHandler(request);
      },
    });

    this.bun = { server };
  }

  get url() {
    return this.bun?.server?.url.href;
  }

  ready() {
    return Promise.resolve(this);
  }

  close(closeAll?: boolean) {
    return Promise.resolve(this.bun?.server?.stop(closeAll));
  }
}

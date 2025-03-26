import type { BunFetchandler, Server, ServerOptions } from "../types.ts";
import type * as bun from "bun";
import { resolveHTTPSOptions, resolvePort } from "../_utils.ts";
import { wrapFetch } from "../_plugin.ts";

export const Response = globalThis.Response;

export function serve(options: ServerOptions): BunServer {
  return new BunServer(options);
}

// https://bun.sh/docs/api/http

class BunServer implements Server<BunFetchandler> {
  readonly runtime = "bun";
  readonly options: ServerOptions;
  readonly bun: Server["bun"] = {};
  readonly serveOptions: bun.ServeOptions | bun.TLSServeOptions;
  readonly fetch: BunFetchandler;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = wrapFetch(this, this.options.fetch);

    this.fetch = (request, server) => {
      Object.defineProperties(request, {
        bun: { value: { server }, enumerable: true },
        remoteAddress: {
          get: () => server?.requestIP(request as Request)?.address,
          enumerable: true,
        },
      });
      return fetchHandler(request);
    };

    this.serveOptions = {
      hostname: this.options.hostname,
      reusePort: this.options.reusePort,
      port: resolvePort(this.options.port, globalThis.process?.env.PORT),
      ...resolveHTTPSOptions(this.options),
      ...this.options.bun,
      fetch: this.fetch,
    };

    if (!options.manual) {
      this.serve();
    }
  }

  serve() {
    if (!this.bun!.server) {
      this.bun!.server = Bun.serve(this.serveOptions);
    }
    return Promise.resolve(this);
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

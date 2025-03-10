import type { Server, ServerOptions } from "../types.ts";
import type * as CF from "@cloudflare/workers-types";
import { wrapFetch } from "../_plugin.ts";

export function serve(
  options: ServerOptions,
): Server<CF.ExportedHandlerFetchHandler> {
  return new CloudflareServer(options);
}

class CloudflareServer implements Server<CF.ExportedHandlerFetchHandler> {
  readonly runtime = "cloudflare";
  readonly options: ServerOptions;
  readonly fetch: CF.ExportedHandlerFetchHandler;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = wrapFetch(
      this as unknown as Server,
      this.options.fetch,
    );

    this.fetch = (request, env, context) => {
      Object.defineProperties(request, {
        cloudflare: { value: { env, context }, enumerable: true },
        remoteAddress: {
          get: () => undefined,
          enumerable: true,
        },
      });
      return fetchHandler(request as unknown as Request) as unknown as
        | CF.Response
        | Promise<CF.Response>;
    };
  }

  ready(): Promise<Server<CF.ExportedHandlerFetchHandler>> {
    return Promise.resolve().then(() => this);
  }

  close() {
    return Promise.resolve();
  }
}

import type {
  CloudflareFetchHandler,
  Server,
  ServerOptions,
} from "../types.ts";
import type * as CF from "@cloudflare/workers-types";
import { wrapFetch } from "../_plugin.ts";

export const Response = globalThis.Response;

export function serve(
  options: ServerOptions,
): Server<CF.ExportedHandlerFetchHandler> {
  return new CloudflareServer(options);
}

class CloudflareServer implements Server<CloudflareFetchHandler> {
  readonly runtime = "cloudflare";
  readonly options: ServerOptions;
  readonly serveOptions: CF.ExportedHandler;
  readonly fetch: CF.ExportedHandlerFetchHandler;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = wrapFetch(
      this as unknown as Server,
      this.options.fetch,
    );

    this.fetch = (request, env, context) => {
      Object.defineProperty(request, "x", {
        enumerable: true,
        value: {
          runtime: "cloudflare",
          cloudflare: { env, context },
        },
      });
      return fetchHandler(request as unknown as Request) as unknown as
        | CF.Response
        | Promise<CF.Response>;
    };

    this.serveOptions = {
      fetch: this.fetch,
    };

    if (!options.manual) {
      this.serve();
    }
  }

  serve() {
    addEventListener("fetch", (event) => {
      // @ts-expect-error
      event.respondWith(this.fetch(event.request, {}, event));
    });
  }

  ready(): Promise<Server<CF.ExportedHandlerFetchHandler>> {
    return Promise.resolve().then(() => this);
  }

  close() {
    return Promise.resolve();
  }
}

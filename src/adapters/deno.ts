import type { Server, ServerHandler, ServerOptions } from "../types.ts";
import { fmtURL, resolvePort } from "../_utils.ts";
import { wrapFetch } from "../_plugin.ts";

export function serve(options: ServerOptions): Server {
  return new DenoServer(options);
}

// https://docs.deno.com/api/deno/~/Deno.serve

class DenoServer implements Server {
  readonly runtime = "deno";
  readonly options: ServerOptions;
  readonly deno: Server["deno"];
  readonly fetch: ServerHandler;

  #listeningPromise?: Promise<void>;
  #listeningInfo?: { hostname: string; port: number };

  constructor(options: ServerOptions) {
    this.options = options;

    const listenPromise = Promise.withResolvers<void>();
    this.#listeningPromise = listenPromise.promise;

    const fetchHandler = (this.fetch = wrapFetch(this, this.options.fetch));

    const server = Deno.serve(
      {
        port: resolvePort(
          this.options.port,
          (globalThis as any).Deno?.env.get("PORT"),
        ),
        hostname: this.options.hostname,
        reusePort: this.options.reusePort,
        ...this.options.deno,
        onListen: (info) => {
          if (this.options.deno?.onListen) {
            this.options.deno.onListen(info);
          }
          this.#listeningInfo = info;
          listenPromise.resolve();
        },
      },
      (request, info) => {
        Object.defineProperties(request, {
          deno: { value: { info, server }, enumerable: true },
          remoteAddress: {
            get: () => (info?.remoteAddr as Deno.NetAddr)?.hostname,
            enumerable: true,
          },
        });
        return fetchHandler(request);
      },
    );

    this.deno = { server };
  }

  get url() {
    return this.#listeningInfo
      ? fmtURL(this.#listeningInfo.hostname, this.#listeningInfo.port, false)
      : undefined;
  }

  ready(): Promise<Server> {
    return Promise.resolve(this.#listeningPromise).then(() => this);
  }

  close() {
    // TODO: closeAll is not supported
    return Promise.resolve(this.deno?.server?.shutdown());
  }
}

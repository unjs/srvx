import type { ServerOptions } from "../types.ts";
import { Server } from "../_server.ts";
import { resolvePort } from "../_common.ts";

export function serve(options: ServerOptions): Server {
  return new DenoServer(options);
}

// https://docs.deno.com/api/deno/~/Deno.serve

class DenoServer extends Server {
  readonly runtime = "deno";

  #listeningInfo?: { hostname: string; port: number };

  protected _listen() {
    const onListenPromise = Promise.withResolvers<void>();

    let serverFetch = this.fetch as Deno.ServeHandler;
    if (this.options.xRemoteAddress) {
      const userFetch = serverFetch as typeof this.fetch;
      serverFetch = (request, info) => {
        Object.defineProperty(request, "xRemoteAddress", {
          get: () => (info?.remoteAddr as Deno.NetAddr)?.hostname,
          enumerable: true,
        });
        return userFetch(request);
      };
    }

    this.denoServer = Deno.serve(
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
          onListenPromise.resolve();
        },
      },
      serverFetch,
    );
  }

  get port() {
    return this.#listeningInfo?.port ?? null;
  }

  get addr() {
    return this.#listeningInfo?.hostname ?? null;
  }

  close(_closeAll?: boolean /* TODO */) {
    this.denoServer?.shutdown();
  }
}

import type { ServerOptions } from "./types";
import type DenoTypes from "@deno/types";
import { Server } from "./server.ts";

export function serve(options: ServerOptions): Server {
  return new DenoServer(options);
}

// https://docs.deno.com/api/deno/~/Deno.serve

declare const Deno: typeof DenoTypes.Deno;

class DenoServer extends Server {
  readonly runtime = "deno";

  readonly denoServer: NonNullable<Server["denoServer"]>;

  #listeningInfo?: { hostname: string; port: number };

  constructor(options: ServerOptions) {
    super(options);

    const onListenPromise = Promise.withResolvers<void>(); // Supported since Deno 1.38
    this._listening = onListenPromise.promise;

    let serverFetch = options.fetch as DenoTypes.Deno.ServeHandler;
    if (options.xRemoteAddress) {
      const userFetch = serverFetch as typeof options.fetch;
      serverFetch = (request, info) => {
        Object.defineProperty(request, "xRemoteAddress", {
          get: () => info?.remoteAddr?.hostname,
          enumerable: true,
        });
        return userFetch(request);
      };
    }

    this.denoServer = Deno.serve(
      {
        port: resolvePort(options.port),
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
    this.denoServer.shutdown();
  }
}

function resolvePort(port: string | number | undefined): number {
  return (
    Number.parseInt(
      (port as string) ??
        ((globalThis as any).Deno as typeof DenoTypes.Deno)?.env?.get?.(
          "PORT",
        ) ??
        globalThis.process?.env?.PORT,
      10,
    ) ?? 3000
  );
}

import type { DenoFetchHandler, Server, ServerOptions } from "../types.ts";
import { fmtURL, resolvePort } from "../_utils.ts";
import { wrapFetch } from "../_plugin.ts";

export const Response = globalThis.Response;

export function serve(options: ServerOptions): DenoServer {
  return new DenoServer(options);
}

// https://docs.deno.com/api/deno/~/Deno.serve

class DenoServer implements Server<DenoFetchHandler> {
  readonly runtime = "deno";
  readonly options: ServerOptions;
  readonly deno: Server["deno"] = {};
  readonly serveOptions:
    | Deno.ServeTcpOptions
    | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem);
  readonly fetch: DenoFetchHandler;
  readonly isHttps: boolean;

  #listeningPromise?: Promise<void>;
  #listeningInfo?: { hostname: string; port: number };

  constructor(options: ServerOptions) {
    this.options = options;
    this.isHttps = !!options.https;

    const fetchHandler = wrapFetch(this, this.options.fetch);

    this.fetch = (request, info) => {
      Object.defineProperties(request, {
        deno: { value: { info, server: this.deno?.server }, enumerable: true },
        remoteAddress: {
          get: () => (info?.remoteAddr as Deno.NetAddr)?.hostname,
          enumerable: true,
        },
      });
      return fetchHandler(request);
    };

    this.serveOptions = {
      port: resolvePort(this.options.port, globalThis.Deno?.env.get("PORT")),
      hostname: this.options.hostname,
      reusePort: this.options.reusePort,
      ...this.options.deno,
    };

    // If HTTPS is enabled and key and cert are provided, use them
    if (
      this.isHttps &&
      this.options.https &&
      this.options.https.key &&
      this.options.https.cert
    ) {
      const key =
        this.options.https.inlineKey ||
        (this.options.https.key
          ? Deno.readTextFileSync(this.options.https.key)
          : "");

      const cert =
        this.options.https.inlineCert ||
        (this.options.https.cert
          ? Deno.readTextFileSync(this.options.https.cert)
          : "");

      this.serveOptions = {
        ...this.serveOptions,
        ...this.options.https,
        key: typeof key === "string" ? key : key.toString(),
        cert: typeof cert === "string" ? cert : cert.toString(),
      };
    }

    if (!options.manual) {
      this.serve();
    }
  }

  serve() {
    if (this.deno?.server) {
      return Promise.resolve(this.#listeningPromise).then(() => this);
    }
    const onListenPromise = Promise.withResolvers<void>();
    this.#listeningPromise = onListenPromise.promise;
    this.deno!.server = Deno.serve(
      {
        ...this.serveOptions,
        onListen: (info) => {
          this.#listeningInfo = info;
          if (this.options.deno?.onListen) {
            this.options.deno.onListen(info);
          }
          onListenPromise.resolve();
        },
      },
      this.fetch,
    );
    return Promise.resolve(this.#listeningPromise).then(() => this);
  }

  get url() {
    return this.#listeningInfo
      ? fmtURL(
          this.#listeningInfo.hostname,
          this.#listeningInfo.port,
          this.isHttps,
        )
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

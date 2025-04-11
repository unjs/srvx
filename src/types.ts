import type * as NodeHttp from "node:http";
import type * as NodeHttps from "node:https";
import type * as NodeNet from "node:net";
import type * as Bun from "bun";
import type * as CF from "@cloudflare/workers-types";

type MaybePromise<T> = T | Promise<T>;

// ----------------------------------------------------------------------------
// srvx API
// ----------------------------------------------------------------------------

export declare const Response: typeof globalThis.Response;

/**
 * Create a new server instance.
 */
export declare function serve(options: ServerOptions): Server;

/**
 * Web fetch compatible request handler
 */
export type ServerHandler = (request: ServerRequest) => MaybePromise<Response>;

/**
 * Server options
 */
export interface ServerOptions {
  /**
   * The fetch handler handles incoming requests.
   */
  fetch: ServerHandler;

  /**
   * Server plugins.
   */
  plugins?: (ServerPlugin | ServerPluginInstance)[];

  /**
   * If set to `true`, server will not start listening automatically.
   */
  manual?: boolean;

  /**
   * The port server should be listening to.
   *
   * Default is read from `PORT` environment variable or will be `3000`.
   *
   * **Tip:** You can set the port to `0` to use a random port.
   */
  port?: string | number;

  /**
   * The hostname (IP or resolvable host) server listener should bound to.
   *
   * When not provided, server with listen to all network interfaces by default.
   *
   * **Important:** If you are running a server that is not expected to be exposed to the network, use `hostname: "localhost"`.
   */
  hostname?: string;

  /**
   * Enabling this option allows multiple processes to bind to the same port, which is useful for load balancing.
   *
   * **Note:** Despite Node.js built-in behavior that has `exclusive` flag (opposite of `reusePort`) enabled by default, srvx uses non-exclusive mode for consistency.
   */
  reusePort?: boolean;

  /**
   * The protocol to use for the server.
   *
   * Possible values are `http` and `https`.
   *
   * If `protocol` is not set, Server will use `http` as the default protocol or `https` if both `tls.cert` and `tls.key` options are provided.
   */
  protocol?: "http" | "https";

  /**
   * TLS server options.
   */
  tls?: {
    /**
     * File path or inlined TLS certificate in PEM format (required).
     */
    cert?: string;

    /**
     * File path or inlined TLS private key in PEM format (required).
     */
    key?: string;

    /**
     * Passphrase for the private key (optional).
     */
    passphrase?: string;
  };

  /**
   * Runtime agnostic error handler (optional).
   *
   * @note This handler will take precedence over runtime specific error handlers.
   */
  onError?: (error: Error) => MaybePromise<Response>;

  /**
   * Node.js server options.
   */
  node?: (NodeHttp.ServerOptions | NodeHttps.ServerOptions) &
    NodeNet.ListenOptions;

  /**
   * Bun server options
   *
   * @docs https://bun.sh/docs/api/http
   */
  bun?: Omit<Bun.ServeOptions | Bun.TLSServeOptions, "fetch">;

  /**
   * Deno server options
   *
   * @docs https://docs.deno.com/api/deno/~/Deno.serve
   */
  deno?: Deno.ServeOptions;
}

export interface Server<Handler = ServerHandler> {
  /**
   * Current runtime name
   */
  readonly runtime: "node" | "deno" | "bun" | "cloudflare";

  /**
   * Server options
   */
  readonly options: ServerOptions;

  /**
   * Server URL address.
   */
  readonly url?: string;

  /**
   * Node.js context.
   */
  readonly node?: {
    server?: NodeHttp.Server;
    handler: (
      nodeReq: NodeHttp.IncomingMessage,
      nodeRes: NodeHttp.ServerResponse,
    ) => void | Promise<void>;
  };

  /**
   * Bun context.
   */
  readonly bun?: { server?: Bun.Server };

  /**
   * Deno context.
   */
  readonly deno?: { server?: Deno.HttpServer };

  /**
   * Server fetch handler
   */
  readonly fetch: Handler;

  /**
   * Returns a promise that resolves when the server is ready.
   */
  ready(): Promise<Server<Handler>>;

  /**
   * Stop listening to prevent new connections from being accepted.
   *
   * By default, it does not cancel in-flight requests or websockets. That means it may take some time before all network activity stops.
   *
   * @param closeActiveConnections Immediately terminate in-flight requests, websockets, and stop accepting new connections.
   * @default false
   */
  close(closeActiveConnections?: boolean): Promise<void>;
}

// ----------------------------------------------------------------------------
// Plugins
// ----------------------------------------------------------------------------

export type ServerPlugin = (server: Server) => ServerPluginInstance;

export interface ServerPluginInstance {
  /**
   * Plugin display name
   */
  name?: string;

  /**
   * Hook to allow running logic before user fetch handler
   * If an response value is returned, user fetch handler and the next plugins will be skipped.
   */
  request?: (request: ServerRequest) => MaybePromise<Response | void>;

  /**
   * Hook to allow running logic after user fetch handler
   * If a response value is returned, user response and the next plugins will be skipped.
   */
  response?: (
    request: ServerRequest,
    response: Response,
  ) => MaybePromise<void | Response>;
}

// ----------------------------------------------------------------------------
// Request with runtime addons.
// ----------------------------------------------------------------------------

export interface ServerRuntimeContext {
  runtime: "node" | "deno" | "bun" | "cloudflare" | (string & {});

  /**
   * IP address of the client.
   */
  ip?: string | undefined;

  /**
   * Underlying Node.js server request info.
   */
  node?: {
    req: NodeHttp.IncomingMessage;
    res?: NodeHttp.ServerResponse;
  };

  /**
   * Underlying Deno server request info.
   */
  deno?: {
    info: Deno.ServeHandlerInfo<Deno.NetAddr>;
  };

  /**
   * Underlying Bun server request context.
   */
  bun?: {
    server: Bun.Server;
  };

  /**
   * Underlying Cloudflare request context.
   */
  cloudflare?: {
    env: unknown;
    context: CF.ExecutionContext;
  };
}

export interface ServerRequest extends Request {
  /**
   * Runtime specific request context.
   */
  x?: ServerRuntimeContext;
}

// ----------------------------------------------------------------------------
// Different handler types
// ----------------------------------------------------------------------------

export type FetchHandler = (request: Request) => Response | Promise<Response>;

export type BunFetchHandler = (
  request: Request,
  server?: Bun.Server,
) => Response | Promise<Response>;

export type DenoFetchHandler = (
  request: Request,
  info?: Deno.ServeHandlerInfo<Deno.NetAddr>,
) => Response | Promise<Response>;

export type NodeHttpHandler = (
  nodeReq: NodeHttp.IncomingMessage,
  nodeRes: NodeHttp.ServerResponse,
) => void | Promise<void>;

export type CloudflareFetchHandler = CF.ExportedHandlerFetchHandler;

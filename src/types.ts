import type * as NodeHttp from "node:http";
import type * as NodeNet from "node:net";
import type * as Bun from "bun";

import type { Server } from "./server.ts";

export type { Server } from "./server.ts";

type MaybePromise<T> = T | Promise<T>;

// ----------------------------------------------------------------------------
// srvx API
// ----------------------------------------------------------------------------

/**
 * Create a new server instance.
 */
export declare function serve(options: ServerOptions): Server;

/**
 * Web fetch compatible request handler
 */
export type ServerHandler = (request: xRequest) => MaybePromise<Response>;

/**
 * Server options
 */
export interface ServerOptions {
  /**
   * The fetch handler handles incoming requests.
   */
  fetch: ServerHandler;

  /**
   * Server plugins
   */
  plugins?: (ServerPlugin | ServerPluginInstance)[];

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
   * If this option is enabled, `request.xRemoteAddress` will be available.
   *  **Example:**
   *
   *  ```js
   *  serve({
   *   port: 3000,
   *    xRemoteAddress: true,
   *    fetch: (request) =>
   *      new Response(`Your ip address is ${request.xRemoteAddress}`),
   *  });
   * ```
   * **Note:** In order to to provide cross-runtime consistency, a small wrapper function will be enabled for Deno and Bun runtimes if `xRemoteAddress` option is set.
   */
  xRemoteAddress?: boolean;

  /**
   * Node.js http server options.
   */
  node?: NodeHttp.ServerOptions & NodeNet.ListenOptions;

  /**
   * Bun server options
   *
   * @docs https://bun.sh/docs/api/http
   */
  bun?: Omit<Bun.ServeOptions, "fetch">;

  /**
   * Deno server options
   *
   * @docs https://docs.deno.com/api/deno/~/Deno.serve
   */
  deno?: Deno.ServeOptions;
}

// ----------------------------------------------------------------------------
// Plugins
// ----------------------------------------------------------------------------

export type ServerPlugin = (
  server: Server,
) => MaybePromise<ServerPluginInstance>;

export interface ServerPluginInstance {
  /**
   * Plugin display name
   */
  name?: string;

  /**
   * Hook to allow running logic before user fetch handler
   * If an response value is returned, user fetch handler and the next plugins will be skipped.
   */
  request?: (request: xRequest) => MaybePromise<Response | void>;

  /**
   * Hook to allow running logic after user fetch handler
   * If a response value is returned, user response and the next plugins will be skipped.
   */
  response?: (
    request: xRequest,
    response: Response,
  ) => MaybePromise<void | Response>;
}

// ----------------------------------------------------------------------------
// Web-platform compatible types
// - Possible runtime specific augmentations are removed.
// - Runtime specific types are namespaces as optional keys.
// ----------------------------------------------------------------------------

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Headers
 */
export type xHeaders = Omit<
  Headers,
  "count" | "toJSON" | "getAll" /* bun specific */
>;

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Request
 */
export interface xRequest extends Omit<Request, "headers" | "clone"> {
  headers: xHeaders;
  clone(): xRequest;

  xNode?: {
    req: NodeHttp.IncomingMessage;
    res: NodeHttp.ServerResponse;
  };

  /**
   * Remote address of the client.
   */
  xRemoteAddress?: string | null;

  /** Optional user context */
  xContext?: Record<string, unknown>;
}

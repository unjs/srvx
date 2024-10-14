import type * as NodeHttp from "node:http";
import type BunTypes from "bun";
import type { Deno } from "@deno/types";
import type { ServerHandler, ServerOptions } from "./types.ts";
import { applyPlugins } from "./_plugin.ts";

export abstract class Server {
  /**
   * Current listening runtime name
   */
  abstract readonly runtime: "node" | "deno" | "bun";

  /**
   * Node.js listening server instance.
   */
  nodeServer?: NodeHttp.Server;

  /**
   * Bun listening server instance.
   */
  bunServer?: BunTypes.Server;

  /**
   * Deno listening server instance.
   */
  denoServer?: Deno.HttpServer;

  #listening: undefined | Promise<void>;

  /**
   * Server options
   */
  options: Omit<ServerOptions, "fetch">;

  /**
   * Server fetch handler
   */
  fetch: ServerHandler;

  constructor(options: ServerOptions) {
    this.options = options;
    this.fetch = options.fetch;
    this.#listening = applyPlugins(this).then(() => this._listen());
  }

  protected abstract _listen(): void | Promise<void>;

  /**
   * Listening address (hostname or IP).
   */
  abstract readonly addr: string | null;

  /**
   * Listening port.
   */
  abstract readonly port: number | null;

  /**
   * Listening URL.
   */
  get url() {
    let addr = this.addr;
    const port = this.port;
    if (!addr || !port) {
      return null;
    }
    if (addr.includes(":")) {
      addr = `[${addr}]`;
    }
    return `http://${addr}:${port}/`;
  }

  /**
   * Returns a promise that resolves when the server is ready.
   */
  ready(): Promise<Server> {
    return Promise.resolve(this.#listening).then(() => this);
  }

  /**
   * Stop listening to prevent new connections from being accepted.
   *
   * By default, it does not cancel in-flight requests or websockets. That means it may take some time before all network activity stops.
   *
   * @param closeActiveConnections Immediately terminate in-flight requests, websockets, and stop accepting new connections.
   * @default false
   */
  abstract close(closeActiveConnections?: boolean): void | Promise<void>;
}

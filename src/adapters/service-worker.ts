import type { Server, ServerOptions, ServerRequest } from "../types.ts";
import { wrapFetch } from "../_plugin.ts";

export const Response: typeof globalThis.Response = globalThis.Response;

export type ServiceWorkerHandler = (
  request: ServerRequest,
  event: FetchEvent,
) => Response | Promise<Response>;

export function serve(options: ServerOptions): Server<ServiceWorkerHandler> {
  return new ServiceWorkerServer(options);
}

class ServiceWorkerServer implements Server<ServiceWorkerHandler> {
  readonly runtime = "service-worker";
  readonly options: ServerOptions;
  readonly fetch: ServiceWorkerHandler;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = wrapFetch(
      this as unknown as Server,
      this.options.fetch,
    );

    this.fetch = (request: Request, event: FetchEvent) => {
      Object.defineProperties(request, {
        runtime: {
          enumerable: true,
          value: { runtime: "service-worker", serviceWorker: { event } },
        },
      });
      return Promise.resolve(fetchHandler(request));
    };

    if (!options.manual) {
      this.serve();
    }
  }

  serve() {
    // Listen for the 'fetch' event to handle requests
    addEventListener("fetch", async (event) => {
      // skip if event url ends with file with extension
      if (/\/[^/]*\.[a-zA-Z0-9]+$/.test(new URL(event.request.url).pathname)) {
        return;
      }
      const response = await this.fetch(event.request, event);
      if (response.status !== 404) {
        event.respondWith(response);
      }
    });

    // Listen for the 'install' event to update the service worker
    globalThis.addEventListener("install", () => {
      (globalThis as any).skipWaiting(); // Force the waiting service worker to become active
    });

    // Listen for the 'activate' event to claim clients
    globalThis.addEventListener("activate", (event) => {
      (event as FetchEvent).waitUntil((globalThis as any).clients?.claim?.()); // Take control of uncontrolled clients
    });
  }

  ready(): Promise<Server<ServiceWorkerHandler>> {
    return Promise.resolve().then(() => this);
  }

  close() {
    return Promise.resolve();
  }
}

import type { Server, ServerOptions, ServerRequest } from "../types.ts";
import { wrapFetch } from "../_plugin.ts";
import { wrapFetchOnError } from "../_error.ts";

export const Response: typeof globalThis.Response = globalThis.Response;

export type ServiceWorkerHandler = (
  request: ServerRequest,
  event: FetchEvent,
) => Response | Promise<Response>;

const isMainThread = () =>
  typeof navigator !== "undefined" && "serviceWorker" in navigator;

export function serve(options: ServerOptions): Server<ServiceWorkerHandler> {
  return new ServiceWorkerServer(options);
}

class ServiceWorkerServer implements Server<ServiceWorkerHandler> {
  readonly runtime = "service-worker";
  readonly options: ServerOptions;
  readonly fetch: ServiceWorkerHandler;

  #fetchListener?: (event: FetchEvent) => void | Promise<void>;
  #listeningPromise?: Promise<any>;

  constructor(options: ServerOptions) {
    this.options = options;

    const fetchHandler = wrapFetch(
      this as unknown as Server,
      wrapFetchOnError(this.options.fetch, this.options.onError),
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
    if (isMainThread()) {
      const swURL = this.options.serviceWorker?.url;
      if (!swURL) {
        throw new Error(
          "Service worker URL is not provided. Please set the `serviceWorker.url` serve option or manually register.",
        );
      }
      // Not a service worker, so self-register the service worker
      this.#listeningPromise = navigator.serviceWorker
        .register(swURL, {
          type: "module",
          scope: this.options.serviceWorker?.scope,
        })
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            location.replace(location.href);
          });
        });
      return;
    }

    // Listen for the 'fetch' event to handle requests
    this.#fetchListener = async (event) => {
      // skip if event url ends with file with extension
      if (/\/[^/]*\.[a-zA-Z0-9]+$/.test(new URL(event.request.url).pathname)) {
        return;
      }
      const response = await this.fetch(event.request, event);
      if (response.status !== 404) {
        event.respondWith(response);
      }
    };
    addEventListener("fetch", this.#fetchListener);

    // Listen for the 'install' event to update the service worker
    globalThis.addEventListener("install", () => {
      // Force the waiting service worker to become active
      (globalThis as any).skipWaiting();
    });

    // Listen for the 'activate' event to claim clients
    globalThis.addEventListener("activate", (event) => {
      // Take control of uncontrolled clients
      (event as FetchEvent).waitUntil((globalThis as any).clients?.claim?.());
    });
  }

  ready(): Promise<Server<ServiceWorkerHandler>> {
    return Promise.resolve(this.#listeningPromise).then(() => this);
  }

  async close() {
    if (this.#fetchListener) {
      removeEventListener("fetch", this.#fetchListener!);
    }

    // unregister the service worker
    if (isMainThread()) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (registration.active) {
          await registration.unregister();
        }
      }
    } else {
      await (globalThis as any).registration.unregister();
    }
  }
}

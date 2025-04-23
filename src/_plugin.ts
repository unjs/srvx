import type {
  ServerPluginInstance,
  Server,
  ServerRequest,
  ServerHandler,
} from "./types.ts";

export function wrapFetch(
  server: Server,
  fetchHandler: ServerHandler,
): ServerHandler {
  const plugins = server.options.plugins;

  if (!plugins?.length) {
    return fetchHandler;
  }

  const requestHooks: NonNullable<ServerPluginInstance["request"]>[] = [];
  const responseHooks: NonNullable<ServerPluginInstance["response"]>[] = [];

  for (const ctor of plugins) {
    const plugin = typeof ctor === "function" ? ctor(server) : ctor;
    if (plugin.request) {
      requestHooks.push(plugin.request);
    }
    if (plugin.response) {
      responseHooks.push(plugin.response);
    }
  }

  const hasRequestHooks = requestHooks.length > 0;
  const hasResponseHooks = responseHooks.length > 0;

  if (!hasRequestHooks && !hasResponseHooks) {
    return fetchHandler;
  }

  return (request: ServerRequest) => {
    let resValue: undefined | Response;
    let resPromise: undefined | Promise<Response | void>;

    // Request hooks
    if (hasRequestHooks) {
      for (const reqHook of requestHooks) {
        if (resPromise) {
          resPromise = resPromise.then((res) => res || reqHook(request));
        } else {
          const res = reqHook(request);
          if (res) {
            if (res instanceof Promise) {
              resPromise = res;
            } else {
              return res;
            }
          }
        }
      }
    }

    // User handler
    if (resPromise) {
      resPromise = resPromise.then((res) => res || fetchHandler(request));
    } else {
      const res = fetchHandler(request);
      if (res instanceof Promise) {
        resPromise = res;
      } else {
        resValue = res;
      }
    }

    // Response hooks
    if (hasResponseHooks) {
      for (const resHook of responseHooks) {
        if (resPromise) {
          resPromise = resPromise.then((res) => {
            if (res) {
              resValue = res;
            }
            return resHook(request, resValue!);
          });
        } else {
          const res = resHook(request, resValue!);
          if (res) {
            if (res instanceof Promise) {
              resPromise = res;
            } else {
              resValue = res;
            }
          }
        }
      }
    }

    return (
      resPromise ? resPromise.then((res) => res || resValue) : resValue
    ) as Response | Promise<Response>;
  };
}

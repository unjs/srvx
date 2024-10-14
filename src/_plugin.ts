import type { ServerPluginInstance, ServerOptions, Server } from "./types.ts";

export async function applyPlugins(server: Server) {
  const options = server.options as ServerOptions;

  if (!options.plugins?.length) {
    return;
  }

  const requestHooks: NonNullable<ServerPluginInstance["request"]>[] = [];
  const responseHooks: NonNullable<ServerPluginInstance["response"]>[] = [];

  for (const ctor of options.plugins) {
    const plugin = typeof ctor === "function" ? await ctor(server) : ctor;
    if (plugin.request) {
      requestHooks.push(plugin.request);
    }
    if (plugin.response) {
      responseHooks.push(plugin.response);
    }
  }

  const hasRequestHooks = requestHooks.length > 0;
  const hasResponseHooks = responseHooks.length > 0;

  if (hasRequestHooks || hasResponseHooks) {
    server.fetch = (request) => {
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
        resPromise = resPromise.then((res) => res || options.fetch(request));
      } else {
        const res = options.fetch(request);
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
}

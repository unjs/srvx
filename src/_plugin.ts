import type {
  Server,
  ServerRequest,
  ServerHandler,
  ServerMiddleware,
  ServerPlugin,
} from "./types.ts";

export function wrapFetch(
  server: Server,
  basePlugins?: ServerPlugin[],
): ServerHandler {
  const plugins = [
    ...(basePlugins || []),
    ...(server.options.plugins || []),
  ].map((plugin) => (typeof plugin === "function" ? plugin(server) : plugin));

  const middleware = plugins
    .filter((plugin) => plugin.fetch)
    .map((plugin) => plugin.fetch!);

  const fetchHandler = server.options.fetch;

  return middleware.length === 0
    ? fetchHandler
    : (request) => callMiddleware(request, fetchHandler, middleware, 0);
}

function callMiddleware(
  request: ServerRequest,
  fetchHandler: ServerHandler,
  middleware: ServerMiddleware[],
  index: number,
): Response | Promise<Response> {
  if (index === middleware.length) {
    return fetchHandler(request);
  }
  return middleware[index](request, () =>
    callMiddleware(request, fetchHandler, middleware, index + 1),
  );
}

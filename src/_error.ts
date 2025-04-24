import type { ServerPlugin } from "./types.ts";

export const errorPlugin: ServerPlugin = (server) => {
  const errorHandler = server.options.onError;
  if (!errorHandler) {
    return {};
  }
  return {
    fetch(_request, next) {
      try {
        const res = next();
        return res instanceof Promise
          ? res.catch((error) => errorHandler(error))
          : res;
      } catch (error) {
        return errorHandler(error);
      }
    },
  };
};

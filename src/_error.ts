import type { ErrorHandler, ServerHandler } from "./types.ts";

export function wrapFetchOnError(
  fetchHandler: ServerHandler,
  onError?: ErrorHandler,
): ServerHandler {
  if (!onError) return fetchHandler;
  return (...params) => {
    try {
      const result = fetchHandler(...params);
      if (result instanceof Promise) {
        return result.catch(onError);
      }
      return result;
    } catch (error) {
      return onError(error as Error);
    }
  };
}

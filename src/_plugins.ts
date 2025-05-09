import type { ServerPlugin } from "./types.ts";

export const errorPlugin: ServerPlugin = (server) => {
  const errorHandler = server.options.error;
  if (!errorHandler) return;
  server.options.middleware ??= [];
  server.options.middleware.unshift((_req, next) => {
    try {
      const res = next();
      return res instanceof Promise
        ? res.catch((error) => errorHandler(error))
        : res;
    } catch (error) {
      return errorHandler(error);
    }
  });
};

export const wsUpgradePlugin: ServerPlugin = (server) => {
  const upgradeHandler = server.options.upgrade;
  if (!upgradeHandler) {
    return;
  }
  server.options.middleware ??= [];
  server.options.middleware.unshift((req, next) => {
    if (req.headers.get("upgrade") === "websocket") {
      return upgradeHandler(req);
    }
    return next();
  });
};

import type { ServerPlugin } from "./types.ts";

export const wsUpgradePlugin: ServerPlugin = (server) => {
  const upgradeHandler = server.options.upgrade;
  if (!upgradeHandler) {
    return {};
  }
  return {
    fetch(request, next) {
      if (request.headers.get("upgrade") === "websocket") {
        return upgradeHandler(request);
      }
      return next();
    },
  };
};

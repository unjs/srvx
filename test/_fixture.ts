import { serve } from "srvx";

export const server = serve({
  port: globalThis.process?.env.PORT || globalThis.Deno?.env.get("PORT") || 0,
  hostname: "localhost",
  xRemoteAddress: true,
  fetch(_request) {
    return new Response("ok");
  },
});

await server.ready();

// console.log(`Listening on ${server.url}`);

import { serve } from "srvx";

const server = await serve({
  port: 3000,
  silent: true,
  fetch() {
    return new Response("Hello!");
  },
});

await server.ready();

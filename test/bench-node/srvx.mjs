import { serve } from "srvx";

const server = await serve({
  port: 3000,
  fetch() {
    return new Response("Hello!");
  },
});

await server.ready();

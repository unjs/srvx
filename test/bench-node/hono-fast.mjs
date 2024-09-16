import { serve } from "@hono/node-server";

serve({
  overrideGlobalObjects: true,
  fetch() {
    return new Response("Hello!");
  },
});

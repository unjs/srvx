import { serve } from "@hono/node-server";

serve({
  overrideGlobalObjects: false,
  fetch() {
    return new Response("Hello!");
  },
});

import { serve, Response } from "srvx";

serve({
  port: 3000,
  fetch() {
    return new Response("Hello!");
  },
});

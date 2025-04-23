import { serve } from "../node_modules/srvx/dist/adapters/service-worker.mjs";
// import { serve } from "https://esm.sh/srvx@0.5";

serve({
  serviceWorker: { url: import.meta.url },
  fetch(_request) {
    return new Response(`<h1>👋 Hello there!</h1>`, {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  },
});

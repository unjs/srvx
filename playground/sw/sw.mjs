import { serve } from "../node_modules/srvx/dist/adapters/service-worker.mjs";

serve({
  serviceWorker: { url: import.meta.url },
  fetch(_request) {
    return new Response(
      `
        <h1>👋 Hello there!</h1>
        Learn more: <a href="https://srvx.h3.dev/" target="_blank">srvx.h3.dev</a>
      `,
      {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
        },
      },
    );
  },
});

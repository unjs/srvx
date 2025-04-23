// import { serve } from "../node_modules/srvx/dist/adapters/service-worker.mjs";
import { serve } from "https://esm.sh/srvx@0.5";

serve({
  serviceWorker: { url: import.meta.url },
  fetch(_request) {
    return new Response(
      /*html*/ `
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

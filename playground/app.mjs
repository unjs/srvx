import { serve } from "srvx";

serve({
  // protocol: "https",
  tls: { cert: "server.crt", key: "server.key" },
  port: 3000,
  fetch(_request) {
    return new Response(
      `
        <h1>👋 Hello there</h1>
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

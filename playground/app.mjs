import { serve } from "srvx";

serve({
  protocol: "http2",
  tls: { cert: "server.crt", key: "server.key" },
  fetch(_request) {
    return new Response(
      /*html */ `
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
  error(error) {
    return new Response(
      /*html */ `<body style="background-color:blue;color:white;padding:2em;"><pre>${error.stack || error}</pre></body>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  },
});

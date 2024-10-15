import { serve } from "srvx";

const server = serve({
  port: 3000,
  fetch(request) {
    return new Response(
      `
        <h1>👋 Hello there</h1>
        Learn more: <a href="https://srvx.unjs.io/" target="_blank">srvx.unjs.io</a>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  },
});

await server.ready();
console.log(`🚀 Server ready at ${server.url}`);

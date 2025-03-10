import { serve } from "srvx";

export default serve({
  port: 3000,
  fetch(_request) {
    return new Response(
      `
        <h1>👋 Hello there</h1>
        Learn more: <a href="https://srvx.unjs.io/" target="_blank">srvx.unjs.io</a>
      `,
      {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
        },
      },
    );
  },
});

// server.ready().then(() => console.log(`🚀 Server ready at ${server.url}`))

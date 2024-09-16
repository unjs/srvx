import { serve } from "srvx";

const server = serve({
  remoteAddress: true,
  fetch(request) {
    return new Response(
      /* html */ `
        <h1>👋 Hello there</h1>
        <p>You are visiting <code>${request.url}</code> from <code>${request.remoteAddress}</code></p>
        <hr>
        Runtime: ${server.runtime}
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  },
});

console.log(`🚀 Server ready at ${server.url} (runtime: ${server.runtime})`);

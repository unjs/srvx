import type { ServerPlugin } from "../src/types.ts";

// prettier-ignore
const runtime = (globalThis as any).Deno ? "deno" : (globalThis.Bun ? "bun" : "node");
const { serve } = (await import(
  `../src/${runtime}.ts`
)) as typeof import("../src/types.ts");

const logger: ServerPlugin = (server) => {
  console.log(`Logger plugin enabled for ${server.runtime}`);
  return {
    name: "logger",
    request: (req) => {
      console.log(`[request] [${req.method}] ${req.url}`);
    },
    response: (req, res) => {
      console.log(
        `[response] [${req.method}] ${req.url} ${res.status} ${res.statusText}`,
      );
    },
  };
};

export const server = serve({
  xRemoteAddress: true,
  plugins: [logger],
  fetch(request) {
    return new Response(
      /* html */ `
        <h1>👋 Hello there</h1>
        <p>You are visiting <code>${request.url}</code> from <code>${request.xRemoteAddress}</code></p>
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

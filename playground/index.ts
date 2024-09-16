// prettier-ignore
const runtime = (globalThis as any).Deno ? "deno" : (globalThis.Bun ? "bun" : "node");
const { serve } = (await import(
  `../src/${runtime}.ts`
)) as typeof import("../src/types.ts");

export const server = serve({
  xRemoteAddress: true,
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

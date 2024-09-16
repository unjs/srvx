// prettier-ignore
const runtime = (globalThis as any).Deno ? "deno" : (globalThis.Bun ? "bun" : "node");
const { serve } = (await import(
  `../src/${runtime}.ts`
)) as typeof import("../src/types.ts");

export const server = serve({
  port:
    globalThis.process?.env.PORT ||
    (globalThis as any).Deno?.env.get("PORT") ||
    0,
  hostname: "localhost",
  xRemoteAddress: true,
  fetch(_req) {
    return new Response("ok");
  },
});

await server.ready();

// console.log(`Listening on ${server.url}`);

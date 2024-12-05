import type { ServerPlugin } from "../src/types.ts";

// prettier-ignore
const runtime = (globalThis as any).Deno ? "deno" : (globalThis.Bun ? "bun" : "node");
const { serve } = (await import(
  `../src/${runtime}.ts`
)) as typeof import("../src/types.ts");

export const server = serve({
  hostname: "localhost",
  xRemoteAddress: true,
  plugins: [false, true].map(
    (withBody) =>
      (() => ({
        request: (req) => {
          if (req.headers.has("x-plugin-req")) {
            const res = withBody ? new Response("plugin req") : undefined;
            return req.headers.has("x-plugin-async")
              ? Promise.resolve(res)
              : res;
          }
        },
        response: (req) => {
          if (req.headers.has("x-plugin-res")) {
            const res = withBody ? new Response("plugin res") : undefined;
            return req.headers.has("x-plugin-async")
              ? Promise.resolve(res)
              : res;
          }
        },
      })) satisfies ServerPlugin,
  ),
  async fetch(req) {
    const Response =
      (globalThis as any).TEST_RESPONSE_CTOR || globalThis.Response;

    const url = new URL(req.url);
    switch (url.pathname) {
      case "/": {
        return new Response("ok");
      }
      case "/body/binary": {
        return new Response(req.body);
      }
      case "/body/text": {
        return new Response(await req.text());
      }
      case "/ip": {
        return new Response(`ip: ${req.xRemoteAddress}`);
      }
    }
    return new Response("404", { status: 404 });
  },
});

await server.ready();

// console.log(`Listening on ${server.url}`);

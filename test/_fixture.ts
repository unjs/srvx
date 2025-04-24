import type { Server } from "../src/types.ts";

// prettier-ignore
const runtime = (globalThis as any).Deno ? "deno" : (globalThis.Bun ? "bun" : "node");
const { serve } = (await import(
  `../src/adapters/${runtime}.ts`
)) as typeof import("../src/types.ts");

export const server: Server = serve({
  hostname: "localhost",
  plugins: [
    {
      fetch(req, next) {
        if (req.headers.has("X-plugin-req")) {
          return new Response("response from req plugin");
        }
        return next();
      },
    },
    {
      async fetch(req, next) {
        if (!req.headers.has("X-plugin-res")) {
          return next();
        }
        const res = await next();
        res.headers.set("x-plugin-header", "1");
        return res;
      },
    },
  ],

  async error(err) {
    return new Response(`error: ${(err as Error).message}`, { status: 500 });
  },
  async fetch(req) {
    const Response =
      (globalThis as any).TEST_RESPONSE_CTOR || globalThis.Response;

    const url = new URL(req.url);
    switch (url.pathname) {
      case "/": {
        return new Response("ok");
      }
      case "/headers": {
        // Trigger Node.js writeHead slowpath to reproduce https://github.com/h3js/srvx/pull/40
        req.runtime?.node?.res?.setHeader("x-set-with-node", "");
        const resHeaders = new Headers();
        for (const [key, value] of req.headers) {
          resHeaders.append(`x-req-${key}`, value);
        }
        return Response.json(
          {
            ...Object.fromEntries(req.headers.entries()),
            unsetHeader: req.headers.get("" + Math.random()), // #44
          },
          {
            headers: resHeaders,
          },
        );
      }
      case "/body/binary": {
        return new Response(req.body);
      }
      case "/body/text": {
        return new Response(await req.text());
      }
      case "/ip": {
        return new Response(`ip: ${req.ip}`);
      }
      case "/req-instanceof": {
        return new Response(req instanceof Request ? "yes" : "no");
      }
      case "/req-headers-instanceof": {
        return new Response(req.headers instanceof Headers ? "yes" : "no");
      }
      case "/error": {
        throw new Error("test error");
      }
    }
    return new Response("404", { status: 404 });
  },
});

await server.ready();

// console.log(`Listening on ${server.url}`);

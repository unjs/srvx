import type { ServerOptions } from "../src/types.ts";

// prettier-ignore
const runtime = (globalThis as any).Deno ? "deno" : (globalThis.Bun ? "bun" : "node");
const { serve } = (await import(
  `../src/adapters/${runtime}.ts`
)) as typeof import("../src/types.ts");

export const fixture: (
  opts?: Partial<ServerOptions>,
  _Response?: typeof globalThis.Response,
) => ServerOptions = (opts, _Response = globalThis.Response) => ({
  ...opts,
  hostname: "localhost",
  plugins: [
    {
      fetch(req, next) {
        if (req.headers.has("X-plugin-req")) {
          return new _Response("response from req plugin");
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
    return new _Response(`error: ${(err as Error).message}`, { status: 500 });
  },

  async fetch(req) {
    const url = new URL(req.url);
    switch (url.pathname) {
      case "/": {
        return new _Response("ok");
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
        return new _Response(req.body);
      }
      case "/body/text": {
        return new _Response(await req.text());
      }
      case "/ip": {
        return new _Response(`ip: ${req.ip}`);
      }
      case "/req-instanceof": {
        return new _Response(req instanceof Request ? "yes" : "no");
      }
      case "/req-headers-instanceof": {
        return new _Response(req.headers instanceof Headers ? "yes" : "no");
      }
      case "/error": {
        throw new Error("test error");
      }
      case "/stream": {
        return new _Response("chunk1\nchunk2\nchunk3");
      }
      
    }
    return new _Response("404", { status: 404 });
  },
});

if (import.meta.main) {
  const server = serve(fixture({}));
  await server.ready();
}

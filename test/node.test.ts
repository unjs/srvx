import { describe, beforeAll, afterAll } from "vitest";
import { fetch, Agent } from "undici";
import { addTests, addStreamingTests } from "./_tests.ts";
import { serve, FastResponse } from "../src/adapters/node.ts";
import { getTLSCert } from "./_utils.ts";
import { fixture } from "./_fixture.ts";

const tls = await getTLSCert();
const getHttp2Client = () => {
  // https://undici.nodejs.org/#/docs/api/Client.md?id=parameter-clientoptions
  // https://github.com/nodejs/undici/issues/2750#issuecomment-1941009554
  const h2Agent = new Agent({ allowH2: true, connect: { ...tls } });
  const fetchWithHttp2 = ((input: any, init?: any) =>
    fetch(input, {
      ...init,
      dispatcher: h2Agent,
    })) as unknown as typeof globalThis.fetch;

  return { fetchWithHttp2, h2Agent };
};

const testConfigs = [
  {
    name: "http1",
    Response: globalThis.Response,
  },
  {
    name: "http1, FastResponse",
    Response: FastResponse,
  },
  {
    name: "http2",
    Response: globalThis.Response,
    useHttp2Agent: true,
    serveOptions: { tls, node: { http2: true, allowHTTP1: false } },
  },
  {
    name: "http2, FastResponse",
    Response: FastResponse,
    useHttp2Agent: true,
    serveOptions: { tls, node: { http2: true, allowHTTP1: false } },
  },
];

for (const config of testConfigs) {
  describe.sequential(`node (${config.name})`, () => {
    const { fetchWithHttp2, h2Agent } = getHttp2Client();
    let server: ReturnType<typeof serve> | undefined;

    beforeAll(async () => {
      server = serve(
        fixture({
          port: 0,
          ...config.serveOptions,
        }),
      );
      await server!.ready();
    });

    afterAll(async () => {
      await h2Agent.close();
      await server!.close();
    });

    addTests({
      url: (path) => server!.url! + path.slice(1),
      runtime: "node",
      fetch: config.useHttp2Agent ? fetchWithHttp2 : undefined,
    });
  });
}

describe.sequential("node (http2, stream)", () => {
  let server: ReturnType<typeof serve> | undefined;
  const { fetchWithHttp2, h2Agent } = getHttp2Client();

  beforeAll(async () => {
    server = serve(
      fixture({
        port: 0,
        hostname: "localhost",
        node: { http2: true },
        tls,
      }),
    );

    await server!.ready();
  });

  afterAll(async () => {
    await h2Agent.close();
    await server!.close();
  });

  addStreamingTests({
    url: (path) => server!.url! + path.slice(1),
    fetch: fetchWithHttp2,
  });
});

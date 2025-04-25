import { describe, beforeAll, afterAll } from "vitest";
import { addTests } from "./_tests.ts";
import { getTLSCert } from "./_utils.ts";
import { serve } from "../src/adapters/node.ts";

describe("node-http2", () => {
  let server: ReturnType<typeof serve> | undefined;

  beforeAll(async () => {
    process.env.PORT = "0";
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const createServer = await import("./_fixture.ts").then(
      (m) => m.createServer,
    );

    server = createServer({
      protocol: "http2",
      tls: await getTLSCert(),
    });

    await server!.ready();
  });

  afterAll(async () => {
    await server?.close();
  });

  addTests((path) => server!.url! + path.slice(1), {
    runtime: "node",
  });
});

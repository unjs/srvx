import { describe, beforeAll, afterAll } from "vitest";
import { addTests } from "./_tests.ts";
import { serve } from "../src/node.ts";
import { NodeFastResponse } from "../src/node-utils/response.ts";

describe("node (fast-res)", () => {
  let server: ReturnType<typeof serve> | undefined;

  beforeAll(async () => {
    process.env.PORT = "0";
    (globalThis as any).TEST_RESPONSE_CTOR = NodeFastResponse;
    server = await import("./_fixture.ts").then((m) => m.server);
    await server!.ready();
  });

  afterAll(async () => {
    delete (globalThis as any).TEST_RESPONSE_CTOR;
    await server?.close();
  });

  addTests((path) => server!.url! + path.slice(1), {
    runtime: "node",
  });
});

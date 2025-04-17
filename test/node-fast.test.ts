import { describe, beforeAll } from "vitest";
import { addTests } from "./_tests.ts";
import { serve } from "../src/adapters/node.ts";
import { NodeResponse } from "../src/_node-compat/response.ts";

describe("node (fast-res)", () => {
  describe("async", () => {
    let server: ReturnType<typeof serve> | undefined;

    beforeAll(async () => {
      process.env.PORT = "0";
      (globalThis as any).TEST_RESPONSE_CTOR = NodeResponse;
      server = await import("./_fixture.ts").then((m) => m.server);
      await server!.ready();
      return async () => {
        delete (globalThis as any).TEST_RESPONSE_CTOR;
        await server?.close();
      };
    });

    addTests((path) => server!.url! + path.slice(1), {
      runtime: "node",
    });
  });

  describe("sync", () => {
    let server: ReturnType<typeof serve> | undefined;

    beforeAll(async () => {
      process.env.PORT = "0";
      (globalThis as any).TEST_RESPONSE_CTOR = NodeResponse;
      server = await import("./_fixture-sync.ts").then((m) => m.server);
      await server!.ready();
      return async () => {
        delete (globalThis as any).TEST_RESPONSE_CTOR;
        await server?.close();
      };
    });

    addTests((path) => server!.url! + path.slice(1), {
      runtime: "node",
    });
  });
});

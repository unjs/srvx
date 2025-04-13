import { describe, beforeAll } from "vitest";
import { addTests } from "./_tests";
import { serve } from "../src/adapters/node.ts";

describe("node", () => {
  describe("async", () => {
    let server: ReturnType<typeof serve> | undefined;

    beforeAll(async () => {
      process.env.PORT = "0";
      server = await import("./_fixture.ts").then((m) => m.server);
      await server!.ready();

      return async () => {
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
      server = await import("./_fixture-sync.ts").then((m) => m.server);
      await server!.ready();

      return async () => {
        await server?.close();
      };
    });

    addTests((path) => server!.url! + path.slice(1), {
      runtime: "node",
    });
  });
});

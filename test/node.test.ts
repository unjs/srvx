import { describe, beforeAll, afterAll } from "vitest";
import { addTests } from "./_tests";
import { serve } from "../src/adapters/node.ts";

describe("node", () => {
  let server: ReturnType<typeof serve> | undefined;

  beforeAll(async () => {
    process.env.PORT = "0";
    server = await import("./_fixture.ts").then((m) => m.server);
    await server!.ready();
  });

  afterAll(async () => {
    await server?.close();
  });

  addTests((path) => server!.url! + path.slice(1), {
    runtime: "node",
  });
});

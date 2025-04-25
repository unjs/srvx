import { describe, beforeAll, afterAll } from "vitest";
import { addTests } from "./_tests.ts";
import { serve } from "../src/adapters/node.ts";

describe("node", () => {
  let server: ReturnType<typeof serve> | undefined;

  beforeAll(async () => {
    process.env.PORT = "0";
    const createServer = await import("./_fixture.ts").then(
      (m) => m.createServer,
    );
    server = createServer();
    await server!.ready();
  });

  afterAll(async () => {
    await server?.close();
  });

  addTests((path) => server!.url! + path.slice(1), {
    runtime: "node",
  });
});

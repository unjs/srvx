import { describe, beforeAll, afterAll } from "vitest";
import { addTests } from "./_tests";
import { serve } from "../src/node";

describe("node", () => {
  let server: ReturnType<typeof serve> | undefined;

  beforeAll(async () => {
    server = await import("./_fixture.ts").then((m) => m.server);
    await server!.ready();
  });

  afterAll(async () => {
    await server?.close();
  });

  addTests(() => server!.url!, {
    runtime: "node",
  });
});

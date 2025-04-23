import { describe } from "vitest";
import { testsExec } from "./_utils.ts";

describe("bun", () => {
  describe("async", () => {
    testsExec("bun run ./_fixture.ts", { runtime: "bun" });
  });
  describe("sync", () => {
    testsExec("bun run ./_fixture-sync.ts", { runtime: "bun" });
  });
});

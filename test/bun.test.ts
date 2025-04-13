import { describe, test } from "vitest";
import { testsExec } from "./_utils";

describe("bun", () => {
  test("async", () => {
    testsExec("bun run ./_fixture.ts", { runtime: "bun" });
  });
  test("sync", () => {
    testsExec("bun run ./_fixture-sync.ts", { runtime: "bun" });
  });
});

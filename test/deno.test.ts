import { describe, test } from "vitest";
import { testsExec } from "./_utils";

describe("deno", () => {
  test("async", () => {
    testsExec("deno run --unstable-byonm -A ./_fixture.ts", {
      runtime: "deno",
    });
  });
  test("sync", () => {
    testsExec("deno run --unstable-byonm -A ./_fixture-sync.ts", {
      runtime: "deno",
    });
  });
});

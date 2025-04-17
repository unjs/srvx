import { describe } from "vitest";
import { testsExec } from "./_utils";

describe("deno", () => {
  describe("async", () => {
    testsExec("deno run --unstable-byonm -A ./_fixture.ts", {
      runtime: "deno",
    });
  });
  describe("sync", () => {
    testsExec("deno run --unstable-byonm -A ./_fixture-sync.ts", {
      runtime: "deno",
    });
  });
});

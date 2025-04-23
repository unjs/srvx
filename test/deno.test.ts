import { describe } from "vitest";
import { testsExec } from "./_utils.ts";

describe("deno", () => {
  testsExec("deno run --unstable-byonm -A ./_fixture.ts", {
    runtime: "deno",
  });
});

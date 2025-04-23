import { describe } from "vitest";
import { testsExec } from "./_utils.ts";

describe("bun", () => {
  testsExec("bun run ./_fixture.ts", { runtime: "bun" });
});

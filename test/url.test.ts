import { describe, test, expect } from "vitest";
import { FastURL } from "../src/_url.ts";

describe("FastURL", () => {
  describe("setters", async () => {
    const urlSettersTests = await import("./wpt/url_setters_tests.json", {
      with: { type: "json" },
    });
    for (const [prop, tests] of Object.entries(urlSettersTests)) {
      if (prop === "comment" || prop === "default") continue;
      describe(prop, () => {
        for (const t of tests) {
          const title =
            t.comment || `URL("${t.href}").${prop} = ${t.new_value}`;

          test.skipIf(t.skip)(title, () => {
            // const url = new URL(t.href);
            const url = new FastURL(t.href);
            // @ts-ignore
            url[prop] = t.new_value;
            for (const [prop, value] of Object.entries(t.expected)) {
              // @ts-ignore
              expect(url[prop], prop).toBe(value);
            }
          });
        }
      });
    }
  });
});

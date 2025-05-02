import { describe, test, expect } from "vitest";
import { FastURL } from "../src/_url.ts";

const urlTests = await import("./wpt/url_tests.json", {
  with: { type: "json" },
}).then((m) => m.default);

const urlSettersTests = await import("./wpt/url_setters_tests.json", {
  with: { type: "json" },
});

// prettier-ignore
type URLPropName =
"pathname" | "search" | "origin" | "protocol" | "username" |
"password" | "host" | "hostname" | "port" | "hash" | "href"

// prettier-ignore
const urlProps = [
  "pathname", "search", "origin", "protocol", "username",
  "password", "host", "hostname", "port", "hash", "href"
] as URLPropName[];

describe("FastURL", () => {
  test("invalid protocol", () => {
    expect(new FastURL("http:/example.com/foo").pathname).toBe("/foo");
  });

  test("no trailing slash", () => {
    expect(new FastURL("http://example.com").pathname).toBe("/");
  });

  test(".toString() and .toJSON()", () => {
    const url = new FastURL("http://example.com");
    expect(url.toString()).toBe(url.href);
    expect(url.toJSON()).toBe(url.href);
  });

  test(".search (slopw path)", () => {
    const url = new FastURL("http:/example.com/foo?search");
    expect(url.search).toBe("?search");
  });

  test(".searchParams (fast path)", () => {
    const url = new FastURL("http:/example.com/foo?search");
    expect(url.searchParams).toEqual(new URLSearchParams("?search"));
  });

  test(".searchParams (slow path)", () => {
    const url = new FastURL("http:/example.com/foo?search");
    expect(url.href).toBe(url.href); // trigger slow path
    expect(url.searchParams).toEqual(new URLSearchParams("?search"));
  });

  describe("WPT tests", () => {
    for (const t of urlTests) {
      if (typeof t === "string") {
        continue; // Section comment
      }
      if (t.hash || t.href?.endsWith("#")) {
        continue; // Skip tests with hash
      }
      if (!["http:", "https:"].includes(t.protocol!)) {
        continue; // Skip tests with non-http(s) protocols
      }

      // Check if native URL itself passes the test
      let nativePasses = true;
      try {
        const url = new URL(t.input, t.base || undefined);
        for (const prop of urlProps) {
          if (url[prop] !== t[prop]) {
            nativePasses = false;
            break;
          }
        }

        // NOTE: We assume input is already formatted (from incoming HTTP request)
        url.hash = "";
        t.input = url.href;
      } catch {
        nativePasses = false;
      }

      test.skipIf(!nativePasses)(`new FastURL("${t.input}")`, () => {
        const url = new FastURL(t.input);
        for (const prop of urlProps) {
          expect(url[prop], `.${prop}`).toBe(t[prop]);
        }
      });
    }
  });

  describe("setters", async () => {
    for (const [prop, tests] of Object.entries(urlSettersTests)) {
      if (prop === "comment" || prop === "default") continue;
      describe(prop, () => {
        for (const t of tests) {
          const title = `new FastURL("${t.href}").${prop} = "${t.new_value}" ${t.comment ? `// ${t.comment}` : ""}`;

          // Check if native URL itself passes the test
          let nativePasses = true;
          try {
            const url = new URL(t.href);
            url[prop as Exclude<URLPropName, "origin">] = t.new_value;
            for (const [prop, value] of Object.entries(t.expected)) {
              if (url[prop as URLPropName] !== value) {
                nativePasses = false;
                break;
              }
            }
          } catch {
            nativePasses = false;
          }

          test.skipIf(!nativePasses)(title, () => {
            const url = new FastURL(t.href);
            url[prop as Exclude<URLPropName, "origin">] = t.new_value;
            for (const [prop, value] of Object.entries(t.expected)) {
              expect(url[prop as URLPropName], `.${prop}`).toBe(value);
            }
          });
        }
      });
    }
  });
});

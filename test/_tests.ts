import { describe } from "node:test";
import { expect, test } from "vitest";

export function addTests(
  url: (path: string) => string,
  _opts?: { runtime?: string },
) {
  test("works", async () => {
    const response = await fetch(url("/"));
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch("ok");
  });

  test("xRemoteAddress", async () => {
    const response = await fetch(url("/ip"));
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch(/ip: ::1/);
  });

  describe("plugin", () => {
    for (const hook of ["req", "res"]) {
      for (const type of ["async", "sync"]) {
        test(`${type} ${hook}`, async () => {
          const response = await fetch(url("/"), {
            headers: {
              [`x-plugin-${hook}`]: "true",
              [`x-plugin-${type}`]: "true",
            },
          });
          expect(response.status).toBe(200);
          expect(await response.text()).toMatch(`plugin ${hook}`);
        });
      }
    }
  });
}

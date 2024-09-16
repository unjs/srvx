import { expect, test } from "vitest";

export function addTests(getURL: () => string, _opts?: { runtime?: string }) {
  test("works", async () => {
    const response = await fetch(getURL());
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch("ok");
  });
}

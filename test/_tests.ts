import { describe, expect, test } from "vitest";

export function addTests(opts: {
  url: (path: string) => string;
  runtime: string;
  fetch?: typeof globalThis.fetch;
}): void {
  const { url, fetch = globalThis.fetch } = opts;

  test("GET works", async () => {
    const response = await fetch(url("/"));
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch("ok");
  });

  test("request instanceof Request", async () => {
    const response = await fetch(url("/req-instanceof"));
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch("yes");
  });

  test("request.headers instanceof Headers", async () => {
    const response = await fetch(url("/req-headers-instanceof"));
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch("yes");
  });

  test("headers", async () => {
    const response = await fetch(url("/headers"), {
      headers: { foo: "bar", bar: "baz" },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      foo: "bar",
      bar: "baz",
      unsetHeader: null,
    });
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    expect(response.headers.get("x-req-foo")).toBe("bar");
    expect(response.headers.get("x-req-bar")).toBe("baz");
  });

  test("POST works (binary body)", async () => {
    const response = await fetch(url("/body/binary"), {
      method: "POST",
      body: new Uint8Array([1, 2, 3]),
    });
    expect(response.status).toBe(200);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );
  });

  test("POST works (text body)", async () => {
    const response = await fetch(url("/body/text"), {
      method: "POST",
      body: "hello world",
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("hello world");
  });

  test("ip", async () => {
    const response = await fetch(url("/ip"));
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch(/ip: ::1|ip: 127.0.0.1/);
  });

  test("runtime agnostic error handler", async () => {
    const response = await fetch(url("/error"));
    expect(response.status).toBe(500);
    expect(await response.text()).toBe("error: test error");
  });

  describe("plugin", () => {
    test("intercept before handler", async () => {
      const response = await fetch(url("/"), {
        headers: { "X-plugin-req": "1" },
      });
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("response from req plugin");
    });

    test("intercept response headers", async () => {
      const response = await fetch(url("/"), {
        headers: { "X-plugin-res": "1" },
      });
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("ok");
      expect(response.headers.get("x-plugin-header")).toBe("1");
    });
  });

  describe("streams", () => {
    test("response streaming (ReadableStream)", async () => {
      const res = await fetch(url("/stream/node"));
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("chunk0\nchunk1\nchunk2\n");
    });

    test("response streaming (Node.js Readable)", async () => {
      const res = await fetch(url("/stream/node"));
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("chunk0\nchunk1\nchunk2\n");
    });

    // TODO: abortion test (we should test "fixture server" to see the abort signal)
  });
}

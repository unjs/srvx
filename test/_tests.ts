import { describe, expect, test } from "vitest";
import * as http2 from "node:http2";

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
}

export function addStreamingTests(opts: {
  clientSession: () => http2.ClientHttp2Session;
  runtime: string;
}): void {
  const { clientSession, runtime } = opts;

  describe(`${runtime} - http2 - stream`, () => {
    test("streaming response", async () => {
      const streamReq = clientSession().request({
      ":method": "GET",
      ":path": "/stream",
    });

    const chunks: Buffer[] = [];

    streamReq.on("data", (chunk) => {
      chunks.push(chunk);
    });

    return new Promise<void>((resolve, reject) => {
      streamReq.on("end", () => {
        try {
          const data = Buffer.concat(chunks).toString();
          expect(data).toContain("chunk1");
          expect(data).toContain("chunk2");
          expect(data).toContain("chunk3");
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      streamReq.on("error", reject);
    });
  });

  test("abort stream", async () => {
    const controller = new AbortController();

    // Create a stream that we'll abort
    const streamReq = clientSession().request({
      ":method": "GET",
      ":path": "/long-stream",
    });

    const chunks: Buffer[] = [];

    streamReq.on("data", (chunk) => {
      chunks.push(chunk);
      // Abort after receiving first chunk
      controller.abort();
    });

    // Connect abort signal
    controller.signal.addEventListener("abort", () => {
      streamReq.close(http2.constants.NGHTTP2_CANCEL);
    });

    return new Promise<void>((resolve) => {
      streamReq.on("close", () => {
        // We expect the stream to be closed after first chunk
        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks.length).toBeLessThan(10); // Assuming long stream has many chunks
        resolve();
      });
    });
    });
  });
}

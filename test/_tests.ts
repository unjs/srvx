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
}

export function addStreamingTests(opts: {
  url: (path: string) => string;
  fetch?: typeof globalThis.fetch;
}): void {
  const { url, fetch = globalThis.fetch } = opts;

  test("streaming response", async () => {
    const response = await fetch(url("/stream"));
    const chunks: string[] = [];

    const reader = response.body!.getReader();
    const decoder = new TextDecoder(`utf-8`);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      chunks.push(decoder.decode(value, { stream: true }));
    }

    expect(chunks.join("")).toContain("chunk1");
    expect(chunks.join("")).toContain("chunk2");
    expect(chunks.join("")).toContain("chunk3");
  });

  test("abort stream", async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Create a stream using fetch API
    const response = await fetch(url("/long-stream"), {
      signal,
    });

    // Get the response as a readable stream
    const reader = response.body!.getReader();

    const chunks: Uint8Array[] = [];

    // Read the first chunk and then abort
    try {
      const { value, done } = await reader.read();
      if (!done) {
        chunks.push(value);
        // Abort after receiving first chunk
        controller.abort();
      }

      // Try to read more chunks (this should throw when aborted)
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } catch (error) {
      // We expect the AbortError to be thrown
      expect((error as any).name).toBe("AbortError");
    } finally {
      // Make sure to release the reader
      reader.releaseLock();
    }

    // We expect at least one chunk to be received before aborting
    expect(chunks.length).toBeGreaterThan(0);
    // And we expect the abort to prevent receiving too many chunks
    expect(chunks.length).toBeLessThan(10); // Assuming long stream has many chunks
  });
}

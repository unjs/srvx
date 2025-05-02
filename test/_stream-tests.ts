import { expect, test } from "vitest";
import * as http2 from "node:http2";

export function addStreamingTests(opts: {
  clientSession: () => http2.ClientHttp2Session;
}): void {
  const { clientSession } = opts;

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
}

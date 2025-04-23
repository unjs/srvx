import type NodeHttp from "node:http";
import type { NodeResponse } from "./response.ts";
import type { Readable as NodeReadable } from "node:stream";
import { splitSetCookieString } from "cookie-es";

export async function sendNodeResponse(
  nodeRes: NodeHttp.ServerResponse,
  webRes: Response | NodeResponse,
): Promise<void> {
  if (!webRes) {
    nodeRes.statusCode = 500;
    return endNodeResponse(nodeRes);
  }

  // Fast path for NodeResponse
  if ((webRes as NodeResponse).nodeResponse) {
    const res = (webRes as NodeResponse).nodeResponse();
    if (!nodeRes.headersSent) {
      nodeRes.writeHead(res.status, res.statusText, res.headers.flat());
    }
    if (res.body) {
      if (res.body instanceof ReadableStream) {
        return streamBody(res.body, nodeRes);
      } else if (typeof (res.body as NodeReadable)?.pipe === "function") {
        (res.body as NodeReadable).pipe(nodeRes);
        return new Promise((resolve) => nodeRes.on("close", resolve));
      }
      nodeRes.write(res.body);
    }
    return endNodeResponse(nodeRes);
  }

  const headerEntries: NodeHttp.OutgoingHttpHeader[] = [];
  for (const [key, value] of webRes.headers) {
    if (key === "set-cookie") {
      for (const setCookie of splitSetCookieString(value)) {
        headerEntries.push(["set-cookie", setCookie]);
      }
    } else {
      headerEntries.push([key, value]);
    }
  }

  if (!nodeRes.headersSent) {
    nodeRes.writeHead(
      webRes.status || 200,
      webRes.statusText,
      headerEntries.flat(),
    );
  }

  return webRes.body
    ? streamBody(webRes.body, nodeRes)
    : endNodeResponse(nodeRes);
}

function endNodeResponse(nodeRes: NodeHttp.ServerResponse) {
  return new Promise<void>((resolve) => nodeRes.end(resolve));
}

export function streamBody(
  stream: ReadableStream,
  nodeRes: NodeHttp.ServerResponse,
): Promise<void> | void {
  // stream is already destroyed
  if (nodeRes.destroyed) {
    stream.cancel();
    return;
  }

  const reader = stream.getReader();

  // Cancel the stream and destroy the response
  function streamCancel(error?: Error) {
    reader.cancel(error).catch(() => {});
    if (error) {
      nodeRes.destroy(error);
    }
  }

  function streamHandle({
    done,
    value,
  }: ReadableStreamReadResult<Uint8Array>): void | Promise<void> {
    try {
      if (done) {
        // End the response
        nodeRes.end();
      } else if (nodeRes.write(value)) {
        // Continue reading recursively
        reader.read().then(streamHandle, streamCancel);
      } else {
        // Wait for the drain event to continue reading
        nodeRes.once("drain", () =>
          reader.read().then(streamHandle, streamCancel),
        );
      }
    } catch (error) {
      streamCancel(error instanceof Error ? error : undefined);
    }
  }

  // Listen for close and error events to cancel the stream
  nodeRes.on("close", streamCancel);
  nodeRes.on("error", streamCancel);
  reader.read().then(streamHandle, streamCancel);

  // Return a promise that resolves when the stream is closed
  return reader.closed.finally(() => {
    // cleanup listeners
    nodeRes.off("close", streamCancel);
    nodeRes.off("error", streamCancel);
  });
}

import type NodeHttp from "node:http";
import type { NodeFastResponse } from "./response";
import { splitSetCookieString } from "cookie-es";

export async function sendNodeResponse(
  nodeRes: NodeHttp.ServerResponse,
  webRes: Response | NodeFastResponse,
): Promise<void> {
  // Fast path for NodeFastResponse
  if ((webRes as NodeFastResponse).xNodeResponse) {
    const res = (webRes as NodeFastResponse).xNodeResponse();
    nodeRes.writeHead(res.status, res.statusText, res.headers);
    return res.body instanceof ReadableStream
      ? streamBody(res.body, nodeRes).finally(() => endNodeResponse(nodeRes))
      : endNodeResponse(nodeRes);
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

  nodeRes.writeHead(webRes.status || 200, webRes.statusText, headerEntries);

  return webRes.body
    ? streamBody(webRes.body, nodeRes).finally(() => endNodeResponse(nodeRes))
    : endNodeResponse(nodeRes);
}

function endNodeResponse(nodeRes: NodeHttp.ServerResponse) {
  return new Promise<void>((resolve) => nodeRes.end(resolve));
}

// Almost twice faster than `pipeline` from `node:stream/promises`
async function streamBody(
  stream: ReadableStream,
  nodeRes: NodeHttp.ServerResponse,
) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      nodeRes.write(value);
    }
  } finally {
    reader.releaseLock();
  }
}

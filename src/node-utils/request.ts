import type NodeHttp from "node:http";
import type { xRequest, xHeaders } from "../types.ts";
import { kNodeInspect, kNodeReq } from "./_common.ts";
import { NodeReqHeadersProxy } from "./headers.ts";
import { NodeReqURLProxy } from "./url.ts";

export const NodeRequestProxy = /* @__PURE__ */ (() =>
  class NodeRequestProxy implements xRequest {
    cache: RequestCache = "default";
    credentials: RequestCredentials = "same-origin";
    destination: RequestDestination = "";
    integrity: string = "";
    keepalive: boolean = false;

    mode: RequestMode = "cors";
    redirect: RequestRedirect = "follow";
    referrer: string = "about:client";
    referrerPolicy: ReferrerPolicy = "";

    headers: xHeaders;
    bodyUsed: boolean = false;

    [kNodeReq]: NodeHttp.IncomingMessage;

    xNode:
      | { req: NodeHttp.IncomingMessage; res: NodeHttp.ServerResponse }
      | undefined;

    #url: URL;
    #abortSignal?: AbortController;
    #hasBody: boolean | undefined;
    #rawBody?: Promise<Uint8Array>;
    #blobBody?: Promise<Blob>;
    #formDataBody?: Promise<FormData>;
    #jsonBody?: Promise<any>;
    #textBody?: Promise<string>;
    #bodyStream?: undefined | ReadableStream<Uint8Array>;

    constructor(nodeReq: NodeHttp.IncomingMessage) {
      this[kNodeReq] = nodeReq;
      this.#url = new NodeReqURLProxy(nodeReq) as unknown as URL;
      this.headers = new NodeReqHeadersProxy(nodeReq);
    }

    get xRemoteAddress() {
      return this[kNodeReq].socket?.remoteAddress;
    }

    clone(): xRequest {
      return new NodeRequestProxy(this[kNodeReq]);
    }

    get url() {
      return this.#url.href;
    }

    get method() {
      return this[kNodeReq].method || "GET";
    }

    get signal() {
      if (!this.#abortSignal) {
        this.#abortSignal = new AbortController();
      }
      return this.#abortSignal.signal;
    }

    get _hasBody() {
      if (this.#hasBody !== undefined) {
        return this.#hasBody;
      }
      // Check if request method requires a payload
      const method = this[kNodeReq].method?.toUpperCase();
      if (
        !method ||
        !(
          method === "PATCH" ||
          method === "POST" ||
          method === "PUT" ||
          method === "DELETE"
        )
      ) {
        this.#hasBody = false;
        return false;
      }

      // Make sure either content-length or transfer-encoding/chunked is set
      if (!Number.parseInt(this[kNodeReq].headers["content-length"] || "")) {
        const isChunked = (this[kNodeReq].headers["transfer-encoding"] || "")
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
          .includes("chunked");
        if (!isChunked) {
          this.#hasBody = false;
          return false;
        }
      }
      return true;
    }

    get body() {
      if (!this.#hasBody) {
        return null;
      }
      if (!this.#bodyStream) {
        this.bodyUsed = true;
        this.#bodyStream = new ReadableStream({
          start: (controller) => {
            this[kNodeReq]
              .on("data", (chunk) => {
                controller.enqueue(chunk);
              })
              .once("error", (error) => {
                controller.error(error);
                this.#abortSignal?.abort();
              })
              .once("close", () => {
                this.#abortSignal?.abort();
              })
              .once("end", () => {
                controller.close();
              });
          },
        });
      }
      return this.#bodyStream;
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      if (!this.#rawBody) {
        const _bodyStream = this.body;
        return _bodyStream
          ? _readStream(_bodyStream).then((buff) => buff.buffer as ArrayBuffer)
          : Promise.resolve(new ArrayBuffer(0));
      }
      return this.#rawBody.then((buff) => buff.buffer as ArrayBuffer);
    }

    bytes(): Promise<Uint8Array> {
      if (!this.#rawBody) {
        const _bodyStream = this.body;
        return _bodyStream
          ? _readStream(_bodyStream)
          : Promise.resolve(new Uint8Array());
      }
      return this.#rawBody;
    }

    blob(): Promise<Blob> {
      if (!this.#blobBody) {
        this.#blobBody = this.arrayBuffer().then((buff) => {
          return new Blob([buff], {
            type: this[kNodeReq].headers["content-type"],
          });
        });
      }
      return this.#blobBody;
    }

    formData(): Promise<FormData> {
      if (!this.#formDataBody) {
        this.#formDataBody = new Response(this.body, {
          headers: this.headers as unknown as Headers,
        }).formData();
      }
      return this.#formDataBody;
    }

    json(): Promise<any> {
      if (!this.#jsonBody) {
        this.#jsonBody = this.text().then((txt) => {
          return JSON.parse(txt);
        });
      }
      return this.#jsonBody;
    }

    text(): Promise<string> {
      if (!this.#textBody) {
        this.#textBody = this.arrayBuffer().then((buff) => {
          return new TextDecoder().decode(buff);
        });
      }
      return this.#textBody;
    }

    get [Symbol.toStringTag]() {
      return "Request";
    }

    [kNodeInspect]() {
      return {
        method: this.method,
        url: this.url,
        headers: this.headers,
      };
    }
  })();

async function _readStream(stream: ReadableStream) {
  const chunks: Uint8Array[] = [];
  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        chunks.push(chunk);
      },
    }),
  );
  return Buffer.concat(chunks);
}

import type NodeHttp from "node:http";
import type { ServerRequest } from "../types.ts";
import { kNodeInspect } from "./_common.ts";
import { NodeReqHeadersProxy } from "./headers.ts";
import { NodeReqURLProxy } from "./url.ts";

export const NodeRequestProxy = /* @__PURE__ */ (() => {
  class NodeRequestProxy {
    #url?: InstanceType<typeof NodeReqURLProxy>;
    #headers?: InstanceType<typeof NodeReqHeadersProxy>;
    #bodyUsed: boolean = false;
    #abortSignal?: AbortController;
    #hasBody: boolean | undefined;
    #bodyBytes?: Promise<Uint8Array>;
    #blobBody?: Promise<Blob>;
    #formDataBody?: Promise<FormData>;
    #jsonBody?: Promise<any>;
    #textBody?: Promise<string>;
    #bodyStream?: undefined | ReadableStream<Uint8Array>;

    node: { req: NodeHttp.IncomingMessage; res?: NodeHttp.ServerResponse };

    constructor(nodeCtx: {
      req: NodeHttp.IncomingMessage;
      res?: NodeHttp.ServerResponse;
    }) {
      this.node = nodeCtx;
    }

    get headers() {
      if (!this.#headers) {
        this.#headers = new NodeReqHeadersProxy(this.node);
      }
      return this.#headers;
    }

    get remoteAddress() {
      return this.node.req.socket?.remoteAddress;
    }

    clone() {
      return new NodeRequestProxy({ ...this.node });
    }

    get _url() {
      if (!this.#url) {
        this.#url = new NodeReqURLProxy(this.node);
      }
      return this.#url;
    }

    get url() {
      return this._url.href;
    }

    get method() {
      return this.node.req.method || "GET";
    }

    get signal() {
      if (!this.#abortSignal) {
        this.#abortSignal = new AbortController();
      }
      return this.#abortSignal.signal;
    }

    get bodyUsed() {
      return this.#bodyUsed;
    }

    get _hasBody() {
      if (this.#hasBody !== undefined) {
        return this.#hasBody;
      }
      // Check if request method requires a payload
      const method = this.node.req.method?.toUpperCase();
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
      if (!Number.parseInt(this.node.req.headers["content-length"] || "")) {
        const isChunked = (this.node.req.headers["transfer-encoding"] || "")
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
          .includes("chunked");
        if (!isChunked) {
          this.#hasBody = false;
          return false;
        }
      }
      this.#hasBody = true;
      return true;
    }

    get body() {
      if (!this._hasBody) {
        return null;
      }
      if (!this.#bodyStream) {
        this.#bodyUsed = true;
        this.#bodyStream = new ReadableStream({
          start: (controller) => {
            this.node.req
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

    bytes(): Promise<Uint8Array> {
      if (!this.#bodyBytes) {
        const _bodyStream = this.body;
        this.#bodyBytes = _bodyStream
          ? _readStream(_bodyStream)
          : Promise.resolve(new Uint8Array());
      }
      return this.#bodyBytes;
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      return this.bytes().then((buff) => {
        return buff.buffer.slice(
          buff.byteOffset,
          buff.byteOffset + buff.byteLength,
        ) as ArrayBuffer;
      });
    }

    blob(): Promise<Blob> {
      if (!this.#blobBody) {
        this.#blobBody = this.bytes().then((bytes) => {
          return new Blob([bytes], {
            type: this.node.req.headers["content-type"],
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

    text(): Promise<string> {
      if (!this.#textBody) {
        this.#textBody = this.bytes().then((bytes) => {
          return new TextDecoder().decode(bytes);
        });
      }
      return this.#textBody;
    }

    json(): Promise<any> {
      if (!this.#jsonBody) {
        this.#jsonBody = this.text().then((txt) => {
          return JSON.parse(txt);
        });
      }
      return this.#jsonBody;
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
  }
  Object.setPrototypeOf(NodeRequestProxy.prototype, Request.prototype);
  return NodeRequestProxy;
})() as unknown as { new (nodeReq: NodeHttp.IncomingMessage): ServerRequest };

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

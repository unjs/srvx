import type NodeHttp from "node:http";
import { splitSetCookieString } from "cookie-es";

export type NodeFastResponse = InstanceType<typeof NodeFastResponse>;

export const NodeFastResponse = /* @__PURE__ */ (() =>
  /**
   * Fast Response for Node.js runtime
   *
   * It is faster because in most cases it doesn't create a full Response instance.
   */
  class NodeFastResponse implements Response {
    #body?: BodyInit | null;
    #init?: ResponseInit;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.#body = body;
      this.#init = init;
    }

    /**
     * Prepare Node.js response object
     */
    nodeResponse() {
      const status = this.#init?.status ?? 200;
      const statusText = this.#init?.statusText ?? "";

      const headers: NodeHttp.OutgoingHttpHeader[] = [];

      let headersInit = this.#init?.headers;
      if (headersInit) {
        if (typeof headersInit === "object") {
          headersInit = Object.entries(headersInit);
        }
        for (const [key, value] of headersInit) {
          if (key === "set-cookie") {
            for (const setCookie of splitSetCookieString(value)) {
              headers.push(["set-cookie", setCookie]);
            }
          } else {
            headers.push([key, value]);
          }
        }
      }

      const bodyInit = this.#body;
      // prettier-ignore
      let body: string | Buffer | Uint8Array | DataView | ReadableStream<Uint8Array> | undefined | null;
      if (bodyInit) {
        if (typeof bodyInit === "string") {
          body = bodyInit;
        } else if (bodyInit instanceof ReadableStream) {
          body = bodyInit;
        } else if (bodyInit instanceof ArrayBuffer) {
          body = Buffer.from(bodyInit);
        } else if (bodyInit instanceof Uint8Array) {
          body = Buffer.from(bodyInit);
        } else if (bodyInit instanceof DataView) {
          body = Buffer.from(bodyInit.buffer);
        } else if (bodyInit instanceof Blob) {
          body = bodyInit.stream();
          if (bodyInit.type) {
            headers.push(["content-type", bodyInit.type]);
          }
        } else {
          const res = new Response(bodyInit);
          body = res.body;
          for (const [key, value] of res.headers) {
            headers.push([key, value]);
          }
        }
      }

      // Free up memory
      this.#body = undefined;
      this.#init = undefined;

      return {
        status,
        statusText,
        headers,
        body,
      };
    }

    // ... the rest is for interface compatibility only and usually not to be used ...

    /** Lazy initialized response instance */
    #responseObj?: Response;

    /** Lazy initialized headers instance */
    #headersObj?: Headers;

    clone(): Response {
      if (this.#responseObj) {
        return this.#responseObj.clone();
      }
      return new Response(this.#body, this.#init);
    }

    get #response(): Response {
      if (!this.#responseObj) {
        this.#responseObj = new Response(this.#body, this.#init);
        // Free up memory
        this.#body = undefined;
        this.#init = undefined;
        this.#headersObj = undefined;
      }
      return this.#responseObj;
    }

    get headers(): Headers {
      if (this.#responseObj) {
        return this.#responseObj.headers; // Reuse instance
      }
      if (!this.#headersObj) {
        this.#headersObj = new Headers(this.#init?.headers);
      }
      return this.#headersObj;
    }

    get ok(): boolean {
      if (this.#responseObj) {
        return this.#responseObj.ok;
      }
      const status = this.#init?.status ?? 200;
      return status >= 200 && status < 300;
    }

    get redirected(): boolean {
      if (this.#responseObj) {
        return this.#responseObj.redirected;
      }
      return false;
    }

    get status(): number {
      if (this.#responseObj) {
        return this.#responseObj.status;
      }
      return this.#init?.status ?? 200;
    }

    get statusText(): string {
      if (this.#responseObj) {
        return this.#responseObj.statusText;
      }
      return this.#init?.statusText ?? "";
    }

    get type(): ResponseType {
      if (this.#responseObj) {
        return this.#responseObj.type;
      }
      return "default";
    }

    get url(): string {
      if (this.#responseObj) {
        return this.#responseObj.url;
      }
      return "";
    }

    // --- body ---

    #fastBody<T extends object>(
      as: new (...args: any[]) => T,
    ): T | null | false {
      const bodyInit = this.#body;
      if (bodyInit === null || bodyInit === undefined) {
        return null; // No body
      }
      if (bodyInit instanceof as) {
        return bodyInit; // Fast path
      }
      return false; // Not supported
    }

    get body(): ReadableStream<Uint8Array> | null {
      if (this.#responseObj) {
        return this.#responseObj.body; // Reuse instance
      }
      const fastBody = this.#fastBody(ReadableStream);
      if (fastBody !== false) {
        return fastBody as ReadableStream<Uint8Array>; // Fast path
      }
      return this.#response.body; // Slow path
    }

    get bodyUsed(): boolean {
      if (this.#responseObj) {
        return this.#responseObj.bodyUsed;
      }
      return false;
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      if (this.#responseObj) {
        return this.#responseObj.arrayBuffer(); // Reuse instance
      }
      const fastBody = this.#fastBody(ArrayBuffer);
      if (fastBody !== false) {
        return Promise.resolve(fastBody || new ArrayBuffer(0)); // Fast path
      }
      return this.#response.arrayBuffer(); // Slow path
    }

    blob(): Promise<Blob> {
      if (this.#responseObj) {
        return this.#responseObj.blob(); // Reuse instance
      }
      const fastBody = this.#fastBody(Blob);
      if (fastBody !== false) {
        return Promise.resolve(fastBody || new Blob()); // Fast path
      }
      return this.#response.blob(); // Slow path
    }

    bytes(): Promise<Uint8Array> {
      if (this.#responseObj) {
        return this.#responseObj.bytes(); // Reuse instance
      }
      const fastBody = this.#fastBody(Uint8Array);
      if (fastBody !== false) {
        return Promise.resolve(fastBody || new Uint8Array()); // Fast path
      }
      return this.#response.bytes(); // Slow path
    }

    formData(): Promise<FormData> {
      if (this.#responseObj) {
        return this.#responseObj.formData(); // Reuse instance
      }
      const fastBody = this.#fastBody(FormData);
      if (fastBody !== false) {
        // TODO: Content-Type should be one of "multipart/form-data" or "application/x-www-form-urlencoded"
        return Promise.resolve(fastBody || new FormData()); // Fast path
      }
      return this.#response.formData(); // Slow path
    }

    text(): Promise<string> {
      if (this.#responseObj) {
        return this.#responseObj.text(); // Reuse instance
      }
      const bodyInit = this.#body;
      if (bodyInit === null || bodyInit === undefined) {
        return Promise.resolve(""); // No body
      }
      if (typeof bodyInit === "string") {
        return Promise.resolve(bodyInit); // Fast path
      }
      return this.#response.text(); // Slow path
    }

    json(): Promise<any> {
      if (this.#responseObj) {
        return this.#responseObj.json(); // Reuse instance
      }
      return this.text().then((text) => JSON.parse(text));
    }
  })();

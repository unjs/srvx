import type NodeHttp from "node:http";
import { splitSetCookieString } from "cookie-es";
import { kNodeInspect, kNodeReq, kNodeRes } from "./_common.ts";

export const NodeReqHeadersProxy = /* @__PURE__ */ (() =>
  class NodeReqHeadersProxy implements Headers {
    [kNodeReq]: NodeHttp.IncomingMessage;

    constructor(req: NodeHttp.IncomingMessage) {
      this[kNodeReq] = req;
    }

    append(name: string, value: string): void {
      name = name.toLowerCase();
      const _headers = this[kNodeReq].headers;
      const _current = _headers[name];
      if (_current) {
        if (Array.isArray(_current)) {
          _current.push(value);
        } else {
          _headers[name] = [_current as string, value];
        }
      } else {
        _headers[name] = value;
      }
    }

    delete(name: string): void {
      name = name.toLowerCase();
      this[kNodeReq].headers[name] = undefined;
    }

    get(name: string): string | null {
      name = name.toLowerCase();
      return _normalizeValue(this[kNodeReq].headers[name]);
    }

    getSetCookie(): string[] {
      const setCookie = this[kNodeReq].headers["set-cookie"];
      if (!setCookie || setCookie.length === 0) {
        return [];
      }
      return splitSetCookieString(setCookie);
    }

    has(name: string): boolean {
      name = name.toLowerCase();
      return !!this[kNodeReq].headers[name];
    }

    set(name: string, value: string): void {
      name = name.toLowerCase();
      this[kNodeReq].headers[name] = value;
    }

    get count(): number {
      // Bun-specific addon
      throw new Error("Method not implemented.");
    }

    getAll(_name: "set-cookie" | "Set-Cookie"): string[] {
      // Bun-specific addon
      throw new Error("Method not implemented.");
    }

    toJSON(): Record<string, string> {
      const _headers = this[kNodeReq].headers;
      const result: Record<string, string> = {};
      for (const key in _headers) {
        if (_headers[key]) {
          result[key] = _normalizeValue(_headers[key]);
        }
      }
      return result;
    }

    forEach(
      cb: (value: string, key: string, parent: Headers) => void,
      thisArg?: any,
    ): void {
      const _headers = this[kNodeReq].headers;
      for (const key in _headers) {
        if (_headers[key]) {
          cb.call(
            thisArg,
            _normalizeValue(_headers[key]),
            key,
            this as unknown as Headers,
          );
        }
      }
    }

    *entries(): HeadersIterator<[string, string]> {
      const _headers = this[kNodeReq].headers;
      for (const key in _headers) {
        yield [key, _normalizeValue(_headers[key])];
      }
    }

    *keys(): HeadersIterator<string> {
      const keys = Object.keys(this[kNodeReq].headers);
      for (const key of keys) {
        yield key;
      }
    }

    *values(): HeadersIterator<string> {
      const values = Object.values(this[kNodeReq].headers);
      for (const value of values) {
        yield _normalizeValue(value);
      }
    }

    [Symbol.iterator](): HeadersIterator<[string, string]> {
      return this.entries()[Symbol.iterator]();
    }

    get [Symbol.toStringTag]() {
      return "Headers";
    }

    [kNodeInspect]() {
      return Object.fromEntries(this.entries());
    }
  })();

export const NodeResHeadersProxy = /* @__PURE__ */ (() =>
  class NodeResHeadersProxy implements Headers {
    [kNodeRes]: NodeHttp.ServerResponse;

    constructor(res: NodeHttp.ServerResponse) {
      this[kNodeRes] = res;
    }

    append(name: string, value: string): void {
      this[kNodeRes].appendHeader(name, value);
    }

    delete(name: string): void {
      this[kNodeRes].removeHeader(name);
    }

    get(name: string): string | null {
      return _normalizeValue(this[kNodeRes].getHeader(name));
    }

    getSetCookie(): string[] {
      const setCookie = _normalizeValue(this[kNodeRes].getHeader("set-cookie"));
      if (!setCookie) {
        return [];
      }
      return splitSetCookieString(setCookie);
    }

    has(name: string): boolean {
      return this[kNodeRes].hasHeader(name);
    }

    set(name: string, value: string): void {
      this[kNodeRes].setHeader(name, value);
    }

    get count(): number {
      // Bun-specific addon
      throw new Error("Method not implemented.");
    }

    getAll(_name: "set-cookie" | "Set-Cookie"): string[] {
      // Bun-specific addon
      throw new Error("Method not implemented.");
    }

    toJSON(): Record<string, string> {
      const _headers = this[kNodeRes].getHeaders();
      const result: Record<string, string> = {};
      for (const key in _headers) {
        if (_headers[key]) {
          result[key] = _normalizeValue(_headers[key]);
        }
      }
      return result;
    }

    forEach(
      cb: (value: string, key: string, parent: Headers) => void,
      thisArg?: any,
    ): void {
      const _headers = this[kNodeRes].getHeaders();
      for (const key in _headers) {
        if (_headers[key]) {
          cb.call(
            thisArg,
            _normalizeValue(_headers[key]),
            key,
            this as unknown as Headers,
          );
        }
      }
    }

    *entries(): HeadersIterator<[string, string]> {
      const _headers = this[kNodeRes].getHeaders();
      for (const key in _headers) {
        yield [key, _normalizeValue(_headers[key])];
      }
    }

    *keys(): HeadersIterator<string> {
      const keys = this[kNodeRes].getHeaderNames();
      for (const key of keys) {
        yield key;
      }
    }

    *values(): HeadersIterator<string> {
      const values = Object.values(this[kNodeRes].getHeaders());
      for (const value of values) {
        yield _normalizeValue(value);
      }
    }

    [Symbol.iterator](): HeadersIterator<[string, string]> {
      return this.entries()[Symbol.iterator]();
    }

    get [Symbol.toStringTag]() {
      return "Headers";
    }

    [kNodeInspect]() {
      return Object.fromEntries(this.entries());
    }
  })();

function _normalizeValue(
  value: string | string[] | number | undefined,
): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return (value as string) || "";
}

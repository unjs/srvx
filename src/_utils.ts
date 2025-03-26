import type { ServerOptions } from "./types";

import { readFileSync } from "node:fs";

export function resolvePort(
  portOptions: string | number | undefined,
  portEnv: string | undefined,
): number {
  const portInput = portOptions ?? portEnv;
  if (portInput === undefined) {
    return 3000;
  }
  return typeof portInput === "number"
    ? portInput
    : Number.parseInt(portInput, 10);
}

export function fmtURL(
  host: string | undefined,
  port: number | undefined,
  ssl: boolean,
) {
  if (!host || !port) {
    return undefined;
  }
  if (host.includes(":")) {
    host = `[${host}]`;
  }
  return `http${ssl ? "s" : ""}://${host}:${port}/`;
}

export function resolveTLSOptions(opts: ServerOptions) {
  if (!opts?.tls) {
    return;
  }
  const cert = resolveCertorKey(opts.tls.cert);
  const key = resolveCertorKey(opts.tls.key);
  if (!cert && !key) {
    return;
  }
  if (!cert || !key) {
    throw new TypeError("TLS `cert` and `key` must be provided together.");
  }
  return {
    cert,
    key,
    passphrase: opts.tls.passphrase,
  };
}

function resolveCertorKey(value?: unknown): undefined | string {
  if (!value) {
    return;
  }
  if (typeof value !== "string") {
    throw new TypeError(
      "TLS certificate and key must be strings in PEM format or file paths.",
    );
  }
  if (value.startsWith("-----BEGIN ")) {
    return value;
  }
  return readFileSync(value, "utf8");
}

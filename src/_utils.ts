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

export function resolveHTTPSOptions(opts: ServerOptions) {
  if (!opts?.https) {
    return;
  }

  const cert = resolveCert(opts.https.cert);
  const key = resolveCert(opts.https.key);
  const ca = opts.https.ca?.map(resolveCert);

  if (!cert && !key) {
    return;
  }
  if (!cert) {
    throw new Error("https.cert is missing");
  }
  if (!key) {
    throw new Error("https.key is missing");
  }

  return {
    cert,
    key,
    ca,
  };
}

function resolveCert(value?: string) {
  if (!value) {
    return;
  }
  if (value.startsWith("-----BEGIN CERTIFICATE-----")) {
    return value;
  }
  return readFileSync(value);
}

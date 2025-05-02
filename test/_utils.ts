import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile, mkdir } from "node:fs/promises";
import { afterAll, beforeAll } from "vitest";
import { execa, type ResultPromise as ExecaRes } from "execa";
import { getRandomPort, waitForPort } from "get-port-please";
import { addTests } from "./_tests.ts";

const testDir = fileURLToPath(new URL(".", import.meta.url));

export function testsExec(
  cmd: string,
  opts: { runtime: string; silent?: boolean },
): void {
  let childProc: ExecaRes;
  let baseURL: string;

  beforeAll(async () => {
    const port = await getRandomPort("localhost");
    baseURL = `http://localhost:${port}/`;
    const [bin, ...args] = cmd.replace("./", testDir).split(" ");
    if (process.env.TEST_DEBUG) {
      console.log(`$ ${bin} ${args.join(" ")}`);
    }
    childProc = execa(bin, args, { env: { PORT: port.toString() } });
    childProc.catch((error) => {
      if (error.signal !== "SIGTERM") {
        console.error(error);
      }
    });
    if (process.env.TEST_DEBUG || !opts.silent) {
      childProc.stderr!.on("data", (chunk) => {
        console.log(chunk.toString());
      });
    }
    if (process.env.TEST_DEBUG) {
      childProc.stdout!.on("data", (chunk) => {
        console.log(chunk.toString());
      });
    }
    await waitForPort(port, { host: "localhost", delay: 50, retries: 100 });
  });

  afterAll(async () => {
    await childProc.kill();
  });

  addTests({
    url: (path) => baseURL + path.slice(1),
    ...opts,
  });
}

export async function getTLSCert(): Promise<{
  ca: string;
  cert: string;
  key: string;
}> {
  const certDir = join(testDir, ".tmp/tls");

  const caFile = join(certDir, "ca.crt");
  const certFile = join(certDir, "server.crt");
  const keyFile = join(certDir, "server.key");

  if (!existsSync(caFile) || !existsSync(certFile) || !existsSync(keyFile)) {
    await mkdir(certDir, { recursive: true });

    // Generate CA key and certificate
    const x = execa({ cwd: certDir });
    await x`openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 365 -subj /CN=test -addext subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1`;
    await x`openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr -subj /CN=localhost -addext subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1`;
    await x`openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365  -copy_extensions copy`;
  }
  return {
    ca: await readFile(caFile, "utf8"),
    cert: await readFile(certFile, "utf8"),
    key: await readFile(keyFile, "utf8"),
  };
}

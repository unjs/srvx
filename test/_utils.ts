import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { afterAll, beforeAll } from "vitest";
import { execa, type ResultPromise as ExecaRes } from "execa";
import { getRandomPort, waitForPort } from "get-port-please";
import { addTests } from "./_tests.ts";

const testDir = fileURLToPath(new URL(".", import.meta.url));

export function testsExec(
  cmd: string,
  opts: { runtime?: string; silent?: boolean },
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

  addTests((path) => baseURL + path.slice(1));
}

export async function getTLSCert(): Promise<{ cert: string; key: string }> {
  const certDir = join(testDir, ".tmp/tls");
  const cert = join(certDir, "server.crt");
  const key = join(certDir, "server.key");
  if (!existsSync(cert) || !existsSync(key)) {
    mkdirSync(certDir, { recursive: true });
    await execa({
      cwd: certDir,
    })`openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.crt -days 365 -subj /CN=srvx.local`;
  }
  return { cert, key };
}

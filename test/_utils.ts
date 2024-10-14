import { afterAll, beforeAll } from "vitest";
import { execa, ResultPromise as ExecaRes } from "execa";
import { fileURLToPath } from "node:url";
import { getRandomPort, waitForPort } from "get-port-please";
import { addTests } from "./_tests";

const testDir = fileURLToPath(new URL(".", import.meta.url));

export function testsExec(
  cmd: string,
  opts: { runtime?: string; silent?: boolean },
) {
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

import { rm } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  externals: ["deno", "bun"],
  rollup: {
    esbuild: {
      target: "ES2022",
      tsconfigRaw: {
        compilerOptions: {
          useDefineForClassFields: false,
        },
      },
    },
  },
  hooks: {
    async "build:done"() {
      for await (const file of glob("dist/**/*.d.ts")) {
        await rm(file);
      }
    },
  },
});

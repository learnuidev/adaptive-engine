import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  format: "esm",
  entry: ["src/adaptive/index.tsx"],

  // dts: true,
  // format: ["esm"],
  clean: true,
  outDir: "dist",
  sourcemap: true,
});

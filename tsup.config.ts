import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  format: "esm",
  entry: ["src/adaptive/index.ts"],
});

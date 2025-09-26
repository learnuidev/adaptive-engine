import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  format: "esm",
  entry: [
    "src/adaptive/index.ts",

    "./src/adaptive-provider.tsx", // bundle each component .ts or .tsx file
  ],
});

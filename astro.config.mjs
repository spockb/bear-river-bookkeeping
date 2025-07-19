// astro.config.mjs
import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
  alias: {
    "@": path.resolve("./src"),
  },
});

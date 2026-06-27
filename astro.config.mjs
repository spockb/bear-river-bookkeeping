// astro.config.mjs
import { defineConfig } from "astro/config";
import path from "path";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.bearriverbookkeeping.com",
  integrations: [sitemap()],
  alias: {
    "@": path.resolve("./src"),
  },
});

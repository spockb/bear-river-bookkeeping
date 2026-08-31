// astro.config.mjs
import { defineConfig } from "astro/config";
import path from "path";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.bearriverbookkeeping.com",
  // Every internal link, canonical, and sitemap entry uses one trailing-slash form,
  // so Google never sees /about and /about/ as two competing URLs.
  trailingSlash: "always",
  integrations: [
    sitemap({
      changefreq: "monthly",
      lastmod: new Date(),
      serialize(item) {
        // The homepage is the priority landing page; the rest are equal below it.
        item.priority = item.url === "https://www.bearriverbookkeeping.com/" ? 1.0 : 0.8;
        return item;
      },
    }),
  ],
  alias: {
    "@": path.resolve("./src"),
  },
});

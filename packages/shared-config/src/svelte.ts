import type { Config } from "@sveltejs/kit";
import AdapterVercel from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/kit/vite";

export const appConfig: Config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: AdapterVercel(),
    files: {
      lib: "src/lib",
      appTemplate: "src/index.html",
      assets: "src/assets",
      errorTemplate: "src/error.html",
      hooks: {
        client: "src/hooks/client.ts",
        server: "src/hooks/server.ts",
      },
      params: "src/params",
      routes: "src/routes",
    },
  },
  vitePlugin: { inspector: { showToggleButton: "always", toggleButtonPos: "bottom-right" } },
};

export const componentConfig: Config = {
  preprocess: vitePreprocess(),
  kit: {
    files: {
      lib: "src",
      routes: "showcase",
      appTemplate: "app.html",
    },
  },
  vitePlugin: { inspector: { showToggleButton: "always", toggleButtonPos: "bottom-right" } },
};

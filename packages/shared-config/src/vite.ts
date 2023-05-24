import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfigExport } from "vite";

throw new Error(
  "DO NOT USE!\nShared Vite config breaks SvelteKit adapter functionality.\nSee https://github.com/sveltejs/kit/issues/10021 for details.",
);

export const viteConfig: UserConfigExport = {
  plugins: [sveltekit()],
};

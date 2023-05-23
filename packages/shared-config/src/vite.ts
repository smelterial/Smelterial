import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfigExport } from "vite";

export const viteConfig: UserConfigExport = {
  plugins: [sveltekit()],
};

import type { Config } from "prettier";
// @ts-expect-error - this lib has no types
import * as sveltePlugin from "prettier-plugin-svelte";

export const prettierConfig: Config = {
  useTabs: false,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  plugins: [sveltePlugin],
  pluginSearchDirs: ["."],
  overrides: [
    { files: "*.svelte", options: { parser: "svelte" } },
    { files: "*.md", options: { printWidth: 75, parser: "markdown", proseWrap: "always" } },
  ],
};

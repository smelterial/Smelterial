# Roadmap

Upcoming packages, features, changes, and fixes in Smelterial.

## Components

Smelterial is still early in development, meaning Material You components are
still being added.

Sorted by soonest planned release, here's a shortlist of components that are
coming soon:

- `@smelterial/you-icon`

  The icon component will allow easy zero-setup access to Google's Material
  Symbols. A simple API, fully typed right down to the icon names.

- `@smelterial/you-theme`

  The theme component will apply Material You colors to everything which sits
  within it (or you can apply it to the root by passing `global={true}`).
  The theme component can utilize any supported CSS color format, image
  elements, image URLs, or HCT strings to create your application's palette.

## Kit Utils

Kit Utils are utilities for SvelteKit+Vite projects. They stand entirely
separate from Smelterial's main focus (Material You components).

The goal of Kit utils is to make developing SvelteKit applications easier, one
tweak at a time.

Kit Utils are not expected to release until after a good base of Material You
components are available.

- `@smelterial/kitils-devblocks`

  Sometimes you have code which should only run during development. Simple, hide
  it behind an `if` statement which checks the runtime environment. But these
  blocks will show up in your production code, and the environment checks are
  run repeatedly.

  DevBlocks is a way to lace your code with development-only instructions
  without these instructions showing up in your production code at all.
  DevBlocks passes your Svelte, JS, and TS code at build time, and removes any
  blocks or statements which are labelled with `dev` (or whichever labels you
  configure).

  During development, DevBlocks will look at Svelte files. Any dev-only blocks
  it finds with a `$` prefix will be replaced with reactive statements. For
  example, if `dev` is a DevBlock, `$dev` is a reactive DevBlock, or if
  `$configured` is a DevBlock, then `$$configured` is a reactive DevBlock.

# Material Symbols Types (`./symbols.ts`)

## Updating These Types

In order to update these types, some manual work is needed.

1. Open the [Material Icons](https://fonts.google.com/icons) page.
2. Open the DevTools console and run the script shown at the end of this
   section
3. Copy the full console output into `symbols.ts`
4. Some browsers may add a debug line to the end of the copied text. Remove
   it
5. Inspect the generated TypeScript code
   - Ensure the code does not contain obvious errors or bugs
   - Ensure the code is formatted correctly

```js
new Promise((resolve) => {
  document.querySelector("footer").scrollIntoView();
  setTimeout(resolve, 1000);
}).then(() =>
  console.log(`// !!THESE TYPES ARE GENERATED. DO NOT EDIT MANUALLY!!

export type MaterialSymbols =
${[...document.querySelectorAll("icons-group")]
  .map((group) =>
    [...group.querySelectorAll("button.ng-star-inserted>span>span")].map(
      (icon) => icon.innerText,
    ),
  )
  .flat()
  .map((icon) => `  | "${icon}"`)
  .join("\n")};
`),
);
```

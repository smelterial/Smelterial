<!--
@component Icon

@see [Material You Documentation](https://m3.MaterialSymbol.io/styles/icons)

Add an icon using Material Symbols.

You can omit the `name` prop when using your custom symbols: instead, enter the ligature text as a
child of the component.

```html
<Icon name="[some builtin symbol]" />

<Icon>[your custom symbol]</Icon>
```
-->

<script lang="ts">
  import type { MaterialSymbols } from "./symbols.js";
  import { iconContext, type IconStyle } from "./context.js";

  /**
   * The symbol text to use.
   *
   * For custom icon packages, instead enter your ligature text as a child of this component.
   *
   * Defaults to an empty string for builtin icons. If no name is provided, and no custom ligature
   * is provided as a child, an error will be thrown.
   */
  export let name: MaterialSymbols = "" as MaterialSymbols;

  /**
   * The alt text to provide to screen readers.
   *
   * It is recommended to set this the majority of the time, as the semantic meaning of the icon
   * will typically differ to what it's ligature text would suggest.
   *
   * If this icon is purely decorative, or if it's within an item with an existing screen reader
   * friendly label, you should set this to an empty string to avoid out-of-context text being read
   * aloud.
   *
   * Defaults to the name of the icon, with underscores replaced with spaces.
   */
  export let altText = name.split("_").join(" ");

  const ctx = iconContext.get();

  /**
   * The style of Icon to use, either `"outlined"`, `"rounded"`, or `"sharp"`.
   *
   * For custom icon packages, you can set this to `custom__<classname>`, where `<classname>` is the
   * name of the CSS class for your custom icon package.
   *
   * Defaults to the value from the nearest `IconConfig` component, or `"outlined"` if none is found.
   */
  export let style = ctx.style;

  $: import(`./fonts/${style}.css`);

  /**
   * Whether the Icon should be filled or not.
   *
   * Defaults to the value from the nearest `IconConfig` component, or `false` if none is found.
   */
  export let fill = ctx.fill;

  /**
   * The weight of the Icon, from `100` to `900` in increments of `100`.
   *
   * Defaults to the value from the nearest `IconConfig` component, or `400` if none is found.
   */
  export let weight = ctx.weight;

  /**
   * The size of the Icon in pixels, either `20`, `24`, `40`, or `48`.
   *
   * Defaults to the value from the nearest `IconConfig` component, or `24` if none is found.
   */
  export let size = ctx.size;

  /**
   * The grade of the Icon, from `-25` to `200`.
   *
   * Defaults to the value from the nearest `IconConfig` component, or `0` if none is found.
   */
  export let grade = ctx.grade;

  const getClass = (style: IconStyle) => {
    if (style.startsWith("custom__")) return style.slice(8);
    return `material-symbols-${style}`;
  };
</script>

<span
  class={getClass(style)}
  style="font-variation-settings: 'FILL' {+fill}, 'wght' {weight}, 'GRAD' {grade}, 'opsz' {size}"
>
  <span class="sr-only">{altText}</span>
  <span aria-hidden="true">
    <slot>
      {name ||
        console.error(
          "No icon name provided.",
          `props: ${JSON.stringify({
            name,
            style,
            fill,
            weight,
            size,
            grade,
          })}`,
        )}
    </slot>
  </span>
</span>

<style lang="scss">
  .sr-only {
    border: 0 !important;
    clip: rect(1px, 1px, 1px, 1px) !important;
    -webkit-clip-path: inset(50%) !important;
    clip-path: inset(50%) !important;
    height: 1px !important;
    margin: -1px !important;
    overflow: hidden !important;
    padding: 0 !important;
    position: absolute !important;
    width: 1px !important;
    white-space: nowrap !important;
  }
</style>

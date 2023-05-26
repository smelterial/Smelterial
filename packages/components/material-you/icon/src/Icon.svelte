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

<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";

  export type IconStyle = "outlined" | "rounded" | "sharp" | `custom__${string}`;

  export type IconFill = boolean | 0 | 1 | `${0 | 1}`;

  export type IconSize = 20 | 24 | 40 | 48 | `${20 | 24 | 40 | 48}`;

  export type IconWeight =
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | `${100 | 200 | 300 | 400 | 500 | 600 | 700}`;

  export type IconGrade = number | `${number}`;

  export type IconContext =
    | {
        style: IconStyle;
        fill: IconFill;
        weight: IconWeight;
        size: IconSize;
        grade: IconGrade;
      }
    | undefined;

  export const defaultIconContext = {
    style: "outlined",
    fill: false,
    weight: 400,
    size: 24,
    grade: 0,
  } satisfies NonNullable<IconContext>;

  const contextKey = Symbol("iconContext");

  export const iconContext = {
    get: () => getContext<IconContext>(contextKey) ?? defaultIconContext,
    set: (context: IconContext): void =>
      void setContext(contextKey, { ...iconContext.get(), ...context }),
  };
</script>

<script lang="ts">
  import type { MaterialSymbols } from "./symbols.js";

  /**
   * Create this component in "config mode", which sets default configurations for other `Icon`
   * components.
   *
   * > **Note:** `alt` and `name` do nothing in this mode
   *
   * By passing in props to this component while in config mode, any icons which are children of
   * this component will inherit those props. The mechanism powering this is
   * [Svelte Context](https://svelte.dev/docs#run-time-svelte-setcontext), therefore it is
   * recommended to only use constant values as props to this component while in config mode.
   *
   * @example
   *
   * ```svelte
   * <Icon configMode fill weight="500" size="40" grade="200">
   *   // Filled, weight 500, size 40, grade 200
   *   <Icon/>
   *   // Not filled, weight 500, size 40, grade 200
   *   <Icon fill={false} />
   *   // Filled, weight 200, size 24, grade 200
   *   <Icon size="24" weight={200} />
   * </Icon>
   * ```
   */
  export let configMode = false;
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
  export let alt = name.split("_").join(" ");

  const ctx = iconContext.get();

  /**
   * The style of Icon to use, either `"outlined"`, `"rounded"`, or `"sharp"`.
   *
   * For custom icon packages, you can set this to `custom__<classname>`, where `<classname>` is the
   * name of the CSS class for your custom icon package.
   *
   * Defaults to the value from the nearest `configMode` parent, or `"outlined"` if none is found.
   */
  export let style = ctx.style;

  /**
   * Whether the Icon should be filled or not.
   *
   * Defaults to the value from the nearest `configMode` parent, or `false` if none is found.
   */
  export let fill = ctx.fill;

  /**
   * The weight of the Icon, from `100` to `900` in increments of `100`.
   *
   * Defaults to the value from the nearest `configMode` parent, or `400` if none is found.
   */
  export let weight = ctx.weight;

  /**
   * The size of the Icon in pixels, either `20`, `24`, `40`, or `48`.
   *
   * Defaults to the value from the nearest `configMode` parent, or `24` if none is found.
   */
  export let size = ctx.size;

  /**
   * The grade of the Icon, from `-25` to `200`.
   *
   * Defaults to the value from the nearest `configMode` parent, or `0` if none is found.
   */
  export let grade = ctx.grade;

  $: if (configMode) iconContext.set({ style, fill, weight, size, grade });

  const getClass = (style: IconStyle) => {
    if (style.startsWith("custom__")) return style.slice(8);
    return `material-symbols-${style}`;
  };
</script>

{#if !configMode}
  <span
    class={getClass(style)}
    style="font-variation-settings: 'FILL' {+fill}, 'wght' {weight}, 'GRAD' {grade}, 'opsz' {size}"
  >
    <span class="sr-only">{alt}</span>
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
{:else}
  <slot />
{/if}

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

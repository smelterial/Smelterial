<!--
@component IconComfig

Sets default configurations for the Icon component.

By passing in [Icon](./Icon.svelte) props to this component, any icons which are children of this
component will inherit those props. The mechanism powering this is
[Svelte Context](https://svelte.dev/docs#run-time-svelte-setcontext), therefore it is recommended to
only use constant values as props to this component.

@example

```html
<IconConfig fill weight="500" size="40" grade="200">
  <Icon/>                         // Filled,     weight 500, size 40, grade 200
  <Icon fill={false} />           // Not filled, weight 500, size 40, grade 200
  <Icon size="24" weight={200} /> // Filled,     weight 200, size 24, grade 200
</IconConfig>
```
-->

<script lang="ts">
  import { iconContext } from "./context.js";

  const ctx = iconContext.get();

  /**
   * @see The `Icon` component
   */
  export let style = ctx.style;
  $: import(`./fonts/${style}.css`);
  /**
   * @see The `Icon` component
   */
  export let fill = ctx.fill;
  /**
   * @see The `Icon` component
   */
  export let weight = ctx.weight;
  /**
   * @see The `Icon` component
   */
  export let size = ctx.size;
  /**
   * @see The `Icon` component
   */
  export let grade = ctx.grade;

  iconContext.set({ style, fill, weight, size, grade });
</script>

<slot />

<style lang="scss">
</style>

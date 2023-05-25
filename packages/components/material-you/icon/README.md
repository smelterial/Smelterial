[`@Smelterial/Smelterial`]: https://npmjs.com/package/@smelterial/smelterial
[Smelterial Showcase]: https://smelterial.dev/showcase/you-icon

# @Smelterial/You-Icon

Easy access to Google's Material Symbols. A simple API, fully typed right,
down to the icon names.

## Wait a Sec! You Probably Want More Than One Component

If not, no worries, go ahead.

If you do want the full Material You library from Smelterial, you should install
[`@Smelterial/Smelterial`]; it contains this component and more, along with some helpful tools.

## Try It Out

See an interactive showcase of this component on the [Smelterial Showcase].

## Usage

```svelte
<script>
  import Icon from "@Smelterial/you-icon/Icon.svelte";
  import IconConfig from "@Smelterial/you-icon/IconConfig.svelte";
</script>

<!--
  Default prop values
-->
<Icon fill={false} weight={400} size={24} grade={0} />

<!--
  Props can be number literals, or numeric strings
-->
<Icon fill={0} weight={400} size={24} grade={0} />
<Icon fill="0" weight="400" size="24" grade="0" />

<!--
  alt text is important! The semantic meaning of your use of an icon may differ
  from what the ligature text would otherwise suggest.
  see https://fonts.google.com/icons?icon.query=deployed_code_history
-->
<Icon
  name="deployed_code_history"
  alt="Waiting for cube"
  fill={false}
  weight={400}
  size={24}
  grade={0}
/>

<!--
  You can use IconConfig to apply styling defaults to all icons within it
  (including children of the current page/component)
-->
<IconConfig fill weight="500" size="40" grade="200">
  <!-- Filled, weight 500, size 40, grade 200 -->
  <Icon />
  <!-- Not filled, weight 500, size 40, grade 200 -->
  <Icon fill={false} />
  <!-- Filled, weight 200, size 24, grade 200 -->
  <Icon size="24" weight={200} />
  <!-- everything passed into the slot(s) inherit these defaults -->
  <slot />
</IconConfig>
```

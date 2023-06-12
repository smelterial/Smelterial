<script lang="ts">
  import { sequentialKeys } from "$lib/sequentialKeys.js";
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";

  let success: Writable<boolean>;

  onMount(() => {
    success = sequentialKeys([
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ]).persist;
  });
</script>

<header>
  <h1>Hi</h1>
  <h2>This Site doesn't Exist Yet</h2>
</header>
<p>In fact, all it's doing is serving the logo assets. Take a look;</p>
<div>
  {#each ["/logo-square.svg", "/logo.svg", "/logo-circle.svg"] as src}
    <img {src} alt="Smelterial Logo" />
  {/each}
</div>

<p id="konami">{$success ? "Nerd" : "|"}</p>

<style lang="scss">
  *,
  :global(body) {
    box-sizing: border-box;
    margin: 0.01px;
    padding: 0.01px;
  }
  :global(body) {
    height: 100vh;
    background: #222;
    color: #eee;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-block: 2rem;
    text-align: center;
  }

  div {
    padding-block: 1rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  img {
    width: min(40vh, 20vw);
    height: auto;
  }
</style>

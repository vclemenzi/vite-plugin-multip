<script lang="ts">
  let count = 0
</script>

<div>
  <span>{count}</span> <button on:click={() => (count += 1)}>Increment</button>
</div>

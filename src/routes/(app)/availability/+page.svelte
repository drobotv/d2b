<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { m } from "$lib/i18n";
  import { PlusIcon } from "lucide-svelte";

  let { data } = $props();
</script>

<header class="flex items-center">
  <div class="space-y-0.5">
    <h2 class="text-2xl font-bold">{m.availability()}</h2>
    <p class="text-muted-foreground">{m.availability_desc()}</p>
  </div>
</header>

<main></main>

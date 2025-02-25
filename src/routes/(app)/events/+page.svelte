<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { m } from "$lib/i18n";
  import { PlusIcon } from "lucide-svelte";

  let { data } = $props();
</script>

<header class="flex items-start justify-between">
  <div class="space-y-0.5">
    <h2 class="text-2xl font-bold tracking-tight">{m.event_types()}</h2>
    <p class="text-muted-foreground">{m.event_types_desc()}</p>
  </div>

  <Button>
    <PlusIcon />
    <span>{m.new_word()}</span>
  </Button>
</header>

<main></main>

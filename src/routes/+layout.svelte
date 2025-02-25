<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner";
  import { i18n } from "$lib/i18n";
  import { ParaglideJS } from "@inlang/paraglide-sveltekit";
  import "../app.css";

  let { children } = $props();
</script>

<Toaster richColors />

<ParaglideJS {i18n}>
  {@render children()}
</ParaglideJS>

<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { localizeHref } from "$lib/paraglide/runtime";
  import { ChevronLeft } from "lucide-svelte";

  const { children } = $props();
</script>

<main class="h-screen">
  <div
    class="bg-background relative container grid h-full grid-cols-1 flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0"
  >
    <div class="bg-muted relative hidden h-full flex-col border-r p-10 lg:flex">
      <img
        src="/images/placeholder.svg"
        alt="placeholder"
        width="1920"
        height="1080"
        class="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute top-0 left-0 p-4 lg:p-8">
        <Button variant="link" href={localizeHref("/")}><ChevronLeft /></Button>
      </div>
    </div>
    <div class="lg:p-8">
      <div class="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-2">
        {@render children()}
      </div>
    </div>
  </div>
</main>

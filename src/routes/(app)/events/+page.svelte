<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { page } from "$app/state";
  import EventCard from "$lib/components/events/EventCard.svelte";
  import EventDialog from "$lib/components/events/EventDialog.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { m } from "$lib/i18n";
  import { eventSchema } from "$lib/schemas/event";
  import type { Event } from "$lib/server/db/schema";
  import { adapter } from "$lib/utils/superform";
  import { CalendarIcon, PlusIcon } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms/client";

  let { data } = $props();
  let showDialog = $state(false);
  let isEditing = $state(false);

  const form = superForm(data.form, {
    validators: adapter(eventSchema),
    onResult: async ({ result }) => {
      if (result.type === "success") {
        toast.success(isEditing ? m.event_updated() : m.event_created());
        // invalidate events
        await invalidate("load:events");
        showDialog = false;
      }
    }
  });

  const { form: formData, enhance, errors, constraints } = form;

  function handleEdit(event: Event) {
    isEditing = true;
    formData.set({
      id: event.id,
      type: event.type,
      title: event.title,
      description: event.description || "",
      duration: event.duration,
      bufferTime: event.bufferTime,
      requiresConfirmation: Boolean(event.requiresConfirmation),
      isActive: Boolean(event.isActive)
    });
    showDialog = true;
  }
</script>

<svelte:head>
  <title>{m.event_types()} | D2B</title>
</svelte:head>

<header class="flex items-start justify-between">
  <div class="space-y-0.5">
    <h2 class="text-2xl font-bold tracking-tight">{m.event_types()}</h2>
    <p class="text-muted-foreground">{m.event_types_desc()}</p>
  </div>

  <Button
    onclick={() => {
      isEditing = false;
      form.reset();
      showDialog = true;
    }}
  >
    <PlusIcon class="mr-2 h-4 w-4" />
    <span>{m.new()}</span>
  </Button>
</header>

<main class="mt-8">
  {#if data.events.length === 0}
    <div class="border-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
      <div class="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <CalendarIcon class="text-muted-foreground h-10 w-10" />
      </div>
      <h3 class="mb-2 text-xl font-semibold">{m.no_event_types()}</h3>
      <p class="text-muted-foreground mb-8 max-w-md text-center">{m.create_event_types_desc()}</p>
      <Button
        size="lg"
        onclick={() => {
          isEditing = false;
          form.reset();
          showDialog = true;
        }}
      >
        <PlusIcon class="mr-2 h-5 w-5" />
        <span>{m.create_event_type()}</span>
      </Button>
    </div>
  {:else}
    <div class="overflow-hidden rounded-md border">
      {#each data.events as event (event.id)}
        <EventCard {event} onEdit={handleEdit} />
      {/each}
    </div>
  {/if}
</main>

<EventDialog {form} {isEditing} open={showDialog} onOpenChange={(open) => (showDialog = open)} />

<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { page } from "$app/state";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from "$lib/components/ui/alert-dialog";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import { m } from "$lib/i18n";
  import type { Event } from "$lib/server/db/schema";
  import { ClipboardCopyIcon, EditIcon, Trash2Icon } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  const { event, onEdit } = $props<{
    event: Event;
    onEdit: (event: Event) => void;
  }>();

  let showDeleteConfirm = $state(false);

  async function copyEventLink() {
    const url = `${page.url.origin}/${page.data.user.username}/${event.type}`;
    await navigator.clipboard.writeText(url);
    toast.success(m.link_copied());
  }

  async function toggleStatus() {
    const form = new FormData();
    form.append("id", event.id);
    form.append("isActive", (!event.isActive).toString());

    const response = await fetch("?/toggleStatus", {
      method: "POST",
      body: form
    });

    const result = await response.json();
    if (result.type === "success") {
      toast.success(event.isActive ? m.event_deactivated() : m.event_activated());
      await invalidate("load:events");
    } else {
      toast.error(m.toggle_status_failed());
    }
  }

  async function deleteEvent() {
    const form = new FormData();
    form.append("id", event.id);

    const response = await fetch("?/delete", {
      method: "POST",
      body: form
    });

    const result = await response.json();
    if (result.type === "success") {
      toast.success(m.event_deleted());
      await invalidate("load:events");
    } else {
      toast.error(m.delete_failed());
    }
  }
</script>

<div class="hover:bg-muted/30 flex items-center justify-between border-b px-4 py-4 transition-colors">
  <div class="flex items-center space-x-4">
    <div class="min-w-0 flex-1">
      <p class="mb-1 font-semibold">{event.title}</p>
      <Badge class="bg-muted rounded-md text-xs" variant="outline">{event.duration} {m.minutes()}</Badge>
      <Badge class="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5" variant="outline"
        >{`/${page.data.user.username}/${event.type}`}</Badge
      >
      {#if event.requiresConfirmation}
        <Badge class="bg-muted rounded-md text-xs" variant="outline">{m.requires_confirmation()}</Badge>
      {/if}
      {#if event.bufferTime}
        <Badge class="bg-muted rounded-md text-xs" variant="outline"
          >{m.buffer_time()}: {event.bufferTime} {m.minutes()}</Badge
        >
      {/if}
    </div>
  </div>

  <div class="flex items-center space-x-4">
    <div class="flex items-center space-x-2">
      <span class="text-muted-foreground text-sm">{event.isActive ? "" : m.inactive()}</span>
      <Switch checked={event.isActive} onCheckedChange={toggleStatus} />
    </div>

    <div class="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onclick={() => onEdit(event)} title={m.edit_event_type()}>
        <EditIcon class="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onclick={copyEventLink} title={m.link_copied()}>
        <ClipboardCopyIcon class="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onclick={() => (showDeleteConfirm = true)} title={m.delete()}>
        <Trash2Icon class="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>

<AlertDialog open={showDeleteConfirm} onOpenChange={(open) => (showDeleteConfirm = open)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{m.delete_event()}</AlertDialogTitle>
      <AlertDialogDescription>
        {m.delete_event_desc()}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>{m.cancel()}</AlertDialogCancel>
      <AlertDialogAction onclick={deleteEvent}>{m.delete()}</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

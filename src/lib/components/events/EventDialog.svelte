<script lang="ts">
  import { page } from "$app/state";
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
  } from "$lib/components/ui/dialog";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Switch from "$lib/components/ui/switch/switch.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { m } from "$lib/i18n";
  import type { EventSchema } from "$lib/schemas/event";
  import type { SuperForm } from "sveltekit-superforms";

  const { form, isEditing, open, onOpenChange } = $props<{
    form: SuperForm<EventSchema>;
    isEditing: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>();

  const { form: formData, enhance, errors } = form;
</script>

<Dialog {open} {onOpenChange}>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>{isEditing ? m.edit_event_type() : m.create_event_type()}</DialogTitle>
      <DialogDescription>
        {m.event_types_desc()}
      </DialogDescription>
    </DialogHeader>

    <form method="POST" action="?/createOrUpdate" use:enhance>
      {#if isEditing}
        <input type="hidden" name="id" bind:value={$formData.id} />
      {/if}

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="title">{m.name()}</Label>
          <Input
            id="title"
            name="title"
            bind:value={$formData.title}
            aria-invalid={$errors.title ? "true" : undefined}
          />
          {#if $errors.title}
            <div class="text-destructive text-sm">{$errors.title}</div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="type">{m.personal_link()}</Label>
          <div class="flex">
            <div
              class="bg-muted text-muted-foreground flex w-fit items-center rounded-l-md border border-r-0 px-3 text-sm text-nowrap"
            >
              {`/${page.data.user.username}/`}
            </div>
            <Input
              id="type"
              name="type"
              class="rounded-l-none"
              bind:value={$formData.type}
              aria-invalid={$errors.type ? "true" : undefined}
            />
          </div>
          {#if $errors.type}
            <div class="text-destructive text-sm">{$errors.type}</div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="description">{m.description()}</Label>
          <Textarea
            id="description"
            name="description"
            bind:value={$formData.description}
            aria-invalid={$errors.description ? "true" : undefined}
          />
          {#if $errors.description}
            <div class="text-destructive text-sm">{$errors.description}</div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="duration">{m.duration()}</Label>
          <div class="flex items-center gap-2">
            <Input
              id="duration"
              name="duration"
              type="number"
              class="w-24 appearance-none hover:appearance-auto"
              bind:value={$formData.duration}
              step="5"
              aria-invalid={$errors.duration ? "true" : undefined}
            />
            <span class="text-muted-foreground text-sm">{m.minutes()}</span>
          </div>
          {#if $errors.duration}
            <div class="text-destructive text-sm">{$errors.duration}</div>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="bufferTime">{m.buffer_time()}</Label>
          <div class="flex items-center gap-2">
            <Input
              id="bufferTime"
              name="bufferTime"
              type="number"
              class="w-24 appearance-none hover:appearance-auto"
              bind:value={$formData.bufferTime}
              step="5"
              aria-invalid={$errors.bufferTime ? "true" : undefined}
            />
            <span class="text-muted-foreground text-sm">{m.minutes()}</span>
          </div>
          {#if $errors.bufferTime}
            <div class="text-destructive text-sm">{$errors.bufferTime}</div>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <Switch
            id="requiresConfirmation"
            name="requiresConfirmation"
            checked={$formData.requiresConfirmation}
            onCheckedChange={(checked) => {
              $formData.requiresConfirmation = checked;
            }}
          />
          <Label for="requiresConfirmation">{m.requires_confirmation()}</Label>
        </div>

        <div class="flex items-center gap-2">
          <Switch
            id="isActive"
            name="isActive"
            checked={$formData.isActive}
            onCheckedChange={(checked) => {
              $formData.isActive = checked;
            }}
          />
          <Label for="isActive">{m.active()}</Label>
        </div>
      </div>

      <DialogFooter class="mt-6">
        <Button type="button" variant="ghost" onclick={() => onOpenChange(false)}>
          {m.cancel()}
        </Button>
        <Button type="submit">
          {isEditing ? m.update() : m.create()}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

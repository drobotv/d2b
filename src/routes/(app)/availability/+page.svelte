<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Form from "$lib/components/ui/form";
  import * as Select from "$lib/components/ui/select";
  import { Switch } from "$lib/components/ui/switch";
  import { m } from "$lib/i18n";
  import { availabilitySchema } from "$lib/schemas/availability";
  import { adapter, superForm } from "$lib/utils/superform";
  import { toast } from "svelte-sonner";

  let { data } = $props();

  const form = superForm(data.form, {
    dataType: "json",
    validators: adapter(availabilitySchema),
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success("Availability settings saved");
      }
    }
  });

  const { form: formData, enhance, errors } = form;

  const weekDays = [
    { id: "0", name: "Monday" },
    { id: "1", name: "Tuesday" },
    { id: "2", name: "Wednesday" },
    { id: "3", name: "Thursday" },
    { id: "4", name: "Friday" },
    { id: "5", name: "Saturday" },
    { id: "6", name: "Sunday" }
  ] as const;

  // Generate time options in 15-minute intervals
  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const minutes = i * 15;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return {
      value: minutes.toString(),
      label: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    };
  });

  function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  const timezones = Intl.supportedValuesOf("timeZone").map((tz) => ({
    value: tz,
    label: tz.replace(/_/g, " ")
  }));
</script>

<form method="POST" use:enhance>
  <header class="mb-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">{m.availability()}</h2>
      <Form.Button>Save</Form.Button>
    </div>
    <p class="text-muted-foreground">{m.availability_desc()}</p>
  </header>

  <main>
    <div class="flex flex-col-reverse gap-4 lg:flex-row">
      <div class="flex-1 space-y-8 rounded-lg border p-2">
        <Form.Field {form} name="availability" class="space-y-1">
          <Form.Control>
            {#snippet children({ props })}
              <!-- <p class="mb-2">Working week</p> -->
              {#each weekDays as day}
                <div class="flex flex-row items-center justify-between p-2">
                  <label class="flex cursor-pointer items-center gap-2">
                    <Switch bind:checked={$formData.availability[day.id].enabled} class="scale-75" />
                    <span class="text-sm">{day.name}</span>
                  </label>

                  <div class="flex items-center gap-2">
                    <Select.Root
                      type="single"
                      value={$formData.availability[day.id].start.toString()}
                      disabled={!$formData.availability[day.id].enabled}
                      onValueChange={(value) => {
                        $formData.availability[day.id].start = parseInt(value);
                      }}
                    >
                      <Select.Trigger class="w-[120px]">
                        <span>{minutesToTime($formData.availability[day.id].start)}</span>
                      </Select.Trigger>
                      <Select.Content>
                        {#each timeOptions as option}
                          <Select.Item value={option.value} label={option.label} />
                        {/each}
                      </Select.Content>
                    </Select.Root>

                    <span class="text-muted-foreground text-sm">to</span>

                    <Select.Root
                      type="single"
                      value={$formData.availability[day.id].end.toString()}
                      disabled={!$formData.availability[day.id].enabled}
                      onValueChange={(value) => {
                        $formData.availability[day.id].end = parseInt(value);
                      }}
                    >
                      <Select.Trigger class="w-[120px]">
                        <span>{minutesToTime($formData.availability[day.id].end)}</span>
                      </Select.Trigger>
                      <Select.Content>
                        {#each timeOptions as option}
                          <Select.Item value={option.value} label={option.label} />
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  </div>
                </div>
              {/each}
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <div class="w-full lg:w-72">
        <Form.Field {form} name="timeZone">
          <Form.Control>
            {#snippet children({ props })}
              <label>
                <p class="mb-2">Timezone</p>
                <Select.Root
                  type="single"
                  value={$formData.timeZone}
                  onValueChange={(value) => {
                    $formData.timeZone = value;
                  }}
                >
                  <Select.Trigger class="w-full">
                    <span>{$formData.timeZone.replace(/_/g, " ")}</span>
                  </Select.Trigger>
                  <Select.Content>
                    {#each timezones as tz}
                      <Select.Item value={tz.value} label={tz.label} />
                    {/each}
                  </Select.Content>
                </Select.Root>
              </label>
              <Form.Description>Select your timezone to ensure accurate scheduling</Form.Description>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>
    </div>
  </main>
</form>

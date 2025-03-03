<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Form from "$lib/components/ui/form";
  import * as Select from "$lib/components/ui/select";
  import { Switch } from "$lib/components/ui/switch";
  import { m } from "$lib/i18n";
  import { availabilitySchema } from "$lib/schemas/availability";
  import { adapter, superForm } from "$lib/utils/superform";
  import { Copy, RotateCcw } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  let { data } = $props();

  console.log("Initial data from server:", data.form.data);

  const form = superForm(data.form, {
    dataType: "json",
    validators: adapter(availabilitySchema),
    resetForm: false,
    taintedMessage: null,
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success("Availability settings saved");
      }
    }
  });

  const { form: formData, enhance, tainted, submitting, reset } = form;

  console.log("Initial form data:", $formData);

  const weekDays = [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" },
    { id: 5, name: "Saturday" },
    { id: 6, name: "Sunday" }
  ] as const;

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

  function copySchedule(fromDayId: number) {
    const sourceDay = $formData.weeklySchedule[fromDayId as keyof typeof $formData.weeklySchedule];
    weekDays.forEach((day) => {
      if (day.id !== fromDayId) {
        $formData.weeklySchedule[day.id as keyof typeof $formData.weeklySchedule] = {
          ...sourceDay,
          enabled: $formData.weeklySchedule[day.id as keyof typeof $formData.weeklySchedule].enabled
        };
      }
    });
    toast.info("Schedule copied to other days");
  }

  if (!$formData.timeZone && !data.form.data.timeZone) {
    console.log("Setting default timezone because none was provided");
    $formData.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
</script>

<form method="POST" use:enhance>
  <header class="mb-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">{m.availability()}</h2>
      <span>
        <Button variant="ghost" size="sm" type="button" onclick={reset} disabled={$submitting || !$tainted}>
          <RotateCcw />
        </Button>
        <Form.Button disabled={$submitting || !$tainted}>Save</Form.Button>
      </span>
    </div>
    <p class="text-muted-foreground">{m.availability_desc()}</p>
  </header>

  <main class="space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row">
      <div class="flex-1 space-y-8">
        <Form.Field {form} name="weeklySchedule" class="space-y-1">
          <Form.Control>
            {#snippet children()}
              <Card.Root>
                <Card.Header>
                  <Card.Title>Weekly Hours</Card.Title>
                  <Card.Description
                    >Set your weekly working hours. You can override these for specific dates later.</Card.Description
                  >
                </Card.Header>
                <Card.Content class="space-y-4">
                  {#each weekDays as day}
                    <div class="group relative flex flex-row items-center justify-between p-2">
                      <label class="flex cursor-pointer items-center gap-2">
                        <Switch bind:checked={$formData.weeklySchedule[day.id].enabled} class="scale-75" />
                        <span class="text-sm">{day.name}</span>
                      </label>

                      <div class="flex items-center gap-2">
                        <Select.Root
                          type="single"
                          value={$formData.weeklySchedule[day.id].start.toString()}
                          disabled={!$formData.weeklySchedule[day.id].enabled}
                          onValueChange={(value) => {
                            const start = parseInt(value);
                            $formData.weeklySchedule[day.id].start = start;
                            if ($formData.weeklySchedule[day.id].end <= start) {
                              $formData.weeklySchedule[day.id].end = Math.min(start + 60, 1439);
                            }
                          }}
                        >
                          <Select.Trigger class="w-[120px]">
                            <span>{minutesToTime($formData.weeklySchedule[day.id].start)}</span>
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
                          value={$formData.weeklySchedule[day.id].end.toString()}
                          disabled={!$formData.weeklySchedule[day.id].enabled}
                          onValueChange={(value) => {
                            const end = parseInt(value);
                            $formData.weeklySchedule[day.id].end = end;
                            if ($formData.weeklySchedule[day.id].start >= end) {
                              $formData.weeklySchedule[day.id].start = Math.max(end - 60, 0);
                            }
                          }}
                        >
                          <Select.Trigger class="w-[120px]">
                            <span>{minutesToTime($formData.weeklySchedule[day.id].end)}</span>
                          </Select.Trigger>
                          <Select.Content>
                            {#each timeOptions as option}
                              <Select.Item value={option.value} label={option.label} />
                            {/each}
                          </Select.Content>
                        </Select.Root>

                        <Button
                          variant="ghost"
                          size="icon"
                          class="opacity-0 transition-opacity group-hover:opacity-100"
                          type="button"
                          onclick={() => copySchedule(day.id)}
                        >
                          <Copy class="h-4 w-4" />
                          <span class="sr-only">Copy this schedule to other days</span>
                        </Button>
                      </div>
                    </div>
                  {/each}
                </Card.Content>
              </Card.Root>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <div class="w-full lg:w-72">
        <Form.Field {form} name="timeZone">
          <Form.Control>
            {#snippet children()}
              <Card.Root>
                <Card.Header>
                  <Card.Title>Time Zone</Card.Title>
                  <Card.Description>Select your timezone to ensure accurate scheduling</Card.Description>
                </Card.Header>
                <Card.Content>
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
                </Card.Content>
              </Card.Root>
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>
    </div>
  </main>
</form>

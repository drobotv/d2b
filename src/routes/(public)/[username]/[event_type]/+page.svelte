<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import BookingConfirmation from "$lib/components/booking/BookingConfirmation.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Form from "$lib/components/ui/form";
  import { bookingSchema } from "$lib/schemas/booking";
  import { adapter, superForm } from "$lib/utils/superform";
  import type { TimeSlot } from "$lib/utils/timeSlots";
  import { formatTimeSlot } from "$lib/utils/timeSlots";
  import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-svelte";

  let { data } = $props();

  // Get URL parameters
  let selectedDate = $state<string | null>(page.url.searchParams.get("date") || null);
  let selectedTime = $state<string | null>(page.url.searchParams.get("time") || null);
  let showBookingForm = $state(Boolean(page.url.searchParams.get("booking")));
  let bookingComplete = $state(false);

  let currentDate = $state(new Date());

  // Initialize the form
  const form = superForm(data.form, {
    validators: adapter(bookingSchema),
    onResult: ({ result }) => {
      if (result.type === "success" && result.data?.success) {
        bookingComplete = true;
      }
    }
  });

  const { form: formData, enhance, errors, constraints, submitting } = form;

  // Initialize current date from selected date if available
  $effect(() => {
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-").map(Number);
      currentDate = new Date(year, month - 1, day);
    }
  });

  // Get the first date with available slots if no date is selected
  $effect(() => {
    if (!selectedDate) {
      const dates = Object.keys(data.timeSlots);
      if (dates.length > 0) {
        // Find the first date with available slots
        for (const date of dates) {
          if (data.timeSlots[date].length > 0) {
            selectDate(date);
            break;
          }
        }
      }
    }
  });

  // Use derived values instead of effects for reactive calculations
  let timeSlotsForSelectedDate = $derived(selectedDate ? data.timeSlots[selectedDate] || [] : []);

  let selectedSlot = $derived.by(() => {
    if (selectedTime && timeSlotsForSelectedDate.length > 0) {
      return timeSlotsForSelectedDate.find((slot) => slot.start.toISOString() === selectedTime) || null;
    }
    return null;
  });

  // Update form data when selection changes
  $effect(() => {
    if (selectedDate && selectedSlot) {
      // Use the correct way to update form data
      $formData.eventTypeId = data.event.id;
      $formData.date = selectedDate;
      $formData.startTime = selectedSlot.start.toISOString();
    }
  });

  // Update URL when selection changes
  function updateUrl(resetTime = false) {
    const url = new URL(window.location.href);

    if (selectedDate) {
      url.searchParams.set("date", selectedDate);
    } else {
      url.searchParams.delete("date");
    }

    if (selectedTime && !resetTime) {
      url.searchParams.set("time", selectedTime);
    } else {
      url.searchParams.delete("time");
      selectedTime = null;
    }

    if (showBookingForm) {
      url.searchParams.set("booking", "true");
    } else {
      url.searchParams.delete("booking");
    }

    goto(url.toString(), { replaceState: true, noScroll: true });
  }

  function selectDate(date: string) {
    selectedDate = date;
    const [year, month, day] = date.split("-").map(Number);
    currentDate = new Date(year, month - 1, day);
    updateUrl(true);
  }

  function selectTimeSlot(slot: TimeSlot) {
    selectedTime = slot.start.toISOString();
    updateUrl();
  }

  function startBooking() {
    showBookingForm = true;
    updateUrl();
  }

  // Calendar navigation functions
  function prevMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  // Calendar generation
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function generateCalendarDays(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Adjust for Sunday as first day (0) to Monday as first day (0)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    for (let i = 0; i < adjustedFirstDay; i++) {
      const day = daysInPrevMonth - adjustedFirstDay + i + 1;
      days.push({
        day,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
        date: `${prevMonthYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        date,
        hasSlots: data.timeSlots[date]?.length > 0
      });
    }

    // Next month days
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length; // 6 rows of 7 days

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
        date: `${nextMonthYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      });
    }

    return days;
  }

  // Format functions
  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }

  // Check if a date is in the past
  function isDateInPast(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  }

  // Check if a date is today
  function isToday(dateString: string): boolean {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  }
</script>

<svelte:head>
  <title>{data.event.title} | {data.username}</title>
</svelte:head>

{#if bookingComplete && page.form?.booking && page.form?.event}
  <!-- Booking Confirmation View -->
  <main class="container flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
    <BookingConfirmation
      booking={page.form.booking}
      event={page.form.event}
      timeZone={data.availability.timeZone}
      username={data.username}
    />
  </main>
{:else if !showBookingForm}
  <main class="container flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
    <div class="mx-auto w-full max-w-5xl">
      <Card.Root class="overflow-hidden rounded-b-none">
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Event Details Column -->
          <div class="flex h-full flex-col p-6 md:border-r">
            <div class="mb-4">
              <h2 class="text-2xl font-bold">{data.event.title}</h2>
              <p class="text-muted-foreground">Hosted by {data.username}</p>
            </div>

            <div class="flex flex-1 flex-col space-y-4">
              <div class="flex items-start gap-3">
                <Clock class="text-muted-foreground mt-0.5 h-5 w-5" />
                <div>
                  <p class="font-medium">{formatDuration(data.event.duration)}</p>
                  {#if data.event.bufferTime > 0}
                    <p class="text-muted-foreground text-sm">
                      {formatDuration(data.event.bufferTime)} buffer time
                    </p>
                  {/if}
                </div>
              </div>

              <div class="flex items-start gap-3">
                <Calendar class="text-muted-foreground mt-0.5 h-5 w-5" />
                <div>
                  <p class="font-medium">Time zone</p>
                  <p class="text-muted-foreground text-sm">{data.availability.timeZone.replace(/_/g, " ")}</p>
                </div>
              </div>

              {#if data.event.description}
                <div class="flex flex-1 flex-col border-t pt-4">
                  <h3 class="mb-2 text-sm font-medium">About this event</h3>
                  <div class="text-muted-foreground flex-1 overflow-y-auto text-sm whitespace-pre-line">
                    {data.event.description}
                  </div>
                </div>
              {/if}

              {#if data.event.requiresConfirmation}
                <div class="bg-muted mt-auto rounded-md p-3 text-sm">
                  <p class="font-medium">This event requires confirmation</p>
                  <p class="text-muted-foreground">The host will confirm or decline your booking request.</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Calendar Column -->
          <div class="border-t p-6 md:border-t-0 md:border-r">
            <div class="flex flex-row items-center justify-between pb-4">
              <div class="text-center">
                <h3 class="text-xl font-medium">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
              </div>
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon" onclick={prevMonth}>
                  <ChevronLeft class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onclick={nextMonth}>
                  <ChevronRight class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7 gap-1">
              <!-- Weekday headers -->
              {#each ["M", "T", "W", "T", "F", "S", "S"] as day}
                <div class="py-1 text-center text-sm font-medium">{day}</div>
              {/each}

              <!-- Calendar days -->
              {#each generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth()) as { day, isCurrentMonth, date, hasSlots }}
                <button
                  class="relative flex aspect-square items-center justify-center rounded-md text-sm
                    {isCurrentMonth ? '' : 'text-muted-foreground opacity-50'}
                    {selectedDate === date ? 'bg-primary text-primary-foreground' : ''}
                    {hasSlots && isCurrentMonth && !isDateInPast(date) ? 'font-medium' : ''}
                    {isDateInPast(date) && isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                    {isToday(date) && isCurrentMonth && selectedDate !== date ? 'bg-muted' : ''}
                    {hasSlots && isCurrentMonth && !isDateInPast(date) && selectedDate !== date ? 'hover:bg-muted' : ''}
                    {!hasSlots || isDateInPast(date) || !isCurrentMonth ? 'cursor-not-allowed' : 'cursor-pointer'}"
                  disabled={!hasSlots || isDateInPast(date) || !isCurrentMonth}
                  onclick={() => selectDate(date)}
                >
                  {day}
                  {#if hasSlots && isCurrentMonth && !isDateInPast(date)}
                    <span class="bg-primary absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"></span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- Time Slots Column -->
          <div class="border-t p-6 md:border-t-0">
            <div class="mb-4">
              <h3 class="text-lg font-medium">
                {selectedDate ? formatDate(selectedDate) : "Select a date"}
              </h3>
              <p class="text-muted-foreground text-sm">
                {timeSlotsForSelectedDate.length > 0
                  ? `${timeSlotsForSelectedDate.length} available time slots`
                  : "No available time slots"}
              </p>
            </div>

            {#if timeSlotsForSelectedDate.length > 0}
              <div class="grid max-h-[350px] grid-cols-1 gap-2 overflow-y-auto pr-2">
                {#each timeSlotsForSelectedDate as slot}
                  <Button
                    variant={selectedTime === slot.start.toISOString() ? "default" : "outline"}
                    class="h-auto justify-start px-4 py-3"
                    onclick={() => selectTimeSlot(slot)}
                  >
                    <div class="text-left">
                      <p class="font-medium">
                        {formatTimeSlot(slot.start, data.availability.timeZone)} -
                        {formatTimeSlot(slot.end, data.availability.timeZone)}
                      </p>
                    </div>
                  </Button>
                {/each}
              </div>
            {:else if selectedDate}
              <div class="text-muted-foreground py-8 text-center">
                <p>No available time slots for this date.</p>
                <p class="mt-2 text-sm">Please select another date.</p>
              </div>
            {:else}
              <div class="text-muted-foreground py-8 text-center">
                <p>Please select a date to view available time slots.</p>
              </div>
            {/if}
          </div>
        </div>
      </Card.Root>

      <div class="bg-background rounded-b-md border border-t-0 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            {#if selectedDate && selectedSlot}
              <p class="font-medium">{formatDate(selectedDate)}</p>
              <p class="text-muted-foreground text-sm">
                {formatTimeSlot(selectedSlot.start, data.availability.timeZone)} -
                {formatTimeSlot(selectedSlot.end, data.availability.timeZone)}
              </p>
            {:else}
              <p class="text-muted-foreground">Select a date and time to continue</p>
            {/if}
          </div>
          <Button disabled={!selectedDate || !selectedSlot} onclick={startBooking}>
            Continue
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </main>
{:else}
  <!-- Booking Form -->
  <main class="container flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
    <div class="mx-auto w-full max-w-md">
      <Card.Root class="rounded-b-none p-6">
        <Card.Header>
          <Card.Title>Complete your booking</Card.Title>
          <Card.Description>
            {data.event.title} with {data.username} on {formatDate(selectedDate || "")}
            {#if selectedSlot}
              at {formatTimeSlot(selectedSlot.start, data.availability.timeZone)}
            {/if}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/createBooking" use:enhance class="space-y-4">
            <!-- Hidden fields for event and time data -->
            <input type="hidden" name="eventTypeId" bind:value={$formData.eventTypeId} />
            <input type="hidden" name="date" bind:value={$formData.date} />
            <input type="hidden" name="startTime" bind:value={$formData.startTime} />

            <Form.Field {form} name="guestName">
              <Form.Control>
                {#snippet children({ props })}
                  <div class="space-y-2">
                    <Form.Label>Your Name</Form.Label>
                    <input
                      {...props}
                      type="text"
                      class="border-input bg-background w-full rounded-md border px-3 py-2"
                      placeholder="John Doe"
                      bind:value={$formData.guestName}
                    />
                  </div>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="guestEmail">
              <Form.Control>
                {#snippet children({ props })}
                  <div class="space-y-2">
                    <Form.Label>Email Address</Form.Label>
                    <input
                      {...props}
                      type="email"
                      class="border-input bg-background w-full rounded-md border px-3 py-2"
                      placeholder="john@example.com"
                      bind:value={$formData.guestEmail}
                    />
                  </div>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="notes">
              <Form.Control>
                {#snippet children({ props })}
                  <div class="space-y-2">
                    <Form.Label>Additional Notes</Form.Label>
                    <textarea
                      {...props}
                      class="border-input bg-background w-full rounded-md border px-3 py-2"
                      rows="3"
                      placeholder="Any additional information you'd like to share"
                      bind:value={$formData.notes}
                    ></textarea>
                  </div>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <div class="pt-4">
              <Form.Button class="w-full" disabled={$submitting}>
                {$submitting ? "Confirming..." : "Confirm Booking"}
              </Form.Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>

      <!-- Connected Footer for Booking Form -->
      <div class="bg-background rounded-b-md border border-t-0 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            {#if selectedDate && selectedSlot}
              <p class="font-medium">{formatDate(selectedDate)}</p>
              <p class="text-muted-foreground text-sm">
                {formatTimeSlot(selectedSlot.start, data.availability.timeZone)} -
                {formatTimeSlot(selectedSlot.end, data.availability.timeZone)}
              </p>
            {/if}
          </div>
          <Button
            variant="outline"
            onclick={() => {
              showBookingForm = false;
              updateUrl();
            }}
          >
            Back to calendar
          </Button>
        </div>
      </div>
    </div>
  </main>
{/if}

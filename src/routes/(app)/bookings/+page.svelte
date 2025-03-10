<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/state";
  import * as Accordion from "$lib/components/ui/accordion";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Textarea } from "$lib/components/ui/textarea";
  import { m } from "$lib/i18n";
  import type { Booking } from "$lib/server/db/schema";
  import { CalendarIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  let { data } = $props();
  let cancelDialogOpen = $state(false);
  let selectedBooking: Booking | null = $state(null);
  let cancelMessage = $state("");
  let expandedItems = $state<string[]>([]);

  let selectedStatus = $state(page.url.searchParams.get("status") || data.status || "all");

  // Status options for tabs
  const statusOptions = [
    { value: "all", label: m.all() },
    { value: "pending", label: m.pending() },
    { value: "confirmed", label: m.confirmed() },
    { value: "cancelled", label: m.cancelled() },
    { value: "completed", label: m.completed() }
  ];

  async function handleTabChange(value: string) {
    selectedStatus = value;
    goto(`?status=${value}`, { replaceState: true });
  }

  function getStatusBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  }

  function openCancelDialog(booking: Booking) {
    selectedBooking = booking;
    cancelDialogOpen = true;
  }

  async function confirmBooking(booking: Booking) {
    const form = new FormData();
    form.append("bookingId", booking.id);

    const response = await fetch("?/confirm", {
      method: "POST",
      body: form
    });

    const result = await response.json();

    if (result.type === "success") {
      toast.success(m.booking_confirmed());
      await invalidate("load:bookings");
    } else {
      toast.error(result.message || m.error_occurred());
    }
  }

  function getDayLabel(date: Date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formattedDate = date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    if (date.toDateString() === today.toDateString()) {
      return `${m.today()} - ${formattedDate}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `${m.yesterday()} - ${formattedDate}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${m.tomorrow()} - ${formattedDate}`;
    } else {
      return formattedDate;
    }
  }

  function groupBookingsByDay(bookings: Booking[]) {
    const groups: Record<string, Booking[]> = {};

    bookings.forEach((booking) => {
      const dayLabel = getDayLabel(booking.startTime);
      if (!groups[dayLabel]) {
        groups[dayLabel] = [];
      }
      groups[dayLabel].push(booking);
    });

    return Object.entries(groups);
  }

  const groupedBookings = $derived(groupBookingsByDay(data.bookings));
</script>

<svelte:head>
  <title>{m.bookings()} | D2B</title>
</svelte:head>

<header class="flex items-start justify-between">
  <div class="space-y-0.5">
    <h2 class="text-2xl font-bold tracking-tight">{m.bookings()}</h2>
    <p class="text-muted-foreground">{m.bookings_desc()}</p>
  </div>
</header>

<Tabs.Root value={selectedStatus} onValueChange={handleTabChange} class="mt-6">
  <Tabs.List class=" grid max-w-md grid-cols-5">
    {#each statusOptions as option}
      <Tabs.Trigger value={option.value}>{option.label}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>

<main class="mt-6">
  {#if data.bookings.length === 0}
    <div class="border-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
      <div class="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <CalendarIcon class="text-muted-foreground h-10 w-10" />
      </div>
      <h3 class="mb-2 text-xl font-semibold">{m.no_bookings()}</h3>
      <p class="text-muted-foreground mb-8 max-w-md text-center">{m.no_bookings_desc()}</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each groupedBookings as [dayLabel, bookings]}
        <div class="relative">
          <div class="bg-background sticky top-0 z-10 mb-2 flex items-center gap-2">
            <div class="bg-muted text-muted-foreground rounded-md px-3 py-1 text-sm font-medium">
              {dayLabel}
            </div>
            <div class="bg-muted h-px flex-1"></div>
          </div>
          <div class="overflow-hidden rounded-md border">
            <Accordion.Root type="multiple" value={expandedItems} onValueChange={(value) => (expandedItems = value)}>
              {#each bookings as booking (booking.id)}
                <Accordion.Item value={booking.id} class="border-b last:border-0">
                  <div class="p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="flex items-center gap-2">
                          <div class="font-medium">{booking.eventName}</div>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                        </div>
                        <div class="font-medium">{booking.guestName}</div>
                        <div class="text-muted-foreground text-sm">{booking.guestEmail}</div>
                      </div>
                      <div class="flex items-center gap-2">
                        {#if booking.status === "pending"}
                          <Button variant="outline" size="sm" onclick={() => openCancelDialog(booking)}>
                            <XIcon class="mr-2 h-4 w-4" />
                            {m.cancel()}
                          </Button>
                          <Button variant="default" size="sm" onclick={() => confirmBooking(booking)}>
                            <CheckIcon class="mr-2 h-4 w-4" />
                            {m.confirm()}
                          </Button>
                        {/if}
                        {#if booking.status === "confirmed"}
                          <Button variant="outline" size="sm" onclick={() => openCancelDialog(booking)}>
                            <XIcon class="mr-2 h-4 w-4" />
                            {m.cancel()}
                          </Button>
                        {/if}
                      </div>
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                      <div class="text-muted-foreground text-sm">
                        {dayLabel}
                        {booking.startTime.toLocaleTimeString()} - {booking.endTime.toLocaleTimeString()}
                      </div>
                      <Accordion.Trigger class="p-0"></Accordion.Trigger>
                    </div>
                  </div>
                  <Accordion.Content class="bg-muted/30 border-t px-4 py-3">
                    <div class="grid gap-2 text-sm">
                      <div class="grid grid-cols-2">
                        <span class="text-muted-foreground">{m.start_time()}:</span>
                        <span>{booking.startTime.toLocaleString()}</span>
                      </div>
                      <div class="grid grid-cols-2">
                        <span class="text-muted-foreground">{m.end_time()}:</span>
                        <span>{booking.endTime.toLocaleString()}</span>
                      </div>
                      {#if booking.notes}
                        <div class="mt-1">
                          <span class="text-muted-foreground">{m.notes()}:</span>
                          <p class="mt-1">{booking.notes}</p>
                        </div>
                      {/if}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              {/each}
            </Accordion.Root>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<!-- Cancel Booking Dialog -->
<Dialog.Root bind:open={cancelDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.cancel_booking()}</Dialog.Title>
      <Dialog.Description>
        {m.cancel_booking_desc()}
      </Dialog.Description>
    </Dialog.Header>

    <form
      method="POST"
      action="?/cancel"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            toast.success(m.booking_cancelled());
            cancelDialogOpen = false;
            cancelMessage = "";
            await invalidate("load:bookings");
          } else {
            toast.error(m.error_occurred());
          }
        };
      }}
    >
      <input type="hidden" name="bookingId" value={selectedBooking?.id} />

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label for="message" class="text-sm font-medium">{m.cancellation_message()}</label>
          <Textarea
            id="message"
            name="message"
            bind:value={cancelMessage}
            rows={3}
            class="w-full rounded-md border p-2"
            placeholder={m.optional_message()}
          ></Textarea>
        </div>
      </div>

      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (cancelDialogOpen = false)}>
          {m.cancel()}
        </Button>
        <Button type="submit" variant="destructive">
          {m.confirm_cancellation()}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

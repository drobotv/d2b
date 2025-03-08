<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { formatTimeSlot } from "$lib/utils/timeSlots";
  import { Calendar, CheckCircle, Clock, Mail } from "lucide-svelte";

  export let booking: {
    guestName: string;
    guestEmail: string;
    startTime: Date;
    endTime: Date;
  };
  export let event: {
    title: string;
    requiresConfirmation: boolean;
  };
  export let timeZone: string;
  export let username: string;

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function goToHome() {
    goto("/");
  }
</script>

<div class="mx-auto w-full max-w-md">
  <Card.Root>
    <Card.Header class="text-center">
      <div class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <CheckCircle class="text-primary h-6 w-6" />
      </div>
      <Card.Title class="text-xl">
        {event.requiresConfirmation ? "Booking request sent" : "Booking confirmed"}
      </Card.Title>
      <Card.Description>
        {event.requiresConfirmation
          ? "Your booking request has been sent to the host for confirmation."
          : "Your booking has been confirmed."}
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="mt-6 space-y-4">
        <div class="bg-muted rounded-lg p-4">
          <h3 class="font-medium">{event.title}</h3>
          <p class="text-muted-foreground text-sm">with {username}</p>

          <div class="mt-3 space-y-2">
            <div class="flex items-start gap-3">
              <Calendar class="text-muted-foreground mt-0.5 h-4 w-4" />
              <div class="text-sm">
                <p>{formatDate(booking.startTime)}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Clock class="text-muted-foreground mt-0.5 h-4 w-4" />
              <div class="text-sm">
                <p>
                  {formatTimeSlot(booking.startTime, timeZone)} -
                  {formatTimeSlot(booking.endTime, timeZone)}
                </p>
                <p class="text-muted-foreground text-xs">{timeZone.replace(/_/g, " ")}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Mail class="text-muted-foreground mt-0.5 h-4 w-4" />
              <div class="text-sm">
                <p>{booking.guestEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h3 class="text-sm font-medium">What happens next?</h3>
          {#if event.requiresConfirmation}
            <p class="text-muted-foreground mt-2 text-sm">
              We've sent an email to {booking.guestEmail} with the details of your booking request. You'll receive another
              email once the host confirms or declines your request.
            </p>
          {:else}
            <p class="text-muted-foreground mt-2 text-sm">
              We've sent an email to {booking.guestEmail} with the details of your booking. You'll receive a calendar invitation
              that you can add to your calendar.
            </p>
          {/if}
        </div>

        <Button class="w-full" onclick={goToHome}>Done</Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>

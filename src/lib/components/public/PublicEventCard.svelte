<script lang="ts">
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import * as Card from "$lib/components/ui/card";
  import { m } from "$lib/i18n";
  import { localizeHref } from "$lib/paraglide/runtime";
  import { Calendar, Clock } from "lucide-svelte";

  const { event, username } = $props<{
    event: {
      title: string;
      type: string;
      description: string | null;
      duration: number;
      bufferTime: number;
      requiresConfirmation: boolean;
    };
    username: string;
  }>();

  const hasBadges = $derived(event.requiresConfirmation || event.bufferTime > 0);

  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} ${m.minutes()}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} ${m.minutes()}` : `${hours} hr`;
  }
</script>

<a href={localizeHref(`/${username}/${event.type}`)} class="block h-full">
  <Card.Root class="hover:border-primary h-full transition-all duration-200">
    <Card.Content class="flex h-full flex-col p-5">
      <div class="flex h-full flex-col space-y-3">
        <h3 class="line-clamp-2 text-xl font-semibold">{event.title}</h3>

        <div class="flex items-center gap-1.5">
          <Clock class="text-muted-foreground h-4 w-4" />
          <span class="text-sm">{formatDuration(event.duration)}</span>
        </div>

        {#if hasBadges}
          <div class="mt-1 flex flex-wrap gap-2">
            {#if event.requiresConfirmation}
              <Badge variant="outline" class="bg-muted text-xs">{m.requires_confirmation()}</Badge>
            {/if}

            {#if event.bufferTime > 0}
              <Badge variant="outline" class="bg-muted text-xs"
                >{`${m.buffer_time()}: ${formatDuration(event.bufferTime)}`}</Badge
              >
            {/if}
          </div>
        {/if}

        {#if event.description}
          <div class="mt-2 flex-grow">
            <p class="text-muted-foreground max-h-[{hasBadges ? '80px' : '120px'}] overflow-y-auto pr-1 text-sm">
              {event.description}
            </p>
          </div>
        {/if}

        <div class="text-primary mt-auto flex items-center pt-2 text-sm font-medium">
          <Calendar class="mr-1.5 h-4 w-4" />
          <span>{m.schedule_a_meeting()}</span>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</a>

<script lang="ts">
  import PublicEventCard from "$lib/components/public/PublicEventCard.svelte";
  import * as Card from "$lib/components/ui/card";
  import { m } from "$lib/i18n";
  import { Clock, MapPin } from "lucide-svelte";
  import { LngLat } from "maplibre-gl";
  import { DefaultMarker, MapLibre } from "svelte-maplibre";

  let { data } = $props();

  function formatName(firstName: string | null, lastName: string | null, username: string): string {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return username;
    }
  }
</script>

<svelte:head>
  <title>{data.user.username} | {m.events()}</title>
</svelte:head>

<main class="container flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
  <div class="mx-auto w-full max-w-5xl">
    <Card.Root class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2">
        <div class="flex h-full flex-col p-6 md:border-r">
          <div class="mb-6">
            <h2 class="text-2xl font-bold">
              {formatName(data.user.firstName, data.user.lastName, data.user.username)}
            </h2>
            <p class="text-muted-foreground">@{data.user.username}</p>
          </div>

          <div class="flex flex-1 flex-col space-y-5">
            {#if data.user.bio}
              <div class="flex flex-col">
                <h3 class="mb-2 text-sm font-medium">{m.about()}</h3>
                <div class="text-muted-foreground text-sm whitespace-pre-line">
                  {data.user.bio}
                </div>
              </div>
            {/if}

            <div class="flex items-start gap-3">
              <Clock class="text-muted-foreground h-5 w-5 flex-shrink-0" />
              <div>
                <p class="font-medium">{m.time_zone()}</p>
                <p class="text-muted-foreground text-sm">{data.availability.timeZone.replace(/_/g, " ")}</p>
              </div>
            </div>

            {#if data.location}
              <div class="flex items-start gap-3">
                <MapPin class="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <div>
                  <p class="font-medium">{data.location.name}</p>
                  <p class="text-muted-foreground text-sm">{data.location.address}</p>
                  {#if data.location.description}
                    <p class="text-muted-foreground mt-1 text-sm">{data.location.description}</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="border-t md:border-t-0">
          {#if data.location}
            <div class="relative h-full w-full overflow-hidden rounded-md">
              <MapLibre
                style="https://tiles.openfreemap.org/styles/bright"
                standardControls
                zoom={12}
                center={new LngLat(data.location.lng, data.location.lat)}
              >
                <DefaultMarker lngLat={new LngLat(data.location.lng, data.location.lat)} />
              </MapLibre>
            </div>
          {:else}
            <div class="bg-muted flex h-[300px] items-center justify-center rounded-md">
              <p class="text-muted-foreground text-center">{m.no_location_available()}</p>
            </div>
          {/if}
        </div>
      </div>
    </Card.Root>

    <Card.Root>
      <div class="p-6">
        <div class="mb-4">
          <h3 class="text-xl font-medium">{m.available_event_types()}</h3>
          <p class="text-muted-foreground text-sm">{m.select_event_type_desc()}</p>
        </div>

        <div class="flex flex-col">
          {#if data.events.length > 0}
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {#each data.events as event}
                <PublicEventCard {event} username={data.user.username} />
              {/each}
            </div>
          {:else}
            <div class="text-muted-foreground py-8 text-center">
              <p>{m.no_available_events()}</p>
            </div>
          {/if}
        </div>
      </div>
    </Card.Root>
  </div>
</main>

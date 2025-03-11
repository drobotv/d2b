<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { m } from "$lib/i18n";
  import { getLocale } from "$lib/paraglide/runtime";
  import { locationSchema } from "$lib/schemas/location";
  import { adapter, superForm } from "$lib/utils/superform";
  import { RotateCcw } from "lucide-svelte";
  import { LngLat, type MapMouseEvent } from "maplibre-gl";
  import { DefaultMarker, MapEvents, MapLibre, Marker, type Feature, type MarkerClickInfo } from "svelte-maplibre";
  import { toast } from "svelte-sonner";
  import SuperDebug from "sveltekit-superforms";

  let { data } = $props();

  const form = superForm(data.form, {
    dataType: "json",
    validators: adapter(locationSchema),
    resetForm: false,
    taintedMessage: null,
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Location settings saved");
      }
      if (result.type === "error" || result.type === "failure") {
        toast.error("Failed to save location settings");
      }
    },
    onUpdated: ({ form }) => {
      if (form.valid) {
        reset({ newState: { ...form.data } });
      }
    }
  });

  const { form: formData, enhance, tainted, submitting, reset } = form;

  let markerPosition: LngLat | null = $state(null);
  let map: any = $state(null);

  $effect(() => {
    if (data.location) {
      markerPosition = new LngLat(data.location.lng, data.location.lat);
      $formData.lat = data.location.lat;
      $formData.lng = data.location.lng;
    }
  });

  async function fetchLocationData(lat?: number, lng?: number) {
    if (!lat || !lng) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${getLocale()}`
      );
      const data = await response.json();

      if (data && data.address && data.place_id) {
        $formData.address = data.display_name || "";
        $formData.city = data.address.city || data.address.town || data.address.village || "";
        $formData.state = data.address.state || "";
        $formData.country = data.address.country || "";
        $formData.postalCode = data.address.postcode || "";
        $formData.placeId = data.place_id || "";
        $formData.boundingBox = data.boundingbox || [];
        $formData.lat = parseFloat(data.lat);
        $formData.lng = parseFloat(data.lon);
      }
    } catch (error) {
      toast.error("Failed to fetch location data");
    }
  }

  function handleMapClick(e: MapMouseEvent) {
    markerPosition = e.lngLat;
    $formData.lat = e.lngLat.lat;
    $formData.lng = e.lngLat.lng;
    debounceFetchLocationData(e.lngLat.lat, e.lngLat.lng);
  }

  function handleMarkerDrag(e: MarkerClickInfo) {
    markerPosition = new LngLat(...e.lngLat);
    $formData.lng = e.lngLat[0];
    $formData.lat = e.lngLat[1];
    debounceFetchLocationData(e.lngLat[1], e.lngLat[0]);
  }

  let timeout: any = $state(null);
  function debounceFetchLocationData(lat: number, lng: number) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fetchLocationData(lat, lng), 500);
  }
</script>

<form method="POST" use:enhance>
  <header class="mb-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">{m.location()}</h2>
      <span>
        <Button variant="ghost" size="sm" type="button" onclick={reset} disabled={$submitting || !$tainted}>
          <RotateCcw />
        </Button>
        <Form.Button type="submit" disabled={$submitting || !$tainted}>{m.save_changes()}</Form.Button>
      </span>
    </div>
    <p class="text-muted-foreground">{m.location_desc()}</p>
  </header>

  <main class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
      <div>
        <Card.Root>
          <Card.Header>
            <Card.Title>Map Location</Card.Title>
            <Card.Description>Click on the map to set your location or drag the marker</Card.Description>
          </Card.Header>
          <Card.Content>
            <div class="relative h-[500px] w-full">
              <MapLibre
                style="https://tiles.openfreemap.org/styles/bright"
                standardControls
                zoom={data.location ? 12 : 4}
                center={new LngLat(data.location?.lng || 19, data.location?.lat || 52.5)}
                bind:map
              >
                <MapEvents onclick={handleMapClick} />
                {#if markerPosition}
                  <DefaultMarker lngLat={markerPosition} draggable ondrag={handleMarkerDrag} />
                {/if}
              </MapLibre>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
      <div class="space-y-4">
        <Form.Field {form} name="name">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m.name()}</Form.Label>
              <Input {...props} placeholder="Business or location name" bind:value={$formData.name} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="description">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m.description()}</Form.Label>
              <Textarea
                {...props}
                placeholder="Enter a description (optional, max 200 characters)"
                bind:value={$formData.description}
                maxlength={200}
                rows={3}
              />
              {#if $formData.description}
                <div class="text-muted-foreground mt-1 text-right text-xs">
                  {$formData.description.length}/200
                </div>
              {/if}
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="address">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>{m.address()}</Form.Label>
              <Input {...props} placeholder="Full address" bind:value={$formData.address} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <div class="grid grid-cols-2 gap-4">
          <Form.Field {form} name="city">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>{m.city()}</Form.Label>
                <Input {...props} placeholder="City" bind:value={$formData.city} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <Form.Field {form} name="state">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>{m.state()}</Form.Label>
                <Input {...props} placeholder="State or province" bind:value={$formData.state} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Form.Field {form} name="country">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>{m.country()}</Form.Label>
                <Input {...props} placeholder="Country" bind:value={$formData.country} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <Form.Field {form} name="postalCode">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>{m.postalCode()}</Form.Label>
                <Input {...props} placeholder="Postal code" bind:value={$formData.postalCode} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <Form.Field {form} name="lat">
          <Form.Control>
            {#snippet children({ props })}
              <Input {...props} type="hidden" />
            {/snippet}
          </Form.Control>
        </Form.Field>

        <Form.Field {form} name="lng">
          <Form.Control>
            {#snippet children({ props })}
              <Input {...props} type="hidden" />
            {/snippet}
          </Form.Control>
        </Form.Field>

        <Form.Field {form} name="boundingBox">
          <Form.Control>
            {#snippet children({ props })}
              <Input {...props} type="hidden" />
            {/snippet}
          </Form.Control>
        </Form.Field>

        <Form.Field {form} name="placeId">
          <Form.Control>
            {#snippet children({ props })}
              <Input {...props} type="hidden" />
            {/snippet}
          </Form.Control>
        </Form.Field>
      </div>
    </div>
  </main>
</form>

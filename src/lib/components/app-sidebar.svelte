<script lang="ts" module>
  import { Calendar, CalendarClock, Link, Settings, Users } from "lucide-svelte";
  import AudioWaveform from "lucide-svelte/icons/audio-waveform";
  import BookOpen from "lucide-svelte/icons/book-open";
  import Bot from "lucide-svelte/icons/bot";
  import ChartPie from "lucide-svelte/icons/chart-pie";
  import Command from "lucide-svelte/icons/command";
  import Frame from "lucide-svelte/icons/frame";
  import GalleryVerticalEnd from "lucide-svelte/icons/gallery-vertical-end";
  import Map from "lucide-svelte/icons/map";
  import Settings2 from "lucide-svelte/icons/settings-2";
  import SquareTerminal from "lucide-svelte/icons/square-terminal";

  const data = {
    main: [
      {
        name: m.events(),
        url: localizeHref("/events"),
        icon: Link
      },
      {
        name: m.bookings(),
        url: localizeHref("/bookings"),
        icon: Calendar
      },
      {
        name: m.availability(),
        url: localizeHref("/availability"),
        icon: CalendarClock
      },
      {
        name: m.location(),
        url: localizeHref("/location"),
        icon: Map
      }
      // {
      //   name: "Teams",
      //   url: "/teams",
      //   icon: Users
      // }
    ]
  };
</script>

<script lang="ts">
  import NavFooter from "$lib/components/nav-footer.svelte";
  import NavMain from "$lib/components/nav-main.svelte";
  import NavUser from "$lib/components/nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { m } from "$lib/i18n";
  import { localizeHref } from "$lib/paraglide/runtime";
  import type { ComponentProps } from "svelte";

  type Props = {
    user: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  } & ComponentProps<typeof Sidebar.Root>;

  let { ref = $bindable(null), collapsible = "none", user, ...restProps }: Props = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Header>
    <NavUser {user} />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.main} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavFooter />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>

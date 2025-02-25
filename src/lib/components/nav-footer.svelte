<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { localizeHref } from "$lib/paraglide/runtime";
  import { Settings } from "lucide-svelte";

  // let {
  //   items
  // }: {
  //   items: {
  //     title: string;
  //     url: string;
  //     icon?: any;
  //     isActive?: boolean;
  //   }[];
  // } = $props();
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <Sidebar.MenuButton>
      {#snippet child({ props })}
        <a href={localizeHref("/settings")} {...props}>
          <Settings />
          <span>Settings</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
</Sidebar.Menu>

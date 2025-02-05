<script lang="ts">
  import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  type Props = {
    items: {
      name: string;
      url: string;
      icon: any;
    }[];
  };

  let { items }: Props = $props();

  const sidebar = useSidebar();
</script>

<Sidebar.Group>
  <Sidebar.Menu>
    {#each items as item (item.name)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              <item.icon />
              <span>{item.name}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>

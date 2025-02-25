<script lang="ts">
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let { children, data } = $props();
</script>

<Sidebar.Provider class="flex h-screen overflow-hidden">
  <AppSidebar user={data.user!} />
  <Sidebar.Inset>
    <div class="flex flex-1 flex-col gap-4 overflow-auto p-4">
      {@render children?.()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>

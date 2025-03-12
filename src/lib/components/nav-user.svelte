<script lang="ts">
  import { goto } from "$app/navigation";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { m } from "$lib/i18n";
  import { locales, setLocale } from "$lib/paraglide/runtime";
  import { User } from "lucide-svelte";
  import BadgeCheck from "lucide-svelte/icons/badge-check";
  import Bell from "lucide-svelte/icons/bell";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import CreditCard from "lucide-svelte/icons/credit-card";
  import Globe from "lucide-svelte/icons/globe";
  import LogOut from "lucide-svelte/icons/log-out";
  import Sparkles from "lucide-svelte/icons/sparkles";

  type Props = {
    user: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };

  let { user }: Props = $props();
  const sidebar = useSidebar();
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            {...props}
          >
            <Avatar.Root class="h-8 w-8 rounded-lg">
              <Avatar.Image src="https://avatars.githubusercontent.com/u/109414395?v=4" alt={user?.username} />
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{user?.username}</span>
              <span class="truncate text-xs">drobotv@example.com</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <!-- <DropdownMenu.Group>
          <DropdownMenu.Item>
            <User />
            {m.account()}
          </DropdownMenu.Item>
        </DropdownMenu.Group> -->
        <DropdownMenu.Group>
          <DropdownMenu.Item class="flex items-center justify-between p-2">
            {#snippet child({ props })}
              <div class="flex items-center gap-2" {...props}>
                <Globe class="size-4" />
                <p class="text-sm font-medium">{m.language()}</p>
                <ToggleGroup.Root
                  type="single"
                  class="ml-auto"
                  onValueChange={(value) => setLocale(value as (typeof locales)[number])}
                >
                  {#each locales as locale}
                    <ToggleGroup.Item value={locale} class="rounded-md border-b px-2 py-1 font-semibold">
                      {locale}
                    </ToggleGroup.Item>
                  {/each}
                </ToggleGroup.Root>
              </div>
            {/snippet}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <!-- <DropdownMenu.Separator /> -->
        <DropdownMenu.Item onclick={() => goto("/logout")}>
          <LogOut />
          {m.logout()}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>

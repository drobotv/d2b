<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { i18n, m } from "$lib/i18n";
  import type { AvailableLanguageTag } from "$lib/paraglide/runtime";

  function switchToLanguage(newLanguage: AvailableLanguageTag) {
    const canonicalPath = i18n.route(page.url.pathname);
    const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
    goto(localisedPath);
  }
</script>

<h1>{m.hello_world({ name: "SvelteKit User" })}</h1>
<div>
  <button onclick={() => switchToLanguage("en")}>en</button>
  <button onclick={() => switchToLanguage("pl")}>pl</button>
</div>

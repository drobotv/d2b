<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input";
  import { m } from "$lib/i18n";
  import { localizeHref } from "$lib/paraglide/runtime";
  import { loginSchema } from "$lib/schemas/auth";
  import { adapter, superForm } from "$lib/utils/superform";

  const { data } = $props();

  const form = superForm(data.form, {
    validators: adapter(loginSchema)
  });

  const { form: formData, enhance, errors } = form;
</script>

<div class="flex flex-col space-y-2 text-center">
  <h1 class="text-2xl font-semibold tracking-tight">{m.login()}</h1>
  <!-- <p class="text-muted-foreground text-sm">{m.form_login_desc()}</p> -->
</div>
<form method="POST" use:enhance class="w-full space-y-2">
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.email()}</Form.Label>
        <Input type="text" {...props} bind:value={$formData.email} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>{m.password()}</Form.Label>
        <Input type="password" {...props} bind:value={$formData.password} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <!-- <Form.Errors errors={$errors._errors} /> -->
  <Form.Button class="w-full">{m.login()}</Form.Button>
</form>
<Button variant="link" class="flex justify-end" href={localizeHref("/register")}>
  {m.register()}
</Button>

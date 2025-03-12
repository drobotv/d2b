<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input";
  import { Separator } from "$lib/components/ui/separator";
  import { Textarea } from "$lib/components/ui/textarea";
  import { m } from "$lib/i18n";
  import { superForm } from "$lib/utils/superform";
  import { toast } from "svelte-sonner";

  let { data } = $props();

  const personalInfoForm = superForm(data.personalInfoForm, {
    resetForm: false,
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success(m.personal_info_updated());
      }
    }
  });
  const { form: personalInfoData, enhance: enhancePersonalInfo, errors: personalInfoErrors } = personalInfoForm;

  const passwordChangeForm = superForm(data.passwordChangeForm, {
    resetForm: true,
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success(m.password_changed());
      }
    }
  });
  const { form: passwordData, enhance: enhancePasswordChange, errors: passwordErrors } = passwordChangeForm;
</script>

<div class="container mx-auto px-4">
  <header class="mb-8">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">{m.settings()}</h2>
      <p class="text-muted-foreground">{m.settings_desc()}</p>
    </div>
  </header>

  <div class="grid grid-cols-1 gap-8 md:grid-cols-12">
    <div class="hidden space-y-4 md:col-span-3 lg:block">
      <div class="bg-card flex flex-col items-center rounded-lg border p-6 shadow-sm">
        <img
          src={"https://avatars.githubusercontent.com/u/109414395?v=4"}
          alt="User"
          class="mb-2 h-24 w-24 rounded-full"
        />
        <h2 class="text-xl font-semibold">{data.user?.firstName || ""} {data.user?.lastName || ""}</h2>
        <p class="text-muted-foreground text-sm">{data.user?.username || ""}</p>
        <p class="text-muted-foreground text-sm">drobotv@example.com</p>
      </div>
    </div>

    <div class="col-span-12 space-y-8 lg:col-span-9">
      <Card.Root>
        <Card.Header>
          <Card.Title>{m.profile_information()}</Card.Title>
          <Card.Description>{m.update_personal_info()}</Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updatePersonalInfo" use:enhancePersonalInfo class="space-y-6">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Form.Field form={personalInfoForm} name="firstName">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>{m.first_name()}</Form.Label>
                    <Input type="text" {...props} bind:value={$personalInfoData.firstName} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field form={personalInfoForm} name="lastName">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>{m.last_name()}</Form.Label>
                    <Input type="text" {...props} bind:value={$personalInfoData.lastName} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>

            <Form.Field form={personalInfoForm} name="bio">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>{m.bio()}</Form.Label>
                  <Textarea {...props} bind:value={$personalInfoData.bio} placeholder={m.bio_placeholder()} rows={5} />
                {/snippet}
              </Form.Control>
              <Form.Description>
                {m.bio_description()}
              </Form.Description>
              <Form.FieldErrors />
            </Form.Field>
            <div class="flex justify-end">
              <Form.Button>{m.save_changes()}</Form.Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Title>{m.security()}</Card.Title>
          <Card.Description>{m.update_password()}</Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/changePassword" use:enhancePasswordChange class="space-y-6">
            <Form.Field form={passwordChangeForm} name="currentPassword">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>{m.current_password()}</Form.Label>
                  <Input type="password" {...props} bind:value={$passwordData.currentPassword} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Field form={passwordChangeForm} name="newPassword">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>{m.new_password()}</Form.Label>
                  <Input type="password" {...props} bind:value={$passwordData.newPassword} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <div class="flex justify-end">
              <Form.Button>{m.change_password()}</Form.Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>

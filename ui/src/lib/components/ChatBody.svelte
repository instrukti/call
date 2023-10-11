<script>
  import { Button, Card, CardBody, Icon, Input } from "yesvelte";
  let messages = ["Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?", "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, ad?"];
</script>

<div class="flex-grow overflow-y-auto mb-4">
  <div class="flex flex-col-reverse">
    {#each messages as message, i}
      {#if i % 2 == 0}
        <div class="flex justify-start my-2">
          <Card bgColor="primary" class="w-2/3">
            <CardBody>{message}</CardBody>
          </Card>
        </div>
      {:else}
        <div class="flex justify-end my-2">
          <Card class="w-2/3">
            <CardBody>{message}</CardBody>
          </Card>
        </div>
      {/if}
    {/each}
  </div>
</div>
<form class="flex items-center justify-between space-x-2" on:submit|preventDefault={() => console.log("test")}>
  <div class="flex-grow">
    <Input borderRounded size="lg" placeholder="Message..." />
  </div>
  <div>
    <Button color="primary" size="md">
      <Icon name="send" />
    </Button>
  </div>
</form>

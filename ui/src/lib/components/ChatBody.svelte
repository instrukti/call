<script>
  import { Button, Card, CardBody, Icon, Input, Label } from "yesvelte";
  import { messages, newMessage } from "../utils/livekit_utils";
  let message;
  const handleSendMessage = () => {
    if (message) {
      newMessage.set({ time: Date.now(), message });
      message = "";
    }
  };
</script>

<div class="flex-grow flex flex-col-reverse overflow-y-auto mb-4">
  {#each $messages.reverse() as message}
    {#if message.sender !== "me"}
      <div class="flex justify-start my-2">
        <Card bgColor="primary" class="w-2/3">
          <CardBody>{message.message}</CardBody>
        </Card>
      </div>
      <Label class="!m-0 text-gray-600">{message.sender}</Label>
    {:else}
      <div class="flex justify-end my-2">
        <Card class="w-2/3">
          <CardBody>{message.message}</CardBody>
        </Card>
      </div>
      <Label class="text-right !m-0 text-gray-600">{message.sender}</Label>
    {/if}
  {/each}
</div>
<form class="flex items-center justify-between space-x-2" on:submit|preventDefault>
  <div class="flex-grow">
    <Input borderRounded size="lg" placeholder="Message..." bind:value={message} />
  </div>
  <div>
    <Button color="primary" size="md" on:click={handleSendMessage}>
      <Icon name="send" />
    </Button>
  </div>
</form>

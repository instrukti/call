<script>
  import { createEventDispatcher } from "svelte";
  import { Card, CardBody, CardHeader, CardTitle, Button, Icon, Tooltip, Input, El } from "yesvelte";
  import ChatBody from "./ChatBody.svelte";
  const dispatch = createEventDispatcher();
  const hideChat = () => {
    dispatch("hideChat");
  };
</script>

<Card class="m-4 h-full flex-grow !rounded-2xl">
  <CardHeader>
    <CardTitle class="w-full">
      <div class="flex justify-between items-center">
        <El textColor="primary" fontWeight="bolder" fontSize="1">Chat</El>
        <div>
          <Button on:click={hideChat}>
            <Icon name="x" />
          </Button>
          <Tooltip text="Close" />
        </div>
      </div>
    </CardTitle>
  </CardHeader>
  <CardBody class="h-5/6 bg-gray-200 flex flex-col rounded-b-2xl">
    <ChatBody />
  </CardBody>
</Card>

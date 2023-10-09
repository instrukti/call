<script>
  import { createEventDispatcher } from "svelte";
  import { Avatar, Button, Card, CardBody, CardHeader, CardTitle, Dot, El, Icon, Offcanvas, OffcanvasBody, OffcanvasHeader, Status, Tooltip } from "yesvelte";
  import TimerModal from "./TimerModal.svelte";
  import ReactionDropdown from "./ReactionDropdown.svelte";
  import { isChatHidden, isCallMaximized, isWhiteboardHidden, isWhiteboardMaximized } from "../stores/visibility";
  import { slide } from "svelte/transition";
  import ChatBody from "./ChatBody.svelte";
  let showChatCanvas = false;
  let isMicOn = true;
  let isVideoOn = true;
  let isHandRaised = false;
  let recording = false;
  let hiddenControls = false;
  const toggle = (/** @type {"mic"|"video"|"hand"}*/ button) => {
    switch (button) {
      case "mic":
        isMicOn = !isMicOn;
        break;
      case "video":
        isVideoOn = !isVideoOn;
        break;
      case "hand":
        isHandRaised = !isHandRaised;
        break;
      default:
        break;
    }
  };
  const dispatch = createEventDispatcher();
  const maximize = () => dispatch("maximize");
  const minimize = () => dispatch("minimize");
</script>

<Card class="m-4 h-full flex-grow !rounded-2xl">
  <CardHeader>
    <CardTitle class="w-full">
      <div class="flex justify-between items-center">
        <El textColor="primary" fontWeight="bolder" fontSize="1">Call</El>
        <div class="block space-x-2 xl:hidden">
          <Button on:click={() => (showChatCanvas = !showChatCanvas)}>
            <Icon name="message-circle-2" />
          </Button>
          <Tooltip text="Show Chat" />
          <Button>
            <Icon name="paperclip" />
          </Button>
          <Tooltip text="Show Files" />
        </div>
        <div class="hidden space-x-2 xl:block">
          {#if $isChatHidden}
            <Button
              on:click={() => {
                $isChatHidden = false;
                $isCallMaximized = false;
                $isWhiteboardMaximized = false;
              }}
            >
              <Icon name="message-circle-2" />
            </Button>
            <Tooltip text="Show Chat" />
          {/if}
          {#if $isWhiteboardHidden}
            <Button
              on:click={() => {
                $isWhiteboardHidden = false;
                $isCallMaximized = false;
                $isWhiteboardMaximized = false;
                if ($isChatHidden) $isWhiteboardMaximized = true;
              }}
            >
              <Icon name="presentation" />
            </Button>
            <Tooltip text="Show Whiteboard" />
          {/if}
          {#if !$isCallMaximized}
            <Button on:click={maximize} class="hidden xl:block">
              <Icon name="maximize" />
            </Button>
            <Tooltip text="Maximize" />
          {:else}
            <Button on:click={minimize} class="hidden xl:block">
              <Icon name="arrows-minimize" />
            </Button>
            <Tooltip text="Minimize" />
          {/if}
        </div>
      </div>
    </CardTitle>
  </CardHeader>
  <CardBody class="h-5/6 bg-gray-200 !p-0 relative rounded-b-2xl">
    <div class="h-full w-full fill absolute rounded-b-2xl">
      <img src="https://media.istockphoto.com/id/1136449639/video/the-man-laughing-on-the-white-background-slow-motion.jpg?s=640x640&k=20&c=jCivJBgTODPt57y3ESNnasT4Dc8z2Semme4VmNK2EeM=" class="object-cover" alt="" />
    </div>
    <div class="absolute z-10 h-full w-full flex flex-col p-4">
      <div class="flex-grow flex">
        <div class="flex flex-col flex-grow">
          <div>
            <Status color="danger"><Dot color="danger" animated={recording} />00:20</Status>
            {#if recording}
              <Tooltip>Recording...</Tooltip>
            {/if}
          </div>
          <div class="flex-grow mt-3 flex flex-col space-y-4 justify-end">
            {#if !hiddenControls}
              <div transition:slide={{ axis: "y", delay: 100 }}>
                <Button color={isMicOn ? "primary" : "red"} on:click={() => toggle("mic")} class="!rounded-full md:!w-14 md:!h-14">
                  <Icon name={isMicOn ? "microphone" : "microphone-off"} />
                </Button>
                <Tooltip text="{isMicOn ? 'Off' : 'On'} Mic" />
              </div>
              <div transition:slide={{ axis: "y", delay: 80 }}>
                <Button color={isVideoOn ? "primary" : "red"} on:click={() => toggle("video")} class="!rounded-full md:!w-14 md:!h-14">
                  <Icon name={isVideoOn ? "video" : "video-off"} />
                </Button>
                <Tooltip text="{isVideoOn ? 'Off' : 'On'} Camera" />
              </div>
              <div transition:slide={{ axis: "y", delay: 60 }}>
                <Button color={isHandRaised ? "red" : "primary"} on:click={() => toggle("hand")} class="!rounded-full md:!w-14 md:!h-14">
                  <Icon name={isHandRaised ? "hand-off" : "hand-stop"} />
                </Button>
                <Tooltip text="{isHandRaised ? 'Lower' : 'Raise'} Hand" />
              </div>
              <div transition:slide={{ axis: "y", delay: 40 }}>
                <TimerModal />
              </div>
              <div transition:slide={{ axis: "y", delay: 20 }}>
                <ReactionDropdown />
              </div>
              <div transition:slide={{ axis: "y" }}>
                <Button color="red" class="!rounded-full md:!w-14 md:!h-14">
                  <Icon name="phone-off" />
                </Button>
                <Tooltip text="End Call" />
              </div>
            {/if}
            <div>
              <Button color="purple" on:click={() => (hiddenControls = !hiddenControls)} class="!rounded-full md:!w-14 md:!h-14">
                <Icon name={hiddenControls ? "menu-2" : "x"} />
              </Button>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-between">
          <div><Avatar shape="circle" color="azure" class="!w-20 !h-20 md:!w-32 md:!h-32 !text-3xl">JD</Avatar></div>
          <div><Avatar shape="circle" color="warning" class="!w-20 !h-20 md:!w-32 md:!h-32 !text-3xl">SM</Avatar></div>
          <div><Avatar shape="circle" color="green" class="!w-20 !h-20 md:!w-32 md:!h-32 !text-3xl">A</Avatar></div>
          <div><Avatar shape="circle" color="cyan" class="!w-20 !h-20 md:!w-32 md:!h-32 !text-3xl">SO</Avatar></div>
        </div>
      </div>
    </div>
  </CardBody>
</Card>
<Offcanvas bind:show={showChatCanvas} autoClose backdrop>
  <OffcanvasHeader title="Offcanvas Title" />
  <OffcanvasBody class="h-100v flex flex-col p-4">
    <ChatBody />
  </OffcanvasBody>
</Offcanvas>

<style>
  .fill {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .fill img {
    flex-shrink: 0;
    min-width: 100%;
    min-height: 100%;
  }
</style>

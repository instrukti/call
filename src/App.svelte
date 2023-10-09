<script>
  import "./app.postcss";
  import tabler from "yesvelte/css/tabler.min.css?url";
  import ChatContainer from "./lib/components/ChatContainer.svelte";
  import CallContainer from "./lib/components/CallContainer.svelte";
  import WhiteboardContainer from "./lib/components/WhiteboardContainer.svelte";
  import { slide } from "svelte/transition";
  import { isCallMaximized, isChatHidden, isWhiteboardHidden, isWhiteboardMaximized, maximizeCall, maximizeWhiteboard, minimizeCall, minimizeWhiteboard } from "./lib/stores/visibility";
  import Screenshot from "./lib/components/Screenshot.svelte";
  import { showScreenCaptureModal } from "./lib/utils/fabric_utils";
</script>

<svelte:head>
  <link rel="stylesheet" href={tabler} />
  <title>Instrukti Call</title>
</svelte:head>

{#if $showScreenCaptureModal}
  <div class="w-100v h-100v z-[9999] overflow-hidden">
    <Screenshot />
  </div>
{/if}
<div class="w-100v h-100v bg-white p-2 overflow-hidden">
  <div class="flex flex-col h-full w-full border-2 border-black rounded-xl">
    <div class="h-full w-full flex gap-4">
      {#if !$isChatHidden}
        <div class="h-full hidden w-1/3 xl:flex" transition:slide={{ axis: "x" }}>
          <ChatContainer
            on:hideChat={() => {
              $isChatHidden = true;
              if ($isWhiteboardHidden) $isCallMaximized = true;
            }}
          />
        </div>
      {/if}
      <div class="h-full flex flex-col w-full {$isCallMaximized ? 'xl:w-full' : $isWhiteboardHidden && !$isChatHidden ? 'xl:w-2/3' : 'xl:w-1/3'} max-w-full" transition:slide={{ axis: "x" }}>
        <CallContainer on:maximize={maximizeCall} on:minimize={minimizeCall} />
      </div>
      {#if !$isWhiteboardHidden}
        <div class="h-full hidden {$isWhiteboardMaximized || $isChatHidden ? (!$isChatHidden ? 'w-full' : 'w-2/3') : 'w-1/3'} xl:flex" transition:slide={{ axis: "x" }}>
          <WhiteboardContainer on:maximize={maximizeWhiteboard} on:minimize={minimizeWhiteboard} />
        </div>
      {/if}
    </div>
  </div>
</div>

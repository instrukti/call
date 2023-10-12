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
  import LoadingOverlay from "./lib/components/LoadingOverlay.svelte";
  import { onMount } from "svelte";
  import { Button, Divider, Input, Textarea } from "yesvelte";
  import { getJoinToken, token } from "./lib/utils/livekit_utils";
  let loading = true;
  onMount(() => {
    window.onload = () => {
      loading = false;
    };
  });
  let roomName = "";
  let userName = "";
  let pastedToken = "";
  const joinCall = async () => {
    if (userName != "" || roomName != "") {
      const joinToken = await getJoinToken(userName, roomName);
      token.set(joinToken);
    }
    if (pastedToken != "") {
      token.set(pastedToken);
    }
  };
</script>

<svelte:head>
  <link rel="stylesheet" href={tabler} />
  <title>Instrukti Call</title>
</svelte:head>
{#if loading}
  <LoadingOverlay />
{/if}
{#if $showScreenCaptureModal}
  <div class="w-[100dvw] h-[100dvh] z-[100] overflow-hidden">
    <Screenshot />
  </div>
{/if}
{#if !$token}
  <div class="grid place-items-center w-[100dvw] h-[100dvh] bg-red-300">
    <div class="space-y-2 w-11/12 md:w-1/3">
      <Input bind:value={userName} placeholder="Enter Username" />
      <Input bind:value={roomName} placeholder="Enter A Room Name" />
      <Divider class="my-8">Or</Divider>
      <Textarea placeholder="Paste your token" bind:value={pastedToken} disabled={userName != "" || roomName != ""} />
      <Button class="w-full" color="primary" on:click={joinCall}>Join</Button>
    </div>
  </div>
{:else}
  <div class="w-[100dvw] h-[100dvh] bg-white p-2 overflow-hidden">
    <div class="h-full w-full border-2 border-black rounded-xl">
      <div class="h-full w-full flex gap-4">
        {#if !$isChatHidden}
          <div class="h-full hidden w-1/3 xl:flex" transition:slide={{ axis: "x" }}>
            <ChatContainer
              on:hideChat={() => {
                $isChatHidden = true;
                $isWhiteboardHidden ? ($isCallMaximized = true) : ($isWhiteboardMaximized = true);
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
{/if}

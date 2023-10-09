<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { Button, Card, CardBody, CardHeader, CardTitle, El, Icon, Modal, ModalBody, ModalFooter, Popover, PopoverBody, PopoverHeader, Tooltip } from "yesvelte";
  import { isCallMaximized, isChatHidden, isWhiteboardMaximized } from "../stores/visibility";
  import { fabric } from "fabric";
  import { FabricUtils, activeButton, fabricUtilsStore } from "../utils/fabric_utils";
  let board;
  /** @type {HTMLCanvasElement}*/
  let canvas;
  let container;
  let clientHeight;
  let clientWidth;
  /** @type {ResizeObserver}*/
  let resizeObserver;
  /** @type {FabricUtils | undefined}*/
  let fabricUtils;
  const dispatch = createEventDispatcher();
  const maximize = () => dispatch("maximize");
  const minimize = () => dispatch("minimize");
  onMount(() => {
    setTimeout(() => {
      if (canvas) {
        board = new fabric.Canvas(canvas);
        fabricUtils = new FabricUtils(board);
        fabricUtilsStore.set(fabricUtils);
      }
    }, 500);
    resizeObserver = new ResizeObserver((entries) => {
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        if (board) {
          const scaleMultiplier = container.clientWidth / board.width;
          const objects = board.getObjects();
          objects.forEach((object) => {
            object.scaleX = object.scaleX * scaleMultiplier;
            object.scaleY = object.scaleY * scaleMultiplier;
            object.left = object.left * scaleMultiplier;
            object.top = object.top * scaleMultiplier;
            object.setCoords();
          });
          board.setWidth(container.clientWidth);
          board.setHeight(container.clientHeight);
          board.renderAll();
          board.calcOffset();
        }
      }
    });
    resizeObserver.observe(container);
  });
</script>

<Card class="m-4 h-full flex-grow !rounded-2xl">
  <CardHeader>
    <CardTitle class="w-full">
      <div class="flex justify-between items-center">
        <El textColor="primary" fontWeight="bolder" fontSize="1">Whiteboard</El>
        <div>
          <div class="hidden space-x-2 xl:block">
            <Button>
              <Icon name="adjustments-horizontal" />
            </Button>
            <Popover trigger="hover">
              <PopoverHeader>Select Tool</PopoverHeader>
              <PopoverBody>
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <Button color={$activeButton === "select" ? "dark" : ""} on:click={fabricUtils.resetEvents}>
                      <Icon name="pointer-filled" />
                    </Button>
                    <Tooltip placement="top">Select</Tooltip>
                  </div>
                  <div>
                    <Button color={$activeButton === "move" ? "dark" : ""} on:click={fabricUtils.enterDragMode}>
                      <Icon name="arrows-move" />
                    </Button>
                    <Tooltip placement="top">Move</Tooltip>
                  </div>
                  <div>
                    <Button on:click={fabricUtils.resetZoom}>
                      <Icon name="zoom-reset" />
                    </Button>
                    <Tooltip placement="top">Reset Zoom</Tooltip>
                  </div>
                  <div>
                    <Button color={$activeButton === "eraser" ? "dark" : ""} on:click={fabricUtils.activateEraser}>
                      <Icon name="eraser" />
                    </Button>
                    <Tooltip placement="top">Eraser</Tooltip>
                  </div>
                  <div>
                    <Button on:click={fabricUtils.startTakingScreenshot}>
                      <Icon name="screenshot" />
                    </Button>
                    <Tooltip placement="top">Screenshot</Tooltip>
                  </div>
                  <div>
                    <Button color={$activeButton === "line" ? "dark" : ""} on:click={fabricUtils.drawline}>
                      <Icon name="slash" />
                    </Button>
                    <Tooltip placement="top">Line</Tooltip>
                  </div>
                  <div>
                    <Button color={$activeButton === "freeform" ? "dark" : ""} on:click={fabricUtils.drawFreeform}>
                      <Icon name="scribble" />
                    </Button>
                    <Tooltip placement="top">Scribble</Tooltip>
                  </div>
                  <div>
                    <Button color={$activeButton === "circle" ? "dark" : ""} on:click={fabricUtils.drawCircle}>
                      <Icon name="circle" />
                    </Button>
                    <Tooltip placement="top">Circle</Tooltip>
                  </div>
                  <div>
                    <Button color={$activeButton === "rect" ? "dark" : ""} on:click={fabricUtils.drawRect}>
                      <Icon name="rectangle" />
                    </Button>
                    <Tooltip placement="top">Rectangle</Tooltip>
                  </div>
                  <div>
                    <Button on:click={() => fabricUtils.addText()}>
                      <Icon name="typography" />
                    </Button>
                    <Tooltip placement="top">Text</Tooltip>
                  </div>
                  <div>
                    <Button color="warning" on:click={fabricUtils.clearBoard}>
                      <Icon name="trash-filled" />
                    </Button>
                    <Tooltip placement="top">Clear</Tooltip>
                  </div>
                </div>
              </PopoverBody>
            </Popover>
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
            {#if !$isWhiteboardMaximized}
              <Button on:click={maximize}>
                <Icon name="maximize" />
              </Button>
              <Tooltip text="Maximize" />
            {:else}
              <Button on:click={minimize}>
                <Icon name="arrows-minimize" />
              </Button>
              <Tooltip text="Minimize" />
            {/if}
          </div>
        </div>
      </div>
    </CardTitle>
  </CardHeader>
  <CardBody class="h-5/6 bg-slate-100 rounded-b-2xl !p-0">
    <div class="w-full h-full canvasParent" bind:clientHeight bind:clientWidth bind:this={container}>
      <canvas id="board" bind:this={canvas} />
    </div>
  </CardBody>
</Card>

<!-- <Modal title="Large Modal" size="lg" bind:show={$showScreenCaptureModal}>
  <ModalBody>
    <canvas id="capturedStill" style="overflow:auto" />
  </ModalBody>
  <ModalFooter>
    <Button color="primary" on:click={() => ($showScreenCaptureModal = false)}>OK</Button>
  </ModalFooter>
</Modal> -->

<style>
  .canvasParent {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACfCAMAAABX0UX9AAAALVBMVEX////i4uLj4+Px8fHHx8f39/fs7Oz09PTW1tbT09Pa2tr19fXn5+fq6urd3d3se65oAAACp0lEQVR4nO3czYqDMBRA4cSMxvrT93/cYZTOOt4DTRbHVRYNfhxKvAhtOsp11bU2L2oObTqfbyrH4LxU0n3l1L4oe2DTMkfuNDgvlq9+zTc4z3yIZz7EMx/imQ/x0udWU2pflLn9s/+LJbKpDs5La76u6WdqX7y255umyKa8Ds7z24d4nn2IZz7EMx/imQ/xzId45kM8BxfEc2x2bO7H8+xDPPMhnvkQz3yIZz7EMx/iObggnmOzY3M/nmcf4pkP8cyHeOZDPPMhnvkQz8EF8RybHZv78Tz7EM98iGc+xDMf4pkP8cyHeA4uiOfY7Njcj+fZh3jmQzzzIZ75EM98iJcit/rez7Xr4LyU71/ll1dpX3z+LODRpndkUx6cl469/l3zNtfWxX6cgU15idxpcJ5/BYF4PjoQz3yIZz7EMx/imQ/xfGGFeL4u9XVpP55nH+KZD/HMh3jmQzzzIZ75EM/BBfEcmx2b+/E8+xDPfIhnPsQzH+KZD/HMh3gOLojn2OzY3I/n2Yd45kM88yGe+RDPfIhnPsRzcEE8x2bH5n48zz7EMx/imQ/xzId45kM88yGegwviOTY7NvfjefYhnvkQz3yIZz7EMx/ixZ68e/tnezx5v8dLebmv19K+eEc2bVNgUx6cl875vra5fXEsgU1TCWw6B+f5VxCI56MD8cyHeOZDPPMhnvkQzxdWiOfrUl+X9uN59iGe+RDPfIhnPsQzH+KZD/EcXBDPsdmxuR/Psw/xzId45kM88yGe+RDPfIjn4IJ4js2Ozf14nn2IZz7EMx/imQ/xzId45kM8BxfEc2x2bO7H8+xDPPMhnvkQz3yIZz7EMx/iObggnmOzY3M/nmcf4pkP8cyHeOZDPPMhnr8mR7x0lOuqa21e1BzadD7fVI7Beb9jtnsfGvaQcgAAAABJRU5ErkJggg==");
  }
</style>

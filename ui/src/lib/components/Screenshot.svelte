<script>
  import { onMount } from "svelte";
  import { FabricUtils, fabricUtilsStore, showScreenCaptureModal } from "../utils/fabric_utils";
  import { Alert, El, Toast, ToastBody, ToastContainer, ToastHeader } from "yesvelte";

  let container;
  let overlay;
  let drawingOnOverlay = false;
  let startX;
  let startY;
  onMount(() => {
    container.addEventListener("mousedown", (e) => {
      drawingOnOverlay = true;
      startX = e.clientX;
      startY = e.clientY;
    });
    container.addEventListener("mousemove", (e) => {
      if (!drawingOnOverlay) return;
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      const left = width >= 0 ? startX : e.clientX;
      const top = height >= 0 ? startY : e.clientY;
      overlay.style.top = `${top}px`;
      overlay.style.left = `${left}px`;
      overlay.style.width = `${width}px`;
      overlay.style.height = `${height}px`;
    });
    container.addEventListener("mouseup", async (e) => {
      drawingOnOverlay = false;
      const rectWidth = Math.abs(e.clientX - startX);
      const rectHeight = Math.abs(e.clientY - startY);
      const rectLeft = startX < e.clientX ? startX : e.clientX;
      const rectTop = startY < e.clientY ? startY : e.clientY;
      /**
       * @type {HTMLCanvasElement}
       */

      // @ts-ignore
      const capturedStill = document.getElementById("capturedStill");
      let imageData = capturedStill.getContext("2d").getImageData(startX, startY, e.clientX, e.clientY);
      /**
       * @type {HTMLCanvasElement}
       */
      // @ts-ignore
      const cropped = document.getElementById("cropped");
      cropped.width = rectWidth;
      cropped.height = rectHeight;
      cropped.getContext("2d").putImageData(imageData, 0, 0);
      const finalImage = cropped.toDataURL("image/png");
      $showScreenCaptureModal = false;
      /** @type {FabricUtils}*/
      const fabricUtils = $fabricUtilsStore;
      fabricUtils.finishTakingScreenshot(finalImage);
    });
  });
  const exitScreenshot = async (event) => {
    if (event.code === "Escape") {
      document.body.style.cursor = "auto";
      showScreenCaptureModal.set(false);
      container.style.backgroundImage = "none";
    }
  };
  showScreenCaptureModal.subscribe((val) => {
    if (val) {
      window.addEventListener("keydown", exitScreenshot);
      return;
    }
    window.removeEventListener("keydown", exitScreenshot);
  });
</script>

<div class="{$showScreenCaptureModal ? 'fixed' : 'hidden'} w-[100dvw] h-[100dvh] top-0 left-0 cursor-crosshair bg-contain bg-no-repeat bg-center" id="screenshotContainer" bind:this={container}>
  <div class="fixed top-4 left-1/2 w-48 -ml-24 text-white bg-slate-700 rounded-lg flex items-center justify-start p-4 space-y-4 z-[100]">Press 'ESC' to exit.</div>
  <canvas id="capturedStill" />
  <canvas id="cropped" />
  <div class="fixed !z-[50] cursor-crosshair {$showScreenCaptureModal ? 'border-red-600' : ''}" id="overlay" bind:this={overlay} />
</div>

<style>
  #overlay {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  }
</style>

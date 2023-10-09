<script>
  import { onMount } from "svelte";
  import { FabricUtils, fabricUtilsStore, showScreenCaptureModal } from "../utils/fabric_utils";

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
      // // invoke screen capture area
      // await invoke("capture_area", { x: rectLeft, y: rectTop, width: rectWidth, height: rectHeight });
      // const imageData = await readBinaryFile("InstruktiFiles/screenshot.png", { dir: BaseDirectory.Document });
      // const base64String = _arrayBufferToBase64(imageData);
      // await finishTakingScreenshot(base64String, canvas);
      // overlay.style.top = "0px";
      // overlay.style.left = "0px";
      // overlay.style.width = "0px";
      // overlay.style.height = "0px";
      // takingScreenshot.set(false);
    });
  });
  const exitScreenshot = async (event) => {
    if (event.code === "Escape") {
      document.body.style.cursor = "auto";
      // takingScreenshot.set(false);
      container.style.backgroundImage = "none";
    }
  };

  // takingScreenshot.subscribe((val) => {
  //   if (val) {
  //     window.addEventListener("keydown", exitScreenshot);
  //     return;
  //   }
  //   window.removeEventListener("keydown", exitScreenshot);
  // });
</script>

<div class="{$showScreenCaptureModal ? 'fixed' : 'hidden'} w-100v h-100v top-0 left-0 cursor-crosshair bg-contain bg-no-repeat bg-center" id="screenshotContainer" bind:this={container}>
  <canvas id="capturedStill" />
  <canvas id="cropped" />
  <div class="fixed !z-[9999] cursor-crosshair {$showScreenCaptureModal ? 'border-red-600' : ''}" id="overlay" bind:this={overlay} />
</div>

<style>
  #overlay {
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  }
</style>

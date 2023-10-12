import { get, writable } from "svelte/store";
import { fabric } from "fabric";
import { debounce } from "./common";

export const strokeWidth = writable(2);
export const strokeColor = writable("#000000");
export const activeButton = writable("select");
export const showScreenCaptureModal = writable(false);
export const fabricUtilsStore = writable(null);
export const boardDataJSON = writable(null);
export class FabricUtils {
  isDrawing = writable(false);
  /** @type {import("svelte/store").Unsubscriber | null} */
  subscribeToStrokeWidth = null;
  /** @type {import("svelte/store").Unsubscriber | null} */
  subscribeToStrokeColor = null;
  constructor(/** @type {fabric.Canvas} */ board) {
    this.canvas = board;
    this.isDrawing.subscribe((val) => {
      this.setFixed(val);
    });
    document.onkeydown = (e) => {
      if (e.key === "Delete") {
        this.canvas.getActiveObjects().forEach((obj) => {
          this.canvas.remove(obj);
          this.saveBoard();
        });
      }
    };
    document.addEventListener("paste", (e) => {
      const clipboardData = e.clipboardData;
      if (clipboardData) {
        const items = clipboardData.items;
        let type = null;
        if (items.length > 0) {
          type = items[0].kind;
        }
        this.pasteItem(type);
      }
    });
    if (get(boardDataJSON)) {
      this.canvas.loadFromJSON(get(boardDataJSON), async () => {});
    }
    this.setZoom();
    this.defineModifiedListener();
  }
  clearBoard = () => {
    this.canvas.clear();
    this.resetEvents();
  };
  resetZoom = () => {
    this.resetEvents();
    this.canvas.setZoom(1);
  };
  defineModifiedListener = () => {
    this.canvas.on("object:modified", () => {
      this.saveBoard();
    });
  };
  resetEvents = () => {
    activeButton.set("select");
    this.canvas.defaultCursor = "default";
    this.canvas.off();
    this.canvas.isDrawingMode = false;
    document.querySelectorAll(".fabric-toolbar-button.btn-neutral").forEach((el) => {
      el.classList.remove("btn-neutral");
      el.classList.add("btn-ghost");
    });
    if (this.subscribeToStrokeWidth) {
      this.subscribeToStrokeWidth();
    }
    if (this.subscribeToStrokeColor) {
      this.subscribeToStrokeColor();
    }
    this.setZoom();
    this.defineModifiedListener();
  };
  setZoom = () => {
    this.canvas.on("mouse:wheel", (opt) => {
      var delta = opt.e.deltaY;
      var zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 1) zoom = 1;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  };
  activateEraser = () => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("eraser");
      // @ts-ignore
      this.canvas.freeDrawingBrush = new fabric.EraserBrush(this.canvas);
      this.canvas.isDrawingMode = true;
      this.subscribeToStrokeWidth = strokeWidth.subscribe((val) => {
        this.canvas.freeDrawingBrush.width = val * 3;
      });
    }, 100);
    this.canvas.on("mouse:up", () => {
      this.saveBoard();
    });
  };
  drawline = (/** @type {any} */ e) => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("line");
      this.canvas.defaultCursor = "crosshair";
      /** @type {fabric.Line} */
      let line;
      this.canvas.on("mouse:down", (options) => {
        this.isDrawing.set(true);
        let pointer = this.canvas.getPointer(options.e);
        let points = [pointer.x, pointer.y, pointer.x, pointer.y];
        line = new fabric.Line(points, {
          strokeWidth: get(strokeWidth),
          stroke: get(strokeColor),
        });
        this.canvas.add(line);
        this.canvas.renderAll();
      });

      this.canvas.on("mouse:move", (options) => {
        if (!get(this.isDrawing)) return;
        let pointer = this.canvas.getPointer(options.e);
        line.set({ x2: pointer.x, y2: pointer.y });
        this.canvas.renderAll();
      });

      this.canvas.on("mouse:up", () => {
        this.isDrawing.set(false);
        this.saveBoard();
      });
    }, 100);
  };
  drawRect = (/** @type {any} */ e) => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("rect");
      this.canvas.defaultCursor = "crosshair";
      /** @type {fabric.Rect | null} */
      let rectangle;

      this.canvas.on("mouse:down", (o) => {
        this.isDrawing.set(true);
        let pointer = this.canvas.getPointer(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        rectangle = new fabric.Rect({
          left: startPoint.x,
          top: startPoint.y,
          width: endPoint.x - startPoint.x,
          height: endPoint.y - startPoint.y,
          strokeWidth: get(strokeWidth),
          stroke: get(strokeColor),
          fill: "transparent",
        });
        this.canvas.add(rectangle);
        this.canvas.renderAll();
      });

      this.canvas.on("mouse:move", (o) => {
        if (!get(this.isDrawing)) return;
        let pointer = this.canvas.getPointer(o.e);
        if (rectangle && rectangle.left && rectangle.top) {
          rectangle.set({
            width: pointer.x - rectangle.left,
            height: pointer.y - rectangle.top,
          });
          this.canvas.renderAll();
        }
      });

      this.canvas.on("mouse:up", () => {
        this.isDrawing.set(false);
        this.saveBoard();
      });
    }, 100);
  };
  drawCircle = (/** @type {any} */ e) => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("circle");
      this.canvas.defaultCursor = "crosshair";
      /** @type {fabric.Circle} */
      let circle;
      this.canvas.on("mouse:down", (o) => {
        this.isDrawing.set(true);
        let pointer = this.canvas.getPointer(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        let radius = Math.abs((endPoint.x - startPoint.x) / 2);
        circle = new fabric.Circle({
          left: startPoint.x - radius,
          top: startPoint.y - radius,
          radius: radius,
          strokeWidth: get(strokeWidth),
          stroke: get(strokeColor),
          fill: "transparent",
        });
        this.canvas.add(circle);
        this.canvas.renderAll();
      });

      this.canvas.on("mouse:move", (o) => {
        if (!get(this.isDrawing)) return;
        let pointer = this.canvas.getPointer(o.e);
        if (circle && circle.left) {
          let radius = Math.abs((pointer.x - circle.left) / 2);
          circle.set({
            radius: radius,
          });
          this.canvas.renderAll();
        }
      });

      this.canvas.on("mouse:up", () => {
        this.isDrawing.set(false);
        this.saveBoard();
      });
    }, 100);
  };
  drawFreeform = (/** @type {any} */ e) => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("freeform");
      //@ts-ignore
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
      this.canvas.isDrawingMode = true;
      this.subscribeToStrokeWidth = strokeWidth.subscribe((val) => {
        this.canvas.freeDrawingBrush.width = val;
      });
      this.subscribeToStrokeColor = strokeColor.subscribe((val) => {
        this.canvas.freeDrawingBrush.color = val;
      });
      this.canvas.on("mouse:down", () => {
        this.isDrawing.set(true);
      });
      this.canvas.on("mouse:up", () => {
        this.isDrawing.set(false);
        this.saveBoard();
      });
    }, 100);
  };
  addText = (/** @type {string} */ textContent = "Edit me") => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("select");
      const text = new fabric.IText(textContent, {
        left: 50,
        top: 50,
        fontSize: get(strokeWidth) * 10,
        fill: get(strokeColor),
      });
      this.canvas.add(text);
      this.saveBoard();
    }, 100);
  };
  pasteItem = (/** @type {string | null} */ type = null) => {
    this.resetEvents();
    setTimeout(async () => {
      if (type && type === "string") {
        // Figure out how to get text from clipboard without tauri
        // const textContent = await this.setFixed();
        // this.addText(textContent);
      } else {
        // Figure out how to get image from clipboard without tauri
        // let base64String = await readImage();
        // base64String = "data:image/png;base64," + base64String;
        // fabric.Image.fromURL(base64String, (image) => {
        //   image.set({
        //     left: 100,
        //     top: 100,
        //   });
        //   this.canvas.add(image);
        //   this.canvas.renderAll();
        // });
      }
    }, 100);
  };
  startTakingScreenshot = async () => {
    this.resetEvents();
    setTimeout(async () => {
      //@ts-ignore
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window", width: { ideal: 1920, max: 1920 }, height: { ideal: 1080, max: 1080 } },
      });
      const videoTrack = stream.getVideoTracks()[0];
      // @ts-ignore
      const imageCapture = new ImageCapture(videoTrack);

      imageCapture.grabFrame().then(function (imageBitmap) {
        // `imageBitmap` contains the screenshot of the entire screen
        // You can display it or save it as needed
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
        const canvas = document.getElementById("capturedStill");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.getContext("2d").drawImage(imageBitmap, 0, 0, window.innerWidth, window.innerHeight);
      });
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
      }, 1000);

      showScreenCaptureModal.set(true);
    }, 100);
  };
  saveBoard = debounce(() => {
    boardDataJSON.set(this.canvas.toJSON());
    // To be implemented when pocketbase backend is started
  });
  setFixed = (/** @type {Boolean} */ isFixed) => {
    this.canvas.getObjects().forEach((obj) => {
      obj.lockMovementX = isFixed;
      obj.lockMovementY = isFixed;
    });
  };
  enterDragMode = () => {
    this.resetEvents();
    setTimeout(() => {
      activeButton.set("move");
      let isPanning = false;
      let lastClientX;
      let lastClientY;
      this.canvas.discardActiveObject();
      this.canvas.defaultCursor = "move";
      this.canvas.on("mouse:up", (e) => {
        isPanning = false;
      });
      this.canvas.on("mouse:down", (e) => {
        isPanning = true;
        lastClientX = e.e.clientX;
        lastClientY = e.e.clientY;
      });
      this.canvas.on("mouse:move", (e) => {
        if (!isPanning) return;
        let deltaX = 0;
        let deltaY = 0;
        if (lastClientX) {
          deltaX = e.e.clientX - lastClientX;
        }
        if (lastClientY) {
          deltaY = e.e.clientY - lastClientY;
        }
        lastClientX = e.e.clientX;
        lastClientY = e.e.clientY;
        let delta = new fabric.Point(deltaX, deltaY);
        this.canvas.relativePan(delta);
      });
    }, 100);
  };
  finishTakingScreenshot = (/** @type {string} */ base64String) => {
    fabric.Image.fromURL(base64String, (image) => {
      image.set({
        left: 100,
        top: 100,
      });
      this.canvas.add(image);
      this.canvas.renderAll();
      this.saveBoard();
    });
  };
}
export const _arrayBufferToBase64 = (/** @type {any} */ buffer) => {
  var binary = "";
  var len = buffer.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return window.btoa(binary);
};

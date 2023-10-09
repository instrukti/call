import { writable } from "svelte/store";

export const isChatHidden = writable(false);

export const isCallMaximized = writable(false);
export const isWhiteboardHidden = writable(false);
export const isWhiteboardMaximized = writable(false);
export const maximizeCall = () => {
  isCallMaximized.set(true);
  isWhiteboardHidden.set(true);
  isChatHidden.set(true);
};
export const minimizeCall = () => {
  isChatHidden.set(false);
  isWhiteboardHidden.set(false);
  isCallMaximized.set(false);
};
export const maximizeWhiteboard = () => {
  isWhiteboardMaximized.set(true);
  isChatHidden.set(true);
};
export const minimizeWhiteboard = () => {
  isWhiteboardMaximized.set(false);
  isChatHidden.set(false);
};

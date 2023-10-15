import { DataPacket_Kind, RemoteParticipant, Room, VideoPreset, VideoPresets } from "livekit-client";
import { get, writable } from "svelte/store";
import { boardDataJSON, updateBoard } from "./fabric_utils";
import { PB_URL, WS_URL } from "../consts";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
/** @type {import('svelte/store').Writable<VideoPreset>} */
export const videoResolutions = writable(VideoPresets.h720);
/** @type {import('svelte/store').Writable<RemoteParticipant[]>} */
export const remoteParticipants = writable([]);
/** @type {import('svelte/store').Writable<Object[]>} */
export const messages = writable([]);
/** @type {import('svelte/store').Writable<Object>} */
export const newMessage = writable(null);
/** @type {import('svelte/store').Writable<string>} */
export const token = writable(null);
export class LivekitUtils {
  /** @type {Room} */
  room;
  /** @type {string} */
  wsURL = WS_URL;
  /** @type {string} */
  token;
  /** @type {HTMLMediaElement} */
  localViewContainer;
  constructor(/** @type {HTMLMediaElement} */ localContainer, /** @type {string} */ token) {
    this.localViewContainer = localContainer;
    this.setLocalView();
    this.room = new Room();
    this.token = token;
  }
  joinRoom = async () => {
    await this.room.connect(this.wsURL, this.token);
    await this.muteMic();
    await this.turnVideoOff();
    const participants = Array.from(this.room.participants.values()).filter((el) => el.sid != this.room.localParticipant.sid);
    remoteParticipants.set(participants);
    newMessage.subscribe((val) => {
      if (val) this.sendMessage(val.message);
    });
  };
  subscribeToEvents = async () => {
    await this.room.on("participantConnected", this.participantConnected);
    await this.room.on("participantDisconnected", this.participantDisconnected);
    await this.room.on("trackSubscribed", this.trackSubscription);
    await this.room.on("trackUnsubscribed", this.trackUnsubscription);
    await this.room.on("dataReceived", this.handleDataRecieved);
  };
  leaveRoom = async () => {
    await this.room.disconnect();
    token.set(null);
  };
  muteMic = async () => {
    if (this.room) await this.room.localParticipant.setMicrophoneEnabled(false);
  };
  unMuteMic = async () => {
    if (this.room) await this.room.localParticipant.setMicrophoneEnabled(true, { noiseSuppression: true, echoCancellation: true });
  };
  turnVideoOff = async () => {
    if (this.room) await this.room.localParticipant.setCameraEnabled(false);
  };
  turnVideoOn = async () => {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(true, { resolution: get(videoResolutions) });
    }
    this.setLocalView();
  };
  shareScreen = async () => {
    await this.room.localParticipant.setScreenShareEnabled(true);
  };
  stopSharing = async () => {
    await this.room.localParticipant.setScreenShareEnabled(false);
  };
  trackSubscription = async (/** @type {import('livekit-client').RemoteTrack} */ track, /** @type {import('livekit-client').RemoteTrackPublication} */ publication, /** @type {import('livekit-client').RemoteParticipant} */ participant) => {
    console.log(track.kind);
    setTimeout(() => {
      const element = track.attach();
      element.id = track.kind + "_" + participant.sid;
      if (track.kind === "video") {
        element.classList.add("object-cover");
        element.classList.add("rounded-full");
        element.classList.add("!w-20");
        element.classList.add("!h-20");
        element.classList.add("md:!w-32");
        element.classList.add("md:!h-32");
      }
      const parentElement = document.getElementById(participant.sid);
      if (parentElement) parentElement.appendChild(element);
    }, 500);
  };
  trackUnsubscription = async (/** @type {import('livekit-client').RemoteTrack} */ track, /** @type {import('livekit-client').RemoteTrackPublication} */ publication, /** @type {import('livekit-client').RemoteParticipant} */ participant) => {};
  participantConnected = async (/** @type {RemoteParticipant} */ participant) => {
    const participants = Array.from(this.room.participants.values()).filter((el) => el.sid != this.room.localParticipant.sid);
    remoteParticipants.set(participants);
    setTimeout(() => {
      if (get(boardDataJSON) !== null) {
        const payload = { type: "board", data: get(boardDataJSON) };
        this.publishData(JSON.stringify(payload));
      }
    }, 500);
  };
  participantDisconnected = async (/** @type {RemoteParticipant} */ participant) => {
    let participants = get(remoteParticipants);
    participants = participants.filter((el) => el.sid != participant.sid);
    remoteParticipants.set(participants);
  };
  handleDataRecieved = async (/** @type {Uint8Array} */ payload, /** @type {RemoteParticipant} */ participant, /** @type {DataPacket_Kind} */ kind, /** @type {string} */ topic) => {
    const strData = decoder.decode(payload);
    const { type, data } = JSON.parse(strData);
    if (type === "board" && data !== null) {
      boardDataJSON.set(data);
      setTimeout(() => {
        updateBoard.set(Date.now());
      }, 100);
    } else if (type === "chat") {
      const currentMessages = get(messages);
      messages.set([...currentMessages, { sender: data.sender, message: data.message }]);
    }
  };
  setLocalView = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.localViewContainer.srcObject = stream;
  };
  publishData = async (/** @type {string} */ strData) => {
    const data = encoder.encode(strData);
    await this.room.localParticipant.publishData(data, DataPacket_Kind.LOSSY);
  };
  sendMessage = async (/** @type {string} */ message) => {
    const currentMessages = get(messages);
    messages.set([...currentMessages, { sender: "me", message }]);
    const sender = this.room.localParticipant.identity;
    const payload = { type: "chat", data: { sender, message } };
    this.publishData(JSON.stringify(payload));
  };
}
export const getJoinToken = async (/** @type {string} */ userName, /** @type {string} */ roomName) => {
  const response = await fetch(`${PB_URL}/api/getJoinToken?room=${roomName}&name=${userName}`, {
    method: "GET",
  });
  const { token } = await response.json();
  return token;
};

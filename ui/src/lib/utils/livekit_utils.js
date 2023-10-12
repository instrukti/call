import { RemoteParticipant, Room, VideoPreset, VideoPresets } from "livekit-client";
import { get, writable } from "svelte/store";
/** @type {import('svelte/store').Writable<VideoPreset>} */
export const videoResolutions = writable(VideoPresets.h720);
/** @type {import('svelte/store').Writable<RemoteParticipant[]>} */
export const remoteParticipants = writable([]);
export class LivekitUtils {
  /** @type {Room} */
  room;
  /** @type {string} */
  wsURL = "ws://localhost:7880";
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
    await this.room.localParticipant.enableCameraAndMicrophone();
    await this.muteMic();
    await this.turnVideoOff();
  };
  subscribeToEvents = async () => {
    await this.room.on("trackSubscribed", this.trackSubscription);
    await this.room.on("trackUnsubscribed", this.trackUnsubscription);
  };
  leaveRoom = async () => {
    await this.room.disconnect();
  };
  muteMic = async () => {
    await this.room.localParticipant.setMicrophoneEnabled(false);
  };
  unMuteMic = async () => {
    await this.room.localParticipant.setMicrophoneEnabled(true, { noiseSuppression: true, echoCancellation: true });
  };
  turnVideoOff = async () => {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(false);
    }
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
    const element = track.attach();
    const participants = Array.from(this.room.participants.values());
    remoteParticipants.set(participants);
    setTimeout(() => {
      element.id = track.kind + "_" + participant.identity;
      element.classList.add("object-cover");
      element.classList.add("rounded-full");
      element.classList.add("!w-20");
      element.classList.add("!h-20");
      element.classList.add("md:!w-32");
      element.classList.add("md:!h-32");
      const parentElement = document.getElementById(participant.sid);
      if (parentElement) parentElement.appendChild(element);
    }, 500);
  };
  trackUnsubscription = async (/** @type {import('livekit-client').RemoteTrack} */ track, /** @type {import('livekit-client').RemoteTrackPublication} */ publication, /** @type {import('livekit-client').RemoteParticipant} */ participant) => {
    let participants = get(remoteParticipants);
    participants = participants.filter((el) => el.sid != participant.sid);
    remoteParticipants.set(participants);
  };
  setLocalView = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.localViewContainer.srcObject = stream;
  };
}
export const getJoinToken = async (/** @type {string} */ userName, /** @type {string} */ roomName) => {
  const response = await fetch(`http://localhost:8090/api/getJoinToken?room=${roomName}&name=${userName}`, {
    method: "GET",
  });
  const { token } = await response.json();
  return token;
};
export const token = writable(null);

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
  wsURL = "wss://instrukti-nf5brd5y.livekit.cloud";
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
    await this.room.on("trackSubscribed", this.trackSubscription);
    console.log(this.room.participants.size);
    videoResolutions.subscribe(() => {
      this.turnVideoOff();
      this.turnVideoOn();
    });
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
    const participants = Array.from(this.room.participants.values());
    remoteParticipants.set(participants);
    setTimeout(() => {
      const parentElement = document.getElementById(participant.sid);
      const element = track.attach();
      parentElement.appendChild(element);
    });
  };
  setLocalView = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.localViewContainer.srcObject = stream;
  };
}

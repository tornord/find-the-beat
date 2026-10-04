/**
 * Canonical types for the Spotify Embed IFrame API
 * (https://developer.spotify.com/documentation/embeds/reference/iframe-api).
 *
 * This is the single source of truth for the global `window.onSpotifyIframeApiReady`
 * hook. Do not re-declare these shapes elsewhere: `declare global` merges across the
 * whole program, so a second, slightly different definition makes `Window` augmentation
 * fail with "incorrectly extends interface 'Window'".
 */

export interface EmbedControllerData {
  duration: number;
  isBuffering: boolean;
  isPaused: boolean;
  playingURI: string;
  position: number;
}

export interface EmbedControllerEvent {
  data: EmbedControllerData;
}

export type EmbedControllerEventName = "ready" | "playback_started" | "playback_update" | "playback_stopped";

/**
 * Options accepted by `IFrameApi.createController`.
 *
 * Provide either `uri` (a Spotify URI, e.g. `spotify:track:<id>`) or `url` (a
 * full Spotify URL, e.g. `https://open.spotify.com/track/<id>?si=abc`). If both
 * are given, `url` wins. Passing a web URL as `uri` throws
 * "Invalid URI: https://open.spotify.com/track/<id>".
 */
export interface EmbedControllerOptions {
  uri?: string;
  url?: string;
  width?: number | string;
  height?: number | string;
}

export interface EmbedController {
  /** Accepts Spotify URIs (e.g. `spotify:track:<id>`) only. */
  loadUri: (uri: string, preferVideo?: boolean, startAt?: number, theme?: "dark") => void;
  /** Accepts either a Spotify URI or a full Spotify URL. */
  loadEntity: (spotifyUriOrUrl: string, preferVideo?: boolean, startAt?: number) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  restart: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (event: EmbedControllerEventName, callback: (e: EmbedControllerEvent) => void) => void;
  options: EmbedControllerOptions;
}

export interface IFrameApi {
  createController: (
    element: HTMLElement,
    options: EmbedControllerOptions,
    callback: (e: EmbedController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (e: IFrameApi) => void;
  }
}

import { useEffect, useRef, useState } from "react";

import { EmbedController, EmbedControllerEvent, useSpotifyIFrameApi } from "./SpotifyContext";

/** Round to the nearest 1/20th of a second, so click timings stay stable. */
const round20 = (n: number) => Math.round(n * 20) / 20;

/**
 * The IFrame API's `uri` option (and `loadUri`) accept a Spotify URI only.
 * A full `https://open.spotify.com/track/<id>` web URL raises
 * "Invalid URI: https://open.spotify.com/track/<id>"; web URLs belong in `url`/`loadEntity`.
 */
export const toTrackUri = (trackId: string) => {
  if (trackId.startsWith("spotify:")) return trackId;
  const id = trackId.match(/(?:track[/:])([A-Za-z0-9]+)/)?.[1];
  return `spotify:track:${id ?? trackId}`;
};

/** Extract the track id whether Spotify reports a URI, a URL or an embed URL. */
const trackIdFromUri = (playingURI: string): string | null => playingURI.match(/[A-Za-z0-9]{22}/)?.[0] ?? null;

export interface SpotifyPlayerChangeEvent {
  isPaused: boolean;
  trackId: string | null;
  playStart: number | null;
}

interface SpotifyPlayerProps {
  trackId: string;
  height?: number;
  autoPlay?: boolean;
  onChange?: (e: SpotifyPlayerChangeEvent) => void;
  play?: boolean;
}

export function SpotifyPlayer({ trackId, height, autoPlay, onChange, play }: SpotifyPlayerProps) {
  height ??= 152;
  if (autoPlay === undefined) {
    autoPlay = false;
  }
  if (play === undefined) {
    play = true;
  }
  const elRef = useRef<HTMLDivElement>(null);
  const iFrameApi = useSpotifyIFrameApi();
  const [embedController, setEmbedController] = useState<EmbedController | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [playStart, setPlayStart] = useState<number | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string>(trackId);
  useEffect(() => {
    setPlayingTrackId(trackId);
  }, [trackId]);
  const createTrackIdRef = useRef("");
  const loadTrackIdRef = useRef("");
  const isPlayingRef = useRef(play);
  isPlayingRef.current = play;
  useEffect(() => {
    // console.log("useEmbedController", embedController, trackId);
    if (!elRef.current || !iFrameApi || !trackId) {
      // console.log("useEmbedController skip", trackId);
      return;
    }
    if (!embedController && !createTrackIdRef.current) {
      console.log("createController", trackId); // eslint-disable-line no-console
      const callback = (e: EmbedController) => {
        e.addListener("ready", () => {
          console.log("Spotify Embed is ready"); // eslint-disable-line no-console
          if (autoPlay) {
            e.play();
          }
          setEmbedController(e);
        });
        e.addListener("playback_update", (d: EmbedControllerEvent) => {
          const { duration, isBuffering, isPaused: paused, playingURI, position } = d.data;
          // eslint-disable-next-line no-console
          console.log(
            `Playback update: dur ${duration}, isBuf ${isBuffering}, isPaus ${paused}, uri ${playingURI}, pos ${position}`
          );
          setIsPaused(paused);
          setPlayStart(paused ? null : round20(Date.now() / 1000 - position / 1000));
          const tid = trackIdFromUri(playingURI);
          if (tid) setPlayingTrackId(tid);
          // if ((isPaused && isPlayingRef.current)||(!isPaused && !isPlayingRef.current)) {
          //   e.togglePlay();
          // }
        });

        e.addListener("playback_started", (d: EmbedControllerEvent) => {
          const { playingURI } = d.data;
          console.log(`playback_started: ${playingURI}`); // eslint-disable-line no-console
          // setIsPlaying(true);
        });
      };
      const uri = toTrackUri(trackId);
      createTrackIdRef.current = trackId;
      iFrameApi.createController(elRef.current, { uri, height }, callback);
    }
    if (
      embedController &&
      createTrackIdRef.current &&
      trackId !== createTrackIdRef.current &&
      trackId !== loadTrackIdRef.current
    ) {
      console.log("loadUri", trackId); // eslint-disable-line no-console
      const uri = toTrackUri(trackId);
      loadTrackIdRef.current = trackId;
      embedController!.loadUri(uri);
    }
  }, [elRef.current, embedController, iFrameApi, trackId]);
  useEffect(() => {
    onChange?.({ isPaused, trackId: playingTrackId, playStart });
  }, [isPaused, playingTrackId, playStart]);
  return <div ref={elRef} id="embed-iframe" data-track-uri={toTrackUri(trackId)} data-paused={isPaused} />;
}

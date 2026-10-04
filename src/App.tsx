import { type ComponentProps, useState } from "react";

import { BeatApp } from "./BeatApp";
import { SpotifyPlayer } from "./spotify/SpotifyPlayer";

type SpotifyPlayerChangeEvent = Parameters<NonNullable<ComponentProps<typeof SpotifyPlayer>["onChange"]>>[0];

interface AppProps {
  startTrackId: string;
}

export function App({ startTrackId }: AppProps) {
  const [state, setState] = useState<SpotifyPlayerChangeEvent>({
    isPaused: true,
    trackId: startTrackId,
    playStart: null,
  });
  return (
    <>
      <SpotifyPlayer trackId={startTrackId} height={152} onChange={(e) => setState(e)} />
      {state.trackId ? <BeatApp isPaused={state.isPaused} trackId={state.trackId} playStart={state.playStart} /> : null}
    </>
  );
}

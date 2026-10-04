import { css, Global } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { BeatApp } from "./BeatApp";
// import { EmbedControllerProvider } from "./EmbedControllerContext";
// import { TrackList } from "./TrackList";

const round20 = (n: number) => Math.round(n * 20) / 20;

const GlobalStyle = () => (
  <Global
    styles={css`
      :root {
        font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 16px;
        font-weight: 400;

        --text: #444;
        --sec-text: #fff;
        --bg: #fff;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --text: #fff;
          --sec-text: #121212;
          --bg: #121212;
        }
      }

      body {
        /* margin: 0; */
        color: var(--text);
        background-color: var(--bg);
      }
    `}
  />
);

const tracks = [
  { id: "0eU5RvAuflvtcrRVPsdiBt", imageUrl: "https://i.scdn.co/image/ab67616d00001e02520bcd73cf5ac6df86c913fb" }, // La Llave = 3.3
  { id: "0WJqcKDASS5OCuPXs4iUTQ", imageUrl: "https://i.scdn.co/image/ab67616d00001e027899b244fce713e6a1d16895" }, // Caminando = 3.4
  { id: "7DgaZInP8MEGkyAUI0Ygbm", imageUrl: "https://i.scdn.co/image/ab67616d00001e0264d92b73835afbaf2d7a08c4" }, // Ay Mi Maria = 3.5
  { id: "2DAycycEx8MS39QYu1z0LK", imageUrl: "https://i.scdn.co/image/ab67616d00001e027ae67d8cfadd0f5d58bdf756" }, // Nabori = 3.6
  { id: "0odZdAJaLd4NEyYXb3t1Wc", imageUrl: "https://i.scdn.co/image/ab67616d00001e02f6f8e88a3d8982e39d50a60b" }, // Hermando = 3.7
  { id: "0t8QWvAAmoOz5jLCAVhqVl", imageUrl: "https://i.scdn.co/image/ab67616d00001e02d6b2bc9b3affd7ffdbab4948" }, // Mambo Diablo = 3.8
  { id: "2CcyeSu1PAIIhb4Iv5sagx", imageUrl: "https://i.scdn.co/image/ab67616d00001e026aa9cd4cf05b2227778b095c" }, // Así Vivo Yo
  { id: "0CSJp9bSIhAQ1J8uHTHebu", imageUrl: "https://i.scdn.co/image/ab67616d00001e02bca077158ab335f8a0d6867b" }, // I Like to Mambo
  { id: "3ihMiG7GPZdsWJcf7Tyevw", imageUrl: "https://i.scdn.co/image/ab67616d00001e026a73e569aa135de578e582eb" }, // Abre Que Voy
  { id: "3vnbxQMKngx8r8keykJexy", imageUrl: "https://i.scdn.co/image/ab67616d00001e02cd807091ce17b1f5cf4fdc04" }, // Loco Pero Feliz
];

interface IFrameAPI {
  createController: (element: HTMLElement, options: { uri: string }) => void;
}

interface SpotifyPlayerChangeEvent {
  isPaused: boolean;
  trackId: string | null;
  playStart: number | null;
}

interface SpotifyPlayerProps {
  startTrackId: string;
  onChange?: (e: SpotifyPlayerChangeEvent) => void;
}

function SpotifyPlayer({ startTrackId, onChange }: SpotifyPlayerProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [embedController, setEmbedController] = useState<unknown | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [playStart, setPlayStart] = useState<number | null>(null);
  // const refPlayStart = useRef<number | null>(playStart);
  const [trackId, setTrackId] = useState<string | null>(startTrackId);
  const trackIdRef = useRef(trackId);

  useEffect(() => {
    if (!trackIdRef.current) return;
    window.onSpotifyIframeApiReady = (iFrameAPI: IFrameAPI) => {
      const callback = (e: unknown) => {
        setEmbedController(e);
      };
      const uri = `https://open.spotify.com/track/${trackIdRef.current}`;
      iFrameAPI.createController(elRef.current, { uri }, callback);
    };
  }, [trackIdRef.current]);
  useEffect(() => {
    embedController?.addListener("playback_update", (e: { data: { position: number; isPaused: boolean } }) => {
      let t = null;
      if (!e.data.isPaused) {
        const s = e.data.position / 1000;
        t = round20(Date.now() / 1000 - s);
      }
      setPlayStart(t);
      setIsPaused(e.data.isPaused);
      let tid: string | null = null;
      if (embedController) {
        const m = embedController.options.uri.match(/track\/(.+)/);
        if (m) {
          tid = m[1];
        }
      }
      setTrackId(tid);
    });
  }, [embedController]);

  useEffect(() => {
    onChange?.({ isPaused, trackId, playStart: playStart });
  }, [isPaused, trackId, playStart]);

  // console.log("SpotifyPlayer", playStart);
  return <div ref={elRef} id="embed-iframe"></div>;
}

interface AppProps {
  startTrackId: string;
}

function App({ startTrackId }: AppProps) {
  const [state, setState] = useState({ isPaused: true, trackId: startTrackId, playStart: null });
  return (
    <>
      <SpotifyPlayer startTrackId={startTrackId} onChange={(e) => setState(e)} />
      {state.trackId ? (
        <BeatApp isPaused={state.isPaused} trackId={state.trackId!} playStart={state.playStart} />
      ) : null}
    </>
  );
}

const rootNode = document.getElementById("root");
const root = createRoot(rootNode!);
root.render(
  <>
    <GlobalStyle />
    {/* <App startTrackId={tracks[4].id} /> */}
    <App startTrackId={"4U8a3PPOICUqRzva61vFv6"} />
    {/* <EmbedControllerProvider value={embedController}>
    </EmbedControllerProvider> */}
  </>
);

// https://open.spotify.com/track/7EcekBXCAHQ7N5DT8wfXf4?si=bc640f71a27c4fd8
// https://open.spotify.com/track/4U8a3PPOICUqRzva61vFv6?si=6b8a4def6d454710
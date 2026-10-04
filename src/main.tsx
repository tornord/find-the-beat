import { css, Global } from "@emotion/react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { SpotifyProvider } from "./spotify/SpotifyContext";

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

export const tracks = [
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

const rootNode = document.getElementById("root");
const root = createRoot(rootNode!);
root.render(
  <>
    <GlobalStyle />
    <SpotifyProvider>
      {/* <App startTrackId={tracks[4].id} /> */}
      <App startTrackId={"4U8a3PPOICUqRzva61vFv6"} />
    </SpotifyProvider>
  </>
);

// https://open.spotify.com/track/7EcekBXCAHQ7N5DT8wfXf4?si=bc640f71a27c4fd8
// https://open.spotify.com/track/4U8a3PPOICUqRzva61vFv6?si=6b8a4def6d454710

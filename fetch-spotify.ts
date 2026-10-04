/* eslint-disable no-console */
const tracks = [
  { id: "0odZdAJaLd4NEyYXb3t1Wc", imageUrl: "https://i.scdn.co/image/ab67616d00001e02f6f8e88a3d8982e39d50a60b" },
  { id: "2CcyeSu1PAIIhb4Iv5sagx", imageUrl: "https://i.scdn.co/image/ab67616d00001e026aa9cd4cf05b2227778b095c" },
  { id: "0t8QWvAAmoOz5jLCAVhqVl", imageUrl: "https://i.scdn.co/image/ab67616d00001e02d6b2bc9b3affd7ffdbab4948" },
];

async function main() {
  for (const t of tracks) {
    const data = await fetch(`https://api.spotify.com/v1/tracks/${t.id}`, {
      headers: { Authorization: `Bearer ${process.env.SPOTIFY_API_TOKEN}` },
    }).then((res) => res.json());
    console.log(data);
  }
}

main();

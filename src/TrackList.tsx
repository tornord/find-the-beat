export const TrackList = ({ tracks }: { tracks: { id: string; imageUrl: string }[] }) => {
  return (
    <div style={{ display: "flex", overflowX: "scroll" }}>
      {tracks.map((track) => (
        <div key={track.id} style={{ margin: "0 10px" }}>
          <img src={track.imageUrl} alt={`Track ${track.id}`} style={{ width: "100px", height: "100px" }} />
        </div>
      ))}
    </div>
  );
};

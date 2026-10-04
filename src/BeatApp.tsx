import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

import { analyzeClickedTimes, BeatAnalysis, interpolateBeat } from "./beatMath";
// import { useEmbedController } from "./EmbedControllerContext";

const StyledApp = styled.div(
  () => css`
    display: flex;
    flex-direction: column;

    > div {
      margin: 0.5rem 0 0 0;
    }

    button {
      padding: 0.25rem 0.5rem;
      border: 0;
      border-radius: 0.25rem;
      color: #fff;

      &.clear {
        background-color: hsl(6deg 54.31% 50.75%);
      }
    }

    .click-bar {
      display: flex;
      justify-content: center;
      position: relative;
      margin: 1rem 0 0.4rem;

      .beat-info {
        line-height: 1.4;
        font-size: 1.25rem;
        position: absolute;
        top: 0.7rem;
        left: 0;
      }

      button {
        background-color: #1b75d0;

        &.one-click {
          font-size: 1.4rem;
          line-height: 1.5;
          background-color: #1b75d0;
          padding-left: 1rem;
          padding-right: 1rem;

          &.paused {
            background-color: #5f5f76;
          }
        }
      }
    }

    .grid {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .cell {
        width: ${100 / 35}%;
        color: #fff;
        background-color: #5f5f76;
        border: none;
        padding: 0.3rem 0;
        float: left;
        text-align: center;
        cursor: pointer;
      }

      .cell.capo {
        background-color: #8585a3;
      }

      .cell.active {
        background-color: #aaffee;
      }
    }

    .click-table {
      .row {
        width: 14rem;
        /* height: 1.5rem; */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 0;

        &:nth-of-type(odd) {
          background-color: #eee;

          @media (prefers-color-scheme: dark) {
            background-color: #666;
          }
        }

        div {
          padding: 0.3rem 0;
          margin-right: 0.5rem;
          text-align: center;
        }

        div.delete {
          padding: 0 0.3rem 0.15rem;
          border: 0;
          border-radius: 0.25rem;
          color: #fff;
          background-color: hsl(6deg 54.31% 50.75%);
          height: 1rem;
          margin-top: 0.25rem;
          cursor: pointer;
        }

        .col1 {
          width: 3rem;
        }
        .col2 {
          width: 4.5rem;
        }
        .col3 {
          width: 4rem;
        }
        .col4 {
          width: 0.5rem;
        }
      }
    }
  `
);

const getInitialClickTimes = (trackId: string) => {
  let savedClickTimes = localStorage.getItem(`track:${trackId}`);
  if (!savedClickTimes) {
    savedClickTimes = localStorage.getItem(trackId);
  }
  if (!savedClickTimes) {
    savedClickTimes = localStorage.getItem(`https://open.spotify.com/track/${trackId}`);
  }
  return savedClickTimes ? JSON.parse(savedClickTimes) : [];
};

function useInterval(callback: () => void, ms?: number, deps?: React.DependencyList) {
  useEffect(() => {
    const intervalId = setInterval(callback, ms);
    return () => clearInterval(intervalId);
  }, deps);
}

interface BeatAppProps {
  isPaused: boolean;
  trackId: string;
  playStart: number | null;
}

export function BeatApp({ isPaused, trackId, playStart }: BeatAppProps) {
  // const embedController = useEmbedController();
  const [clickedTimes, setClickedTimes] = useState<number[]>(getInitialClickTimes(trackId));
  const refBeatData = useRef<BeatAnalysis | undefined>(undefined);
  const refPlayStart = useRef<number | null>(playStart);
  refPlayStart.current = playStart;
  useMemo(() => {
    // console.log("analyzeClickedTimes"); // eslint-disable-line no-console
    refBeatData.current = analyzeClickedTimes(clickedTimes);
    // const key = embedController.options.uri;
    localStorage.setItem(`track:${trackId}`, JSON.stringify(clickedTimes));
  }, [trackId, clickedTimes.join(",")]);

  const [beat, setBeat] = useState({ index: 0, step: -1 });
  useInterval(
    () => {
      if (refPlayStart.current === null || isPaused) return;
      const t = Date.now() / 1000 - refPlayStart.current;
      const beatData = refBeatData.current as BeatAnalysis;
      if (!beatData || beatData.bpm === 0 || beatData.oneTimes.length === 0 || t < beatData.oneTimes[0]) return;
      const b = interpolateBeat(t, beatData.bpm, beatData.oneTimes);
      if (!b) return;
      const res = { index: b.oneIndex, step: b.stepIndex };
      if (res.index === beat.index && res.step === beat.step) return;
      setBeat(res);
    },
    10,
    [isPaused]
  );
  const bd = refBeatData.current as BeatAnalysis;
  return (
    <StyledApp>
      <div className="click-bar">
        <div className="beat-info">
          <div>BPM: {bd.bpm.toFixed(0)}</div>
          <div>8-beats: #{(beat.index + 1).toFixed(0)}</div>
        </div>
        <button
          className={clsx("one-click", isPaused ? "paused" : "")}
          onClick={() => {
            if (!refPlayStart.current) return;
            const beatData = refBeatData.current as BeatAnalysis;
            const t = Date.now() / 1000 - refPlayStart.current!;
            if (clickedTimes.length <= 1 || !beatData || beatData.bpm === 0) {
              const ts = [...clickedTimes, t];
              ts.sort((d1, d2) => d1 - d2);
              setClickedTimes(ts);
              return;
            }
            const b = interpolateBeat(t, beatData.bpm, beatData.oneTimes);
            const ic = beatData.clickedBeats.findIndex((d) => d.closestOneIndex === b!.closestOneIndex);
            if (ic < 0 || ic >= clickedTimes.length) {
              const ts = [...clickedTimes, t];
              ts.sort((d1, d2) => d1 - d2);
              setClickedTimes(ts);
              return;
            }
            const ts = [...clickedTimes];
            ts[ic] = t;
            setClickedTimes(ts);
          }}
        >
          Click when you
          <br />
          hear the "1" beats
        </button>
      </div>
      <div className="grid">
        {[...Array(32)].map((_, i) => (
          <div key={i} className={clsx("cell", i % 4 === 0 ? "capo" : "", i === beat.step ? "active" : "")}>
            {i % 4 === 0 ? i / 4 + 1 : " "}
          </div>
        ))}
      </div>
      <div className="click-table">
        {clickedTimes.map((d, i) => (
          <div key={i} className="row">
            <div className="col1">
              {refBeatData.current?.clickedBeats?.[i] ? `#${bd.clickedBeats[i].closestOneIndex + 1}` : ""}
            </div>
            <div className="col2">{d.toFixed(2)}</div>
            <div className="col3">
              {bd && i < bd.clickedBeats.length ? (bd.clickedBeats[i].closestPhase * 8).toFixed(2) : ""}
            </div>
            <div
              className="col4 delete"
              onClick={() => {
                setClickedTimes(clickedTimes.filter((_, j) => j !== i));
              }}
            >
              x
            </div>
          </div>
        ))}
      </div>
      <div>
        <button className="clear" onClick={() => setClickedTimes([])}>
          Clear
        </button>
      </div>
    </StyledApp>
  );
}

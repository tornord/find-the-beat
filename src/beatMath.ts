const { abs, min, round, sqrt } = Math;

export function weightedSumSqr(arr: number[], weights: number[]) {
  return arr.reduce((a, b, i) => a + weights[i] * b ** 2, 0);
}

export function goldenSectionSearch(lossFn: (x: number) => number, xa: number, xb: number, error = 1e-6) {
  const gr = 2 / (sqrt(5) + 1);
  const goldenRatio = (w0: number, w1: number) => gr * w0 + (1 - gr) * w1;
  const x = [xa, goldenRatio(xa, xb), goldenRatio(xb, xa), xb];
  const f = x.map((d) => lossFn(d));
  while (x[2] - x[1] > error) {
    if (f[1] < f[2]) {
      x[3] = x[2];
      f[3] = f[2];
      x[2] = x[1];
      f[2] = f[1];
      x[1] = goldenRatio(x[0], x[3]);
      f[1] = lossFn(x[1]);
    } else {
      x[0] = x[1];
      f[0] = f[1];
      x[1] = x[2];
      f[1] = f[2];
      x[2] = goldenRatio(x[3], x[0]);
      f[2] = lossFn(x[2]);
    }
  }
  return (x[1] + x[2]) / 2;
}

function bpmErr(bpm: number, diffs: number[]) {
  const dt = (60 / bpm) * 8;
  const ns = diffs.map((d) => round(d / dt));
  const ws = ns.map((d) => 0.8 ** (d - 1));
  const errs = diffs.map((d, i) => (d - dt * ns[i]) / ns[i]);
  return weightedSumSqr(errs, ws);
}

function calcBpm(ts: number[]) {
  const bMin = 115;
  const bMax = 220;
  const diffs = ts.map((t, i) => ts[i + 1] - t).slice(0, -1);
  const bMaxErr = goldenSectionSearch((x) => -bpmErr(x, diffs), bMin, bMax);
  // const eMax = bpmErr(bMaxErr, diffs);
  if (abs(bMaxErr - bMin) < 1e-3 || abs(bMaxErr - bMax) < 1e-3) {
    return goldenSectionSearch((x) => bpmErr(x, diffs), bMin, bMax);
  }
  const b1 = goldenSectionSearch((x) => bpmErr(x, diffs), bMin, bMaxErr);
  const e1 = bpmErr(b1, diffs);
  const b2 = goldenSectionSearch((x) => bpmErr(x, diffs), bMaxErr, bMax);
  const e2 = bpmErr(b2, diffs);
  return e1 < e2 ? b1 : b2;
}

export function roundDiff(x: number) {
  const r = round(x);
  return x - r;
}

function oneBeatErr(b: number, bs: number[], ws: number[]) {
  return weightedSumSqr(
    bs.map((d) => roundDiff(d + b)),
    ws
  );
}

// interface BeatPosition {
//   t0: number;
//   b: number;
// }

function calcTrueOneTime(t: number, bpm: number, ts: number[]): number {
  const dt = (60 / bpm) * 8;
  const bs = ts.map((d) => (d - t) / dt);
  const ws = bs.map((d) => 0.9 ** abs(d));
  const r = goldenSectionSearch((x) => oneBeatErr(x, bs, ws), -0.5, 0.5);
  const t0 = t - r * dt;
  return t0; //{ t0, b: 8 * r };
}

// function calcTrueOneTime(t0: number, bpm: number, ts: number[]) {
//   const p = calcOneBeatPosition(t0, bpm, ts);
//   return p.t0;
// }

function calcTrueOneTimes(ts: number[], bpm: number) {
  const tMax = ts[ts.length - 1] + 60;
  const dt = (60 / bpm) * 8;
  let t = calcTrueOneTime(0, bpm, ts);
  const res: number[] = [t];
  while (t < tMax) {
    t = calcTrueOneTime(t + dt, bpm, ts);
    res.push(t);
  }
  return res;
}

export function indexOf(t: number, vs: number[]): number {
  let i: number = 0;
  const n = vs.length;
  if (n === 0) return -1;
  else if (t < vs[0]) return -1;
  else if (t >= vs[n - 1]) return n - 1;

  if (n > 40) {
    //Binary search if >40 (otherwise it's no gain using it)
    let hi = n - 1;
    let low = 0;
    if (t.valueOf() >= vs[hi]) return hi;
    while (hi > low + 1) {
      i = Math.floor((hi + low) / 2);
      if (t >= vs[i]) low = i;
      else {
        hi = i;
        i = low;
      }
    }
    return i;
  } else {
    //Incremental search
    i = 1;
    while (t >= vs[i] && i < n - 1) i++;
    return i - 1;
  }
}

// export function findIndex(t: number, bpm: number, oneTimes: number[]) {
//   const dt = (60 / bpm) * 8;
//   let iMin = -1;
//   let dMin = null;
//   for (let i = 0; i < oneTimes.length - 1; i++) {
//     const diff = abs(t - oneTimes[i]);
//     if (diff >= dt) continue;
//     if (iMin === -1 || diff < dMin!) {
//       iMin = i;
//       dMin = diff;
//     }
//   }
//   return iMin!;
// }

export interface Beat {
  time: number;
  oneIndex: number;
  phase: number;
  closestOneIndex: number;
  closestPhase: number;
  stepIndex: number; // 0-31
}

export interface BeatAnalysis {
  bpm: number;
  oneTimes: number[];
  clickedBeats: Beat[];
}

export function analyzeClickedTimes(ts: number[]): BeatAnalysis {
  if (ts.length < 2) {
    return { bpm: 0, oneTimes: [], clickedBeats: [] };
  }
  const bpm = calcBpm(ts);
  const oneTimes = calcTrueOneTimes(ts, bpm);
  const idxs = ts.map((d) => interpolateBeat(d, bpm, oneTimes) as Beat);
  return { bpm, oneTimes, clickedBeats: idxs };
}

export function calcBpmBeat(t: number, bpm: number, oneTime: number) {
  const dt = (60 / bpm) * 8;
  const b = (t - oneTime) / dt;
  return b;
}

export function interpolateBeat(t: number, bpm: number, oneTimes: number[]): Beat | null {
  if (oneTimes.length === 0) {
    return null;
  }
  const res = { time: t, oneIndex: -1, phase: 0, closestOneIndex: -1, closestPhase: 0, stepIndex: -1 };
  let b: number;
  let i0 = indexOf(t, oneTimes);
  if (i0 === -1 || i0 === oneTimes.length - 1) {
    i0 = t < oneTimes[0] ? 0 : oneTimes.length - 1;
    b = calcBpmBeat(t, bpm, oneTimes[i0]);
    res.closestPhase = roundDiff(b);
    res.closestOneIndex = i0 + b - res.closestPhase;
  } else {
    res.closestOneIndex = i0;
    const t0 = oneTimes[i0];
    const t1 = oneTimes[i0 + 1];
    let f = (t - t0) / (t1 - t0);
    if (abs(t - t1) < abs(t - t0)) {
      res.closestOneIndex += 1;
      f = f - 1;
    }
    res.closestPhase = f;
  }
  res.phase = res.closestPhase;
  res.oneIndex = res.closestOneIndex;
  if (res.phase < 0) {
    res.phase += 1;
    res.oneIndex--;
  }
  res.stepIndex = round(res.phase * 32);
  if (res.stepIndex === 32) {
    res.oneIndex++;
    res.stepIndex = 0;
  }
  return res;
}

// function main() {
//   const clickedTimes = [
//     22.470999717712402, 24.89199995994568, 27.372999906539917, 29.83399987220764, 32.134000062942505, 34.59599995613098,
//     37.04300022125244, 39.575000286102295, 42.05800008773804, 44.38100028038025, 46.93299984931946, 49.45799994468689,
//     51.8270001411438, 54.24500012397766, 56.78600025177002, 59.170000076293945, 61.65299987792969, 64.08800005912781,
//     66.54900002479553, 88.63599991798401, 91.14000010490417, 93.55900001525879, 95.91799998283386, 98.37400007247925,
//     100.80999994277954, 103.20799994468689, 135.26500010490417, 137.614000082016, 140.0460000038147, 149.8639998435974,
//     152.22700023651123, 165.72399997711182, 194.1050000190735, 196.40199995040894, 198.80599999427795,
//     201.3360002040863, 203.73099994659424, 206.1619999408722, 218.44399976730347, 235.57100009918213,
//     238.01600003242493, 240.4029998779297, 242.79099988937378, 245.26399993896484,
//   ];
//   const t0 = performance.now();
//   const a = analyzeClickedTimes(clickedTimes);
//   const t1 = performance.now();
//   // const x = findIndex(clickedTimes[31], a.bpm, a.oneTimes);
//   console.log(t1 - t0);
//   const diffs = ts.map((d, i) => ts[i + 1] - d).slice(0, -1);
//   const bpms = diffs.map((d) => 60 / (d / 8));
//   for (let i = 0; i < clickedTimes.length; i++) {
//     console.log(i, clickedTimes[i], calcOneBeatPosition(clickedTimes[i], bpm, clickedTimes));
//   }
// }

// main();

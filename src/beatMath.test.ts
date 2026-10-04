import { analyzeClickedTimes, calcBpmBeat, indexOf, interpolateBeat, roundDiff, weightedSumSqr } from "./beatMath";

const round3 = (d: number) => Math.round(d * 1000) / 1000;

describe("beatMath", () => {
  it("weightedSumSqr", () => {
    const ws = [1, 2, 3];
    const xs = [1, 2, 3];
    expect(weightedSumSqr(xs, ws)).toBe(36);
  });

  it("roundDiff", () => {
    expect(roundDiff(1)).toBeCloseTo(0);
    expect(roundDiff(0.6)).toBeCloseTo(-0.4);
    expect(roundDiff(1.3)).toBeCloseTo(0.3);
    expect(roundDiff(3.4999)).toBeCloseTo(0.4999);
  });

  it("calcBpmBeat", () => {
    let b = calcBpmBeat(3, 120, 2);
    expect(b).toBeCloseTo(0.25);
    b = calcBpmBeat(1.5, 120, 2.5);
    expect(b).toBeCloseTo(-0.25);
  });

  it("indexOf", () => {
    expect(indexOf(1, [])).toBe(-1);
    expect(indexOf(0.5, [1, 2, 3])).toBe(-1);
    expect(indexOf(3, [1, 2, 3])).toBe(2);
    expect(indexOf(3, [1, 2, 4])).toBe(1);
    expect(indexOf(5, [1, 2, 4])).toBe(2);
  });

  it("interpolateBeat", () => {
    let b = interpolateBeat(3, 120, []);
    expect(b).toEqual(null);
    b = interpolateBeat(3, 120, [4]);
    expect(b).toEqual({ time: 3, oneIndex: -1, phase: 0.75, closestOneIndex: 0, closestPhase: -0.25, stepIndex: 24 });
    b = interpolateBeat(3.99, 120, [4]);
    expect(b).toEqual({
      time: 3.99,
      oneIndex: 0,
      phase: 0.9975,
      closestOneIndex: 0,
      closestPhase: -0.0024999999999999467,
      stepIndex: 0,
    });
    b = interpolateBeat(5, 120, [4]);
    expect(b).toEqual({ time: 5, oneIndex: 0, phase: 0.25, closestOneIndex: 0, closestPhase: 0.25, stepIndex: 8 });
    b = interpolateBeat(12, 120, [4]);
    expect(b).toEqual({ time: 12, oneIndex: 2, phase: 0, closestOneIndex: 2, closestPhase: 0, stepIndex: 0 });
    b = interpolateBeat(9, 120, [4, 8]);
    expect(b).toEqual({ time: 9, oneIndex: 1, phase: 0.25, closestOneIndex: 1, closestPhase: 0.25, stepIndex: 8 });
    b = interpolateBeat(6, 120, [4, 8]);
    expect(b).toEqual({ time: 6, oneIndex: 0, phase: 0.5, closestOneIndex: 0, closestPhase: 0.5, stepIndex: 16 });
    b = interpolateBeat(11, 120, [4, 8, 12]);
    expect(b).toEqual({ time: 11, oneIndex: 1, phase: 0.75, closestOneIndex: 2, closestPhase: -0.25, stepIndex: 24 });
    b = interpolateBeat(12, 120, [4, 8, 13]);
    expect(b).toEqual({
      time: 12,
      oneIndex: 1,
      phase: 0.8,
      closestOneIndex: 2,
      closestPhase: -0.19999999999999996,
      stepIndex: 26,
    });
  });

  it("analyzeClickedTimes - 1", () => {
    const a = analyzeClickedTimes([4, 8, 12]);
    expect(a.bpm).toBeCloseTo(120);
    for (let i = 0; i < 6; i++) {
      expect(a.oneTimes[i]).toBeCloseTo(4 * i);
    }
  });

  it("analyzeClickedTimes - 2", () => {
    const a = analyzeClickedTimes([1, 2, 3, 22.25, 41.5, 42.5, 43.5].map((d) => d * 4));
    expect(a.bpm).toBeCloseTo(119.9859, 4);
    for (let i = 0; i < 6; i++) {
      expect(a.oneTimes[i]).toBeCloseTo(4 * i + 0.1, 1);
    }
    expect(a.clickedBeats.map((d) => d.closestOneIndex)).toEqual([1, 2, 3, 22, 41, 42, 43]);
    expect(a.clickedBeats.map((d) => round3(d.time))).toEqual([4, 8, 12, 89, 166, 170, 174]);
    expect(a.clickedBeats.map((d) => round3(d.closestPhase))).toEqual([-0.016, -0.017, -0.019, 0, 0.019, 0.017, 0.016]);
  });

  it("analyzeClickedTimes - 3", () => {
    const a = analyzeClickedTimes(
      [5.86, 8.21, 10.62, 13.14, 48.36, 50.8, 53.36, 55.87, 87.87, 90.26, 92.73].map((d) => d)
    );
    expect(a.bpm).toBeCloseTo(195.3843, 4);
    const es = [1.0001, 3.4561, 5.9136, 8.3734, 10.8412, 13.3297];
    for (let i = 0; i < 6; i++) {
      expect(a.oneTimes[i]).toBeCloseTo(es[i], 1);
    }
    expect(a.clickedBeats.map((d) => d.closestOneIndex)).toEqual([2, 3, 4, 5, 19, 20, 21, 22, 35, 36, 37]);
    expect(a.clickedBeats.map((d) => round3(d.closestPhase))).toEqual([
      -0.022, -0.066, -0.09, -0.072, 0.034, 0.019, 0.053, 0.069, 0.041, 0.012, 0.016,
    ]);
  });
});

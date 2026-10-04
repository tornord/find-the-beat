/* eslint-disable no-console */
function calculateBpmAndFillOnes(ones: number[]): { bpm: number; allOnes: number[] } {
  // Calculate time intervals between consecutive "1" beats
  const intervals: number[] = [];
  for (let i = 0; i < ones.length - 1; i++) {
    intervals.push(ones[i + 1] - ones[i]);
  }

  // Calculate average interval and BPM
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const bpm = 60 / avgInterval;

  // Fill in missing "1" beats
  const allOnes: number[] = [ones[0]];
  let currentTime = ones[0];

  // Add new "1" beats based on the average interval
  while (currentTime < ones[ones.length - 1]) {
    currentTime += avgInterval;
    allOnes.push(parseFloat(currentTime.toFixed(2))); // Round to 2 decimal places
  }

  // Include original "1" beats and sort the list
  const completeOnes = Array.from(new Set([...allOnes, ...ones])).sort((a, b) => a - b);

  return { bpm, allOnes: completeOnes };
}

// Example usage with the provided "1" beats
const ones = [5.86, 8.21, 10.62, 13.14, 48.36, 50.8, 53.36, 55.87, 87.87, 90.26, 92.73];
const result = calculateBpmAndFillOnes(ones);

console.log(`Calculated BPM: ${result.bpm.toFixed(2)}`);
console.log("All '1' beats:", result.allOnes);

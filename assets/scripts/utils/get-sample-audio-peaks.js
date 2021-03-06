export function getSampleAudioPeaks(len) {
  const samplePeaks = []

  for (let i = 0; i < 20 * len; i++) {
    samplePeaks.push(((-Math.cos(i * Math.PI * 2 / 20) * 0.9 + 1) / 2))
  }

  return samplePeaks
}

import { fft, util as fftUtil } from 'fft-js'

function getMagnitudes(channelData, start, fftSize) {
  const trueStart = start - fftSize
  let sliced = channelData.slice(Math.max(trueStart, 0), trueStart + fftSize)

  // 前が足りない場合は0で埋める
  if (trueStart < 0) {
    sliced = [...sliced]
    for (let i = 0; i < -trueStart; i++) {
      sliced.unshift(0)
    }
  }

  // 後ろが足りない場合は0で埋める
  if (sliced.length < fftSize) {
    sliced = [...sliced]
    while (sliced.length < fftSize) {
      sliced.push(0)
    }
  }

  const phasors = fft(sliced)
  const magunitudes = fftUtil.fftMag(phasors)

  return magunitudes
}

// クソデカ配列になるのであんまりおすすめできないかも
export function getFullAudioMagnitudesList(channelData, sampleRate, fps, fftSize, maxDuration) {
  const max = maxDuration
    ? Math.min(maxDuration * fps, channelData.length / sampleRate * fps)
    : channelData.length / sampleRate * fps

  const magnitudesList = []

  for (let idx = 0; idx < max; idx++) {
    magnitudesList.push(
      getMagnitudes(channelData, Math.floor((sampleRate / fps) * idx), fftSize)
    )
  }

  return magnitudesList
}

export function getFullAudioMagnitudesPeaks(peakTargetIdx ,channelData, sampleRate, fps, fftSize, maxDuration) {
  const max = maxDuration
    ? Math.min(maxDuration * fps, channelData.length / sampleRate * fps)
    : channelData.length / sampleRate * fps

  let peak = -1
  const peaks = []

  for (let idx = 0; idx < max; idx++) {
    const magnitude = getMagnitudes(channelData, Math.floor((sampleRate / fps) * idx), fftSize)[peakTargetIdx]

    peak = Math.max(magnitude, peak)
    peaks.push(magnitude)
  }

  return peaks.map((item) => item / peak)
}


export function getFullAudioMagnitudesPeaksList(peakTargetIdxList, channelData, sampleRate, fps, fftSize, maxDuration) {
  const max = maxDuration
    ? Math.min(maxDuration * fps, channelData.length / sampleRate * fps)
    : channelData.length / sampleRate * fps

  const peakList = peakTargetIdxList.map(() => -1)
  const peaksList = peakTargetIdxList.map(() => [])

  for (let idx = 0; idx < max; idx++) {
    const magnitudes = getMagnitudes(channelData, Math.floor((sampleRate / fps) * idx), fftSize)
    peakTargetIdxList.forEach((targetIdx, i) => {
      const magnitude = magnitudes[targetIdx]

      peakList[i] = Math.max(magnitude, peakList[i])
      peaksList[i].push(magnitude)
    })
  }

  return peaksList.map((peaks, i) => {
    return peaks.map((item) => item / peakList[i])
  })
}

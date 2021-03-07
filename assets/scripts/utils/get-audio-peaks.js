function getAudioPeak(array, startIndex, endIndex){
  const sliced = array.slice(startIndex, endIndex);

  // // ガチのピーク
  // let peak = -100;

  // for(let i = 0; i < sliced.length; i++){
  //     const sample = sliced[i];
  //     if(sample > peak){
  //         peak = sample;
  //     }
  // }
  // returm peak;

  // 一定期間の平均値
  return sliced.reduce((a, b) => a + Math.abs(b)) / sliced.length
}

export function getAudioPeaks(channelData, step) {
  let peak = -1;
  const peaks = [];

  for (let i = 0; i < channelData.length; i += step) {
    const sample = getAudioPeak(channelData, i, i + step)

    peak = Math.max(peak, sample);
    peaks.push(sample);
  }

  return peaks.map((item) => item / peak);
}

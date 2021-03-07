import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { getSampleAudioPeaks } from '~/assets/scripts/utils/get-sample-audio-peaks'
import { getFullAudioMagnitudesPeaksList } from '~/assets/scripts/utils/get-audio-magnitudes'

export const meta = {
  title: 'スペクトラム 6 line',
  description: '処理が重めです',
  author: 'cagpie',
  requires: {}
}

export async function generate(width, height, fps, isPreview, options) {
  const { iconImage, colorMain, colorSub, text, maxDuration } = options

  if (!iconImage) {
    return
  }

  const peaksList = await (async () => {
    if (isPreview) {
      return [
        getSampleAudioPeaks(1),
        getSampleAudioPeaks(1),
        getSampleAudioPeaks(1),
        getSampleAudioPeaks(1),
        getSampleAudioPeaks(1),
        getSampleAudioPeaks(1),
      ]
    }

    // 動画用はオーディオからpeaksを決定する
    const audioContext = new AudioContext()
    const buffer = await audioContext.decodeAudioData(options.audioArrayBuffer.slice(0, -1))

    const peaksList = getFullAudioMagnitudesPeaksList(
      [1, 2, 4, 8, 16, 32],
      buffer.getChannelData(0),
      buffer.sampleRate,
      fps,
      2 ** 8,
      maxDuration
    )

    return peaksList
  })();

  const { canvas, context } = getCanvas(width, height)
  context.font = `20px "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif`;
  context.textBaseline = "top";

  const images = [];


  // 連番画像生成
  peaksList[0].some((peak, idx) => {
    // 終了条件
    if (maxDuration && (idx / fps) >= maxDuration) {
      return true
    }

    // キャンバス初期化
    context.clearRect(0, 0, canvas.width, canvas.height)

    // 画像にしたいものを描画
    context.fillStyle = colorSub
    context.fillRect(0, 0, canvas.width, canvas.height)


    context.fillStyle = colorMain
    peaksList.forEach((peaks, j) => {
      const rectHeight = peaks[idx] * canvas.height * 0.5 + 4

      context.fillRect(
        (canvas.width / 2) - (255 / 2) + j * 45,
        (canvas.height / 2) - (rectHeight / 2),
        5,
        rectHeight
      )
    })

    if (text) {
      context.fillStyle = colorMain
      context.fillText(text, 12, 12)
    }

    // プレビュー用はCanvasのリストを返す
    if (isPreview) {
      const temp = getCanvas(width, height)
      temp.context.drawImage(canvas, 0, 0)
      images.push(temp.canvas)

      return false
    }

    // 動画用はUint8Arrayのリストを返す
    const dataUrl = canvas.toDataURL();
    const byteString = atob(dataUrl.split(',')[1]);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    images.push(buffer);

    return false
  });

  return images;
}

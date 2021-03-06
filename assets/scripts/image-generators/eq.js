import { getCanvas } from '~/assets/scripts/utils/get-canvas'

import { fft, util as fftUtil } from 'fft-js'

export const meta = {
  title: '周波数',
  description: '周波数を出すデモ\n左上に文字が入れられます(色はサブ色)',
  author: 'cagpie'
}

export async function generate(width, height, fps, isPreview, options) {
  const { colorMain, colorSub, text, maxDuration } = options

  // プレビューはなし
  if (isPreview) {
    const { canvas, context } = getCanvas(width, height)
    context.font = `42px "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif`
    context.textBaseline = "middle"
    context.textAlign = "center"

    context.fillStyle = colorSub
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = colorMain
    context.fillText('プレビューなし', width / 2, height / 2)
    return [canvas]
  }

  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(options.audioArrayBuffer.slice(0, -1))
  const channelData = audioBuffer.getChannelData(0)

  const { canvas, context } = getCanvas(width, height)
  context.font = `20px "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif`;
  context.textBaseline = "top";

  const images = [];

  for (let idx = 0, max = 1000 * channelData.length / audioBuffer.sampleRate / fps; idx < max; idx++) {
    // 終了条件
    if (maxDuration && (idx / fps) >= maxDuration) {
      break;
    }

    const start = Math.floor(idx * audioBuffer.sampleRate / fps)
    const sliced = channelData.slice(start, start + 2 ** 12)
    while (sliced.length < 2 ** 12) {
      sliced.push(0)
    }
    const phasors = fft(sliced)
    const magunitudes = fftUtil.fftMag(phasors)

    // キャンバス初期化
    context.clearRect(0, 0, canvas.width, canvas.height)

    // 画像にしたいものを描画
    context.fillStyle = colorSub
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = colorMain
    context.beginPath();
    context.moveTo(0, 3 * canvas.height / 4)
    for (let i = 0; i <= 350; i++) {
      context.lineTo(
        (canvas.width / 350) * i,
        ((1 - (magunitudes[i] / 500)) * canvas.height) * 0.5 + (canvas.height / 4)
      )
    }
    context.lineTo(canvas.width, canvas.height)
    context.lineTo(0, canvas.height)
    context.fill();

    if (text) {
      context.fillStyle = colorMain
      context.fillText(text, 12, 12)
    }

    // 動画用はUint8Arrayのリストを返す
    const dataUrl = canvas.toDataURL();
    const byteString = atob(dataUrl.split(',')[1]);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    images.push(buffer);
  }

  return images;
}

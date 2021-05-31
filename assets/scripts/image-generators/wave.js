import PicoAudio from 'pico-audio-js'

import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { prerendering, rendering, getBackgroundCanvas } from '~/assets/scripts/utils/render-pianoroll'

export const meta = {
  title: '波形',
  description: '波形です',
  author: 'cagpie',
  requires: {
    image: false,
    smf: false
  }
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

  const { canvas, context } = getCanvas(width, height)
  context.font = `20px "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif`;
  context.textBaseline = "top";

  const images = [];


  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(options.audioArrayBuffer.slice(0, -1))
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate

  const baseWaveHeight = canvas.height / 2
  const step = 4

  // 連番画像生成
  const max = Math.min(audioBuffer.duration * fps, maxDuration * fps)
  for (let idx = 0; idx < max; idx++) {
    // キャンバス初期化
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = colorSub
    context.fillRect(0, 0, canvas.width, canvas.height)

    // 波形
    context.fillStyle = colorMain
    context.strokeStyle = colorMain

    context.beginPath();

    const start = Math.floor(sampleRate * (idx / fps))

    context.moveTo(0,  baseWaveHeight + channelData[start] * 200)
    for (let i = 1; i <= canvas.width; i++) {
      context.lineTo(
        i,
        baseWaveHeight + (start + i * step < channelData.length ? channelData[start + i * step] * 200 : 0)
      )
    }
    // context.lineTo(canvas.width, canvas.height)
    // context.lineTo(0, canvas.height)
    // context.fill();
    context.stroke();

    if (text) {
      context.fillStyle = colorMain
      context.fillText(text, 12, 12)
    }

    // プレビュー用はCanvasのリストを返す
    if (isPreview) {
      const temp = getCanvas(width, height)
      temp.context.drawImage(canvas, 0, 0)
      images.push(temp.canvas)
      continue
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

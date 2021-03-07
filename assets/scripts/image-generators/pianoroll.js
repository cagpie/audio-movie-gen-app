import PicoAudio from 'pico-audio-js'

import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { prerendering, rendering, getBackgroundCanvas } from '~/assets/scripts/utils/render-pianoroll'

export const meta = {
  title: 'ピアノロール',
  description: '音声ファイルの他に、MIDIファイルが必要です\nオーディオとMIDIで頭の空白などが揃っている必要があります',
  author: 'cagpie',
  requires: {
    image: false,
    smf: true
  }
}

export async function generate(width, height, fps, isPreview, options) {
  const { colorMain, colorSub, text, smfArrayBuffer, maxDuration } = options

  if (!smfArrayBuffer) {
    return
  }

  const { canvas, context } = getCanvas(width, height)
  context.font = `20px "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif`;
  context.textBaseline = "top";

  const picoAudio = new PicoAudio()
  const parsedSmf = picoAudio.parseSMF(smfArrayBuffer)
  picoAudio.setData(parsedSmf)

  const canvasRatio = 15
  const noteHeight = 4
  const bottomMargin = 60
  const tempCanvases = prerendering(parsedSmf, canvas, {
    canvasRatio: canvasRatio,
    noteHeight: noteHeight,
    canvasBottomMargin: bottomMargin
  })

  const backgroundCanvas = getBackgroundCanvas(width, height, noteHeight, bottomMargin)

  const images = [];

  // 連番画像生成
  const max = await (async () => {
    if (!options.audioArrayBuffer) {
      return maxDuration * fps
    }

    const audioContext = new AudioContext()
    const buffer = await audioContext.decodeAudioData(options.audioArrayBuffer.slice(0, -1))

    return Math.min(buffer.duration * fps, maxDuration * fps)
  })()

  for (let idx = 0; idx < max; idx++) {
    // 終了条件
    if (maxDuration && (idx / fps) >= maxDuration) {
      break
    }

    // キャンバス初期化
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.drawImage(backgroundCanvas, 0, 0)

    rendering(
      picoAudio.getTiming(idx / fps) / canvasRatio - (canvas.width / 2),
      canvas,
      context,
      tempCanvases
    )

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

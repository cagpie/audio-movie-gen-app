import PicoAudio from 'pico-audio-js'

import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { prerendering, rendering, getBackgroundCanvas } from '~/assets/scripts/utils/render-pianoroll'

export const meta = {
  title: 'ピアノロール(画像背景)',
  description: '音声ファイルの他に、MIDIファイルが必要です\nオーディオとMIDIで頭の空白などが揃っている必要があります',
  author: 'cagpie',
  requires: {
    image: true,
    smf: true
  }
}

export async function generate(width, height, fps, isPreview, options) {
  const { colorMain, iconImage, text, smfArrayBuffer, maxDuration } = options

  if (!smfArrayBuffer || !iconImage) {
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
    canvasBottomMargin: bottomMargin,
    noLines: true
  })

  const imageHeight = iconImage.height * (canvas.width / iconImage.width)
  const imageY = (canvas.height - imageHeight) / 2

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

    context.drawImage(
      iconImage,
      0,
      imageY,
      canvas.width,
      imageHeight
    )

    rendering(
      picoAudio.getTiming(idx / fps) / canvasRatio - (canvas.width / 2),
      canvas,
      context,
      tempCanvases,
      { noLines: true }
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

import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { getFullAudioMagnitudesList } from '~/assets/scripts/utils/get-audio-magnitudes'

export const meta = {
  title: 'スペクトラム丁寧',
  description: '周波数を出すデモ\n計算処理が多くブラウザが固まるように見えますが、気長にお待ちください\n他のよりさらに重め\n高画質対応してません',
  author: 'cagpie',
  requires: {
    image: false
  }
}

export async function generate(width, height, fps, isPreview, options) {
  const { colorMain, colorSub, text, audioArrayBuffer, maxDuration } = options

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

  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer.slice(0, -1))
  const channelData = audioBuffer.getChannelData(0)

  const magnitudesList = getFullAudioMagnitudesList(channelData, audioBuffer.sampleRate, fps, 2 ** 12, maxDuration)

  const images = [];

  // 連番画像生成
  magnitudesList.some((magnitudes, idx) => {
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
    let count = 0;
    for (let i = 1, j; i <= 2 ** 11; i = j) {
      let sum = 0
      for (j = i; j < i * (Math.pow(2, 1/12)); j++) {
        sum += magnitudes[Math.floor(j)]
      }

      const height = Math.sqrt(sum) * 5 + 2
      context.fillRect(
        count * 10 + 5,
        canvas.height - height,
        5,
        height
      )

      count++;
    }

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

    return false
  })

  return images;
}

import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { getAudioPeaks } from '~/assets/scripts/utils/get-audio-peaks'
import { getSampleAudioPeaks } from '~/assets/scripts/utils/get-sample-audio-peaks'

export const meta = {
  title: '折れ線',
  description: '波形っぽいのを折れ線でだすやつです\n左上に文字が入れられます',
  author: 'cagpie',
  requires: {}
}

export async function generate(width, height, fps, isPreview, options) {
  const { colorMain, colorSub, text, maxDuration } = options

  const peaks = await (async () => {
    if (isPreview) {
      return getSampleAudioPeaks(1.1)
    }

    // 動画用はオーディオからpeaksを決定する
    const audioContext = new AudioContext()
    const buffer = await audioContext.decodeAudioData(options.audioArrayBuffer.slice(0, -1))
    return getAudioPeaks(buffer.getChannelData(0), buffer.sampleRate / fps)
  })();

  const { canvas, context } = getCanvas(width, height)
  context.font = `20px "游ゴシック体", "Hiragino Kaku Gothic ProN", sans-serif`;
  context.textBaseline = "top";

  const images = [];

  // 連番画像生成
  peaks.some((peak, idx) => {
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
    context.beginPath();
    context.moveTo(0, ((1 - peak) * canvas.height) * 0.5 + (canvas.height / 4))
    for (let i = 1; i <= 5; i++) {
      context.lineTo(
        (canvas.width / 5) * i,
        (idx - i) < 0
          ? canvas.height  * 0.5 + (canvas.height / 4)
          : ((1 - peaks[idx - i]) * canvas.height) * 0.5 + (canvas.height / 4)
      )
    }
    context.lineTo(canvas.width, canvas.height)
    context.lineTo(0, canvas.height)
    context.fill();

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

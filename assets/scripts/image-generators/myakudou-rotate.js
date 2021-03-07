import { getCanvas } from '~/assets/scripts/utils/get-canvas'
import { getAudioPeaks } from '~/assets/scripts/utils/get-audio-peaks'
import { getSampleAudioPeaks } from '~/assets/scripts/utils/get-sample-audio-peaks'

export const meta = {
  title: '脈動(回転)',
  description: '回転しながら音の強弱で画像が大小動きます\n左上に文字が入れられます(色はサブ色)',
  author: 'cagpie',
  requires: {}
}

export async function generate(width, height, fps, isPreview, options) {
  const { iconImage, colorMain, colorSub, text, maxDuration } = options

  if (!iconImage) {
    return
  }

  const peaks = await (async () => {
    if (isPreview) {
      return getSampleAudioPeaks(3)
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

  const iconRatio = (canvas.height * 1.1) / iconImage.height

  // 連番画像生成
  peaks.some((peak, idx) => {
    // 終了条件
    if (maxDuration && (idx / fps) >= maxDuration) {
      return true
    }

    // キャンバス初期化
    context.clearRect(0, 0, canvas.width, canvas.height)

    // 画像にしたいものを描画
    context.fillStyle = colorMain
    context.fillRect(0, 0, canvas.width, canvas.height)

    const iconWidth = iconImage.width * iconRatio * (0.5 + peak / 2)
    const iconHeight = iconImage.height * iconRatio * (0.5 + peak / 2)

    const iconCanvas = getCanvas(iconWidth * 2, iconHeight * 2)

    iconCanvas.context.translate(iconWidth, iconHeight)
    iconCanvas.context.rotate(idx * 1 * Math.PI / 180);
    iconCanvas.context.translate(-iconWidth, -iconHeight)

    iconCanvas.context.drawImage(
      iconImage,
      iconWidth / 2,
      iconHeight / 2,
      iconWidth,
      iconHeight
    )

    context.drawImage(
      iconCanvas.canvas,
      (canvas.width / 2) - (iconWidth / 1),
      (canvas.height / 2) - (iconHeight / 1),
      iconWidth * 2,
      iconHeight * 2
    )

    if (text) {
      context.fillStyle = colorSub
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

import { getCanvas } from '~/assets/scripts/utils/get-canvas'

const wartermarkDataUrl = 'data:image/png;base64,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'

function getImage(src) {
  return new Promise((res) => {
    const image = new Image()
    image.onload = () => {
      res(image)
    }
    image.src = src
  })
}

export async function renderEndingWatermark(buffers, len) {
  const wartermark = await getImage(wartermarkDataUrl)
  console.log(wartermark.width, wartermark.height)

  for (let i = (buffers.length - 1); i > (buffers.length - len); i--) {
    if (i < 0) {
      break
    }

    const blob = new Blob([buffers[i]], { 'type': 'image/png' })
    const url = URL.createObjectURL(blob)
    const image = await getImage(url)

    const { canvas, context } = getCanvas()
    canvas.width = image.width
    canvas.height = image.height

    context.drawImage(image, 0, 0)

    // add wartermark
    context.globalAlpha = 0.5
    context.drawImage(wartermark, canvas.width - 170, 10, 160, 40)


    // convert
    const dataUrl = canvas.toDataURL();
    const byteString = atob(dataUrl.split(',')[1]);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }

    // replace
    buffers[i] = buffer
  }
}
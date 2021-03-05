<template>
  <div class="main">
    <section class="generator">
      <div class="left-view">
        <div class="canvas">
          <canvas width="640" height="360" ref="canvas" @click="isPreviewPause=!isPreviewPause" />
        </div>
      </div>
      <div class="right-view">
        <div class="input-steps">
          <div class="step">
              <label>
              <input @change="selectImage" type="file" accept="image/*" hidden>
              <div class="button input-file" v-if="!iconImage">画像を選択</div>
              <div class="button input-file" v-else>✔︎ 画像を選択済み</div>
            </label>
          </div>
          <div class="step">
            <label>
              <input @change="selectAudio" type="file" accept="audio/*" hidden>
              <div class="button input-file" v-if="!audioArrayBuffer">音声を選択</div>
                <div class="button input-file" v-else>✔︎ 音声を選択済み</div>
            </label>
          </div>
          <div class="step">
            <textarea @input="updateComment" v-model="text" placeholder="テキストを入力" class="input-text"></textarea>
          </div>
        </div>

        <!-- <div class="step options">
          <div class="caption">オプション</div>
          <div>
            <div>
              <label>
                <input type="number" v-model="commentSize" @input="renderComment()" @change="renderComment()">
                文字サイズ
              </label>
            </div>
            <div>
              <label>
                <input type="text" v-model="fillColor" @input="renderComment()" @change="renderComment()">
                文字色
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" v-model="isStroke" @change="renderComment()">
                縁取り文字にする
              </label>
            </div>
            <div>
              <label>
                <input type="text" v-model="strokeColor" @input="renderComment()" @change="renderComment()" :disabled="!this.isStroke">
                縁取りの色
              </label>
            </div>
          </div>
        </div> -->
        <div class="generate-buttons" v-if="!isRendering">
          <div class="button save practice" @click="save(true)">
            <div>出来栄え確認</div>
          </div>
          <div class="button save" @click="save()">
            <div>動画を書き出す</div>
          </div>
        </div>
        <div class="generate-buttons" v-else>
          <div class="button save practice">
            <div>書き出し中(そこそこ時間かかります)</div>
          </div>
        </div>
      </div>
    </section>

    <modal
      name="complete-modal"
      width="680px"
      height="440px"
    >
      <div class="modal">
        <div class="modal-content">
          <p class="message">＼動画ができあがりました／</p>
          <video :src="videoSrc" width="640" height="360" controls />
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import { createFFmpeg } from '@ffmpeg/ffmpeg'

import { generateVideo } from '~/assets/scripts/cores/generate-video'

import generateImagesMyakudou from '~/assets/scripts/image-generators/myakudou'

export default {
  layout: 'default',
  data() {
    return {
      ffmpeg: null,
      isFfmpegLoaded: false,
      canvas: null,
      canvasWidth: 640,
      canvasHeight: 360,
      fps: 20,
      audioArrayBuffer: null,
      iconImage: null,
      text: '',
      videoSrc: null,
      samplePeaks: [],
      previewCanvases: [],
      isPreviewPause: false,
      isRendering: false
    }
  },
  mounted() {
    this.ffmpeg = createFFmpeg({ log: true })
    this.ffmpeg.load()
      .then(() => { this.isFfmpegLoaded = true })

    this.canvas = document.getElementsByTagName('canvas')[0]
    const context = this.canvas.getContext('2d')

    const storedIconImage = window.localStorage.getItem('iconImage')
    if (storedIconImage) {
      this.iconImage = new Image()
      this.iconImage.src = storedIconImage
    }

    for (let i = 0; i < 20; i++) {
      this.samplePeaks.push(((Math.sin(i * Math.PI * 2 / 20) * 0.9 + 1) / 2))
    }

    this.updatePreview()

    setTimeout(() => {
      const previewLoop = (counter) => {
        setTimeout(() => {
          previewLoop(++counter)
        }, 1000 / this.fps);

        if (this.isPreviewPause) {
          return
        }

        if (this.previewCanvases.length) {
          context.drawImage(
            this.previewCanvases[counter % this.previewCanvases.length],
            0,
            0
          )
        }
      }
      previewLoop(0);
    }, 1000);
  },
  methods: {
    async updatePreview() {
      this.isPreviewPause = true
      this.previewCanvases = await generateImagesMyakudou(
        this.canvasWidth,
        this.canvasHeight,
        this.fps,
        true,
        {
          peaks: this.samplePeaks,
          iconImage: this.iconImage,
          text: this.text
        }
      )
      this.isPreviewPause = false
    },
    selectAudio(e) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.audioArrayBuffer = reader.result
      }

      if (file && file.type.match('audio.*')) {
        reader.readAsArrayBuffer(file)
      }
    },
    selectImage(e) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.iconImage = new Image()
        this.iconImage.src = reader.result

        window.localStorage.setItem('iconImage', reader.result)

        this.updatePreview()
      }

      if (file && file.type.match('image.*')) {
        reader.readAsDataURL(file)
      }
    },
    updateComment() {
      this.updatePreview()
    },
    async save(isPractice) {
      if (!this.audioArrayBuffer) {
        alert('音声ファイルを選択してください')
        return
      }

      this.isPreviewPause = true
      this.isRendering = true

      const imageBuffers = await generateImagesMyakudou(
        this.canvasWidth,
        this.canvasHeight,
        this.fps,
        false,
        {
          audioArrayBuffer: this.audioArrayBuffer,
          iconImage: this.iconImage,
          text: this.text,
          maxDuration: isPractice ? 10 : 140,
        }
      )

      const video = await generateVideo(
        this.ffmpeg,
        this.fps,
        imageBuffers,
        new Uint8Array(this.audioArrayBuffer),
        isPractice ? ['-t', '10'] : ['-t', '140']
      )

      const blob = new Blob([video], { type: 'video/mp4' });
      this.videoSrc = URL.createObjectURL(blob);

      this.isPreviewPause = false
      this.isRendering = false

      this.$modal.show('complete-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  .generator {
    display: flex;

    .left-view {
      flex: 2;

      .canvas {
        background-color: #eee;
      }
    }

    .right-view {
      flex: 1;
      margin-left: 16px;

      .button {
        cursor: pointer;
        text-align: center;
        font-weight: bold;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px;
      }

      .input-steps {
        .step + .step {
          margin-top: 8px;
        }
      }

      .input-file.button {
        padding: 6px;
        color: #fff;
        border: 2px solid $bright;
        background-color: $bright;
      }

      .input-text {
        resize: none;
        outline: 0;
        appearance: none;
        width: 100%;
        height: 4em;
        padding: 0.5em;
        line-height: 1.5em;
        font-size: 16px;
        border: 2px solid $bright;
        border-radius: $border-radius;
      }

      .generate-buttons {
        display: flex;
        margin-top: 16px;

        .button.save {
          flex: 1;

          padding: 6px;

          color: #fff;
          border: 2px solid $main;
          background-color: $main;

          &.practice {
            color: $main;
            background: none;
          }

          & + .button.save {
            margin-left: 8px;
          }
        }
      }
    }

    // .options {
    //   // input[type="number"] {
    //   //   width: 5em;
    //   // }
    //   input[type="text"],
    //   input[type="number"] {
    //     font-size: 16px;
    //   }
    // }
    // .save {
    //   color: $white;
    //   background-color: $bright;
    // }
  }

  .modal {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: auto;
    align-items: center;
    justify-content: center;

    .modal-content {
      text-align: center;

      .message {
        margin-bottom: 12px;
      }
    }
  }
}


</style>

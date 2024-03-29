<template>
  <div class="main">
    <section class="generator">
      <div class="left-view">
        <div class="canvas">
          <canvas :width="canvasWidth" :height="canvasHeight" ref="canvas" @click="isPreviewPause=!isPreviewPause" />
        </div>
        <div class="description">
          <p>音声ファイルからmp4動画を生成できます → <span class="demo" @click="useDemo">デモのファイルを読み込む</span></p>
          <p>パソコンによっては画像生成中に固まる場合がありますが、しばらくお待ちいただくと解消する場合があります</p>
          <p>音質劣化する場合はaac(m4a)形式の音声ファイルでお試しください</p>
          <p>不具合がありましたら作者Twitterまでご連絡ください</p>
        </div>
        <div class="log">
          <div v-for="log in logs" :key="log">
            {{ log }}
          </div>
        </div>
      </div>
      <div class="right-view">
        <div class="input-steps">
          <div class="steps-title">▼ 動画パターン</div>
          <div class="step">
            <select v-model="imageGeneratorIdx" @change="updatePreview">
              <option v-for="(gen, idx) in imageGenerators" :value="idx" :key="idx">
                {{ gen.meta.title }}
              </option>
            </select>
            <div class="image-generator-description" v-text="imageGenerators[imageGeneratorIdx].meta.description">
            </div>
          </div>
          <div class="steps-title">▼ 使うファイル</div>
          <div class="step" v-if="imageGenerators[imageGeneratorIdx].meta.requires.smf">
            <label
              @dragover.prevent
              @drop.prevent="dropFile($event, selectMidiFile)"
            >
              <input type="file" accept="audio/midi" @change="selectMidiFile" hidden>
              <div class="button input-file" v-if="!smfArrayBuffer">MIDIファイルを選択</div>
              <div class="button input-file" v-else>✔︎ MIDIファイルを選択済み</div>
            </label>
          </div>
          <div class="step" v-if="imageGenerators[imageGeneratorIdx].meta.requires.image">
            <label
              @dragover.prevent
              @drop.prevent="dropFile($event, selectImage)"
            >
              <input type="file" accept="image/*" @change="selectImage" hidden>
              <div class="button input-file" v-if="!iconImage">画像を選択</div>
              <div class="button input-file" v-else>✔︎ 画像を選択済み</div>
            </label>
          </div>
          <div class="step">
            <label
              @dragover.prevent
              @drop.prevent="dropFile($event, selectAudio)"
            >
              <input type="file" accept="audio/*" @change="selectAudio" hidden>
              <div class="button input-file" v-if="!audioArrayBuffer">音声を選択</div>
              <div class="button input-file" v-else>✔︎ 音声を選択済み</div>
            </label>
          </div>
          <div class="steps-title">▼ オプション</div>
          <div class="step">
            <div class="key-value">
              <div class="key">メイン色</div>
              <div class="value">
                <input type="text" placeholder="#FFAA00" class="input-text" v-model="colorMain" @input="updateOftenPreview" />
                <div class="color-preview" :style="{ backgroundColor: colorMain }"></div>
              </div>
            </div>
          </div>
          <div class="step">
            <div class="key-value">
              <div class="key">サブ色</div>
              <div class="value">
                <input type="text" placeholder="#000000" class="input-text" v-model="colorSub" @input="updateOftenPreview" />
                <div class="color-preview" :style="{ backgroundColor: colorSub }"></div>
              </div>
            </div>
          </div>
          <div class="step">
            <div class="key-value">
              <div class="key">テキスト</div>
              <div class="value">
                <textarea placeholder="テキストを入力" class="input-textarea" v-model="text" @input="updateOftenPreview"></textarea>
              </div>
            </div>
          </div>
          <div class="step">
            <div class="key-value">
              <div class="key">その他</div>
              <div class="value">
                <div>
                  <div>
                    <label>
                      <input type="checkbox" v-model="isDurationLimited">
                      動画を140秒でカットする
                    </label>
                  </div>
                  <div>
                    <label>
                      <input type="checkbox" v-model="isHighFps">
                      FPSをあげる(重くなる)
                    </label>
                  </div>
                  <div>
                    <label>
                      <input type="checkbox" v-model="isHighResolution">
                      幅を大きくする(重くなる)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { imageGenerators } from '~/assets/scripts/image-generators/index'
import { renderEndingWatermark } from '~/assets/scripts/utils/render-ending-watermark'

export default {
  layout: 'default',
  data() {
    return {
      ffmpeg: null,
      isFfmpegLoaded: false,
      canvas: null,
      canvasWidth: 854,
      canvasHeight: 480,
      fps: 20,
      imageGenerators: imageGenerators,
      imageGeneratorIdx: 0,
      audioArrayBuffer: null,
      isAac: false,
      iconImage: null,
      text: '',
      colorMain: '#dddddd',
      colorSub: '#333333',
      smfArrayBuffer: null,
      videoSrc: null,
      previewTimer: null,
      previewCanvases: [],
      isPreviewPause: false,
      isRendering: false,
      isDurationLimited: true,
      isHighFps: false,
      isHighResolution: false,
      logs: []
    }
  },
  watch: {
    isHighFps() {
      this.fps = this.isHighFps ? 30 : 20
    },
    isHighResolution() {
      if (this.isHighResolution) {
        this.canvasWidth = 1068
        this.canvasHeight = 600
      } else {
        this.canvasWidth = 854
        this.canvasHeight = 480
      }
      this.updatePreview()
    }
  },
  mounted() {
    this.ffmpeg = createFFmpeg()
    this.ffmpeg.load()
      .then(() => { this.isFfmpegLoaded = true })

    this.ffmpeg.setProgress((progress) => {
      if (!(progress.ratio && progress.time)) {
        return
      }

      this.pushLog(`動画合成中 現在時点 ${ progress.time }s`)
    });

    this.canvas = document.getElementsByTagName('canvas')[0]
    const context = this.canvas.getContext('2d')

    const storedIconImage = window.localStorage.getItem('iconImage')
    if (storedIconImage) {
      this.iconImage = new Image()
      this.iconImage.src = storedIconImage
    }

    const storedColorMain = window.localStorage.getItem('colorMain')
    this.colorMain = storedColorMain || this.colorMain

    const storedColorSub = window.localStorage.getItem('colorSub')
    this.colorSub = storedColorSub || this.colorSub

    this.updatePreview()

    const previewLoop = (counter) => {
      setTimeout(() => {
        previewLoop(++counter)
      }, 1000 / this.fps);

      if (this.isPreviewPause) {
        return
      }

      if (this.previewCanvases && this.previewCanvases.length) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        context.drawImage(
          this.previewCanvases[counter % this.previewCanvases.length],
          0,
          0
        )
      }
    }
    previewLoop(0)
  },
  methods: {
    async updatePreview() {
      this.isPreviewPause = true
      this.previewCanvases = await this.imageGenerators[this.imageGeneratorIdx].generate(
        this.canvasWidth,
        this.canvasHeight,
        this.fps,
        true,
        {
          iconImage: this.iconImage,
          colorMain: this.colorMain,
          colorSub: this.colorSub,
          text: this.text,
          smfArrayBuffer: this.smfArrayBuffer,
          maxDuration: 2
        }
      )
      this.isPreviewPause = false
    },
    updateOftenPreview() {
      if (this.previewTimer) {
        window.clearTimeout(this.previewTimer)
      }

      this.previewTimer = setTimeout(async () => {
        this.updatePreview()

        window.localStorage.setItem('colorMain', this.colorMain)
        window.localStorage.setItem('colorSub', this.colorSub)
      }, 500)
    },
    selectAudio(e) {
      const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.audioArrayBuffer = reader.result

        this.updatePreview()
      }

      if (file && /^audio/.test(file.type)) {
        reader.readAsArrayBuffer(file)
        this.isAac = /(m4a|aac)/.test(file.type)
      }
    },
    selectImage(e) {
      const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.iconImage = new Image()
        this.iconImage.onload = () => {
          this.updatePreview()
        }
        this.iconImage.src = reader.result

        window.localStorage.setItem('iconImage', reader.result)
      }

      if (file && file.type.match('image.*')) {
        reader.readAsDataURL(file)
      }
    },
    selectMidiFile(e) {
      const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.smfArrayBuffer = reader.result

        this.updatePreview()
      }

      if (file && /^audio/.test(file.type)) {
        reader.readAsArrayBuffer(file)
      }
    },
    dropFile(e, func) {
      func(e)
    },
    async useDemo() {
      this.imageGeneratorIdx = 11

      const audio = await fetch('/demo.mp3')
      this.audioArrayBuffer = await audio.arrayBuffer()

      const smf = await fetch('/demo.mid')
      this.smfArrayBuffer = await smf.arrayBuffer()

      this.iconImage = new Image()
      this.iconImage.onload = () => {
        this.updatePreview()
      }
      this.iconImage.src = '/demo.png'
    },
    async save(isPractice) {
      if (!this.audioArrayBuffer) {
        alert('音声ファイルを選択してください')
        return
      }

      this.isPreviewPause = true
      this.isRendering = true

      this.pushLog('画像生成中')

      const imageBuffers = await this.imageGenerators[this.imageGeneratorIdx].generate(
        this.canvasWidth,
        this.canvasHeight,
        this.fps,
        false,
        {
          audioArrayBuffer: this.audioArrayBuffer,
          iconImage: this.iconImage,
          colorMain: this.colorMain,
          colorSub: this.colorSub,
          text: this.text,
          smfArrayBuffer: this.smfArrayBuffer,
          maxDuration: isPractice ? 10 : (this.isDurationLimited ? 140 : 480),
        }
      )

      if (!imageBuffers) {
        alert('画像生成ができませんでした(画像が選択されていないかも？)')
        return
      }

      this.pushLog('画像生成完了')

      if (!isPractice) {
        await renderEndingWatermark(imageBuffers, 3 * this.fps)
      }

      this.pushLog('動画合成中')

      const video = await generateVideo(
        this.ffmpeg,
        this.fps,
        imageBuffers,
        new Uint8Array(this.audioArrayBuffer),
        this.isAac,
        isPractice ? ['-t', '10'] : ['-t', (this.isDurationLimited ? '140' : '480')]
      )

      this.pushLog('動画合成完了')

      const blob = new Blob([video], { type: 'video/mp4' });
      this.videoSrc = URL.createObjectURL(blob);

      this.isPreviewPause = false
      this.isRendering = false

      this.$modal.show('complete-modal')
    },
    pushLog(text) {
      const date = new Date()
      this.logs.unshift(`${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() } - ${ text }`)
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
      max-width: 640px;

      .canvas {
        background-color: #eee;
        > canvas {
          display: block;
          width: 640px;
          height: 380px;
        }
      }

      .description {
        margin-top: 20px;
        .demo {
          color: $bright;
          cursor: pointer;
        }
      }

      .log {
        margin-top: 20px;
        height: 100px;
        overflow-y: scroll;
        color: #888;
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

        .steps-title {
          margin-bottom: 12px;
          font-weight: bold;
          // text-align: center;
        }

        .step + .steps-title {
          margin-top: 20px
        }

        .image-generator-description {
          margin-top: 8px;
          white-space: pre-wrap;
        }

        .key-value {
          display: flex;
          .key {
            flex: 1;
            line-height: 1.75
          }
          .value {
            flex: 3;
            display: flex;
          }
        }
      }

      .input-file.button {
        padding: 6px;
        color: #fff;
        border: 2px solid $bright;
        background-color: $bright;
      }

      .input-text {
        outline: 0;
        appearance: none;
        width: 100%;
        height: 1.75em;
        padding: 0.5em;
        line-height: 1.5em;
        font-size: 16px;
        border: 2px solid $bright;
        border-radius: $border-radius;
      }

      .color-preview {
        width: 28px;
        height: 28px;
        border-radius: 4px;
      }
      .input-text + .color-preview {
        margin-left: 8px;
      }

      .input-textarea {
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
        margin-top: 24px;

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

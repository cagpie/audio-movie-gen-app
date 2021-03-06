<template>
  <div class="app">
    <header class="app-header">
      <div>
        <nuxt-link to="/">
          <h1>Audio -> Movie Generator β</h1>
        </nuxt-link>
      </div>
      <div class="menu">
        <div class="menu-item" @click="showTermsModal">利用規約</div>
        <div class="menu-item twitter" @click="tweet">
          <i></i>Tweet
        </div>
      </div>
    </header>
    <div class="app-main">
      <div class="environment-warning" v-if="!isSupportedEnvironment">
        <p>ご利用の環境ではこのサービスが正常に動作しない可能性があります。</p>
        <p>Windows または Mac の Google Chrome が推奨環境です。</p>
      </div>
      <nuxt />
    </div>
    <footer class="app-footer">
      <div class="footer-item">
        ©︎ 2021 Audio -> Movie Generator
      </div>
      <div class="footer-item">
        <a href="https://twitter.com/cagpie" target="_blank">Twitter (@cagpie)</a>
      </div>
      <div class="footer-item">
        <a href="https://github.com/cagpie/audio-movie-gen-app" target="_blank">GitHub (cagpie/audio-movie-gen-app)</a>
      </div>
    </footer>
    <modal name="terms-modal">
      <terms-modal />
    </modal>
  </div>
</template>

<script>
import { UAParser } from 'ua-parser-js';

import TermsModal from '~/components/TermsModal.vue'

export default {
  components: {
    TermsModal
  },
  data() {
    return {
      isSupportedEnvironment: false
    }
  },
  mounted() {
    const ua = new UAParser()
    if (
      ua.getBrowser().name.includes('Chrome') &&
      (
        ua.getOS().name.includes('Mac') ||
        ua.getOS().name.includes('Windows')
      )
    ) {
      this.isSupportedEnvironment = true
    }
  },
  methods: {
    showTermsModal () {
      this.$modal.show('terms-modal')
    },
    tweet () {
      const baseUrl = 'https://twitter.com/intent/tweet?';
      const text = ['text', 'Audio -> Movie Generator | 音声ファイルをmp4動画化するWebサービス'];
      const url = ['url', 'https://audio-movie-gen.app'];
      const query = new URLSearchParams([text, url]).toString();
      const shareUrl = `${baseUrl}${query}`;

      window.open(shareUrl, '_blank');
    }
  }
}
</script>

<style lang="scss" scoped>
.app {
  justify-content: center;
  width: 1000px;
  color: $dark;

  .app-header {
    display: flex;
    top: 0;
    width: inherit;
    height: 80px;
    align-items: center;
    justify-content: space-between;

    h1 {
      color: $dark;
    }

    a {
      color: $bright;
      text-decoration: none;
    }

    .menu {
      display: flex;
      align-items: center;
      .menu-item {
        color: $bright;
        cursor: pointer;

        & + .menu-item {
          margin-left: 1em;
        }
      }
    }
  }

  .app-main {
    width: 100%;
    min-height: calc(100vh - 130px);
    padding-bottom: 16px;
    z-index: 1;
    a {
      color: $bright;
      text-decoration: none;
    }

    .environment-warning {
      padding-bottom: 24px;
      text-align: center;
      color: #f00;
      font-weight: bold;
    }
  }

  .app-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;

    a {
      color: $bright;
      text-decoration: none;
    }

    .footer-item + .footer-item {
      margin-left: 20px;
    }
  }
}

.twitter {
  padding: 3px 6px;
  font-size: 14px;
  font-weight: bold;
  color: #fff !important;
  background-color: #1da1f2;
  border-radius: 3px;
  i {
    position: relative;
    top: 2px;
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    background: transparent 0 0 no-repeat;
    background-image: $twitter-image;
  }
}
</style>

<template>
  <div class="app">
    <header class="app-header">
      <div>
        <nuxt-link to="/">
          <h1>Audio -> Movie Generator</h1>
        </nuxt-link>
      </div>
      <div class="menu">
        <div class="menu-item" @click="showTermsModal">利用規約</div>
        <div class="menu-item twitter" @click="tweet">
          <i></i>ツイートする
        </div>
      </div>
    </header>
    <div class="app-main">
      <nuxt />
    </div>
    <modal
      name="terms-modal"
    >
      <terms-modal />
    </modal>
  </div>
</template>

<script>
import TermsModal from '~/components/TermsModal.vue'

export default {
  components: {
    TermsModal
  },
  methods: {
    showTermsModal () {
      this.$modal.show('terms-modal')
    },
    tweet () {
      const baseUrl = 'https://twitter.com/intent/tweet?';
      const text = ['text', 'Audio -> Moview Generator | 音声ファイルをmp4動画化するWebアプリ'];
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
    margin-top: 16px;
    z-index: 1;
    a {
      color: $bright;
      text-decoration: none;
    }
  }
}

.twitter {
  padding: 3px 6px;
  font-size: 14px;
  color: #fff !important;
  background-color: #1da1f2;
  border-radius: 3px;
  i {
    position: relative;
    top: 2px;
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 2px;
    background: transparent 0 0 no-repeat;
    background-image: $twitter-image;
  }
}
</style>

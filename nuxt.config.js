
module.exports = {
  // mode: 'universal',
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Audio -> Movie Generator',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: '音声ファイルからmp4動画を生成するやつ' },
      { property: 'og:site_name', content: 'Audio -> Movie Generator' },
      { property: 'og:title', content: 'Audio -> Movie Generator' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://audio-movie-gen.app' },
      { property: 'og:description', content: '音声ファイルからmp4動画を生成するやつ' },
      { property: 'og:image', content: 'https://audio-movie-gen.app/icon.png' },
      { name: 'twitter:card', content: 'summary' },
      { 'http-equiv': 'origin-trial', content: 'AlMI0MgnlaqjAnQFpvYBVgjQKiMmybrlty5CIjQ1Fs8GwjvK4Qw75q03CVOqFXzzjh43Imf9z7bo7D4/TOjkqQAAAABqeyJvcmlnaW4iOiJodHRwczovL2F1ZGlvLW1vdmllLWdlbi5hcHA6NDQzIi' }
    ],
    script: [
    ],
    link: [
       { rel: 'icon', type: 'image/x-icon', href: '/icon.png' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    { src: '~/assets/styles/valiable.scss', lang: 'scss' }
  ],
  styleResources: {
    scss: ['~/assets/styles/valiable.scss']
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/main'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    [
      '@nuxtjs/google-gtag',
      {
        id: 'G-JJPDCM10ZW',
        debug: true
      }
    ]
  ],
  debug: {
    enabled: true,
    sendHitTask: true
  },
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/style-resources'
  ],
  /*
  ** Build configuration
  */
  build: {
    // hardSource: true,
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}

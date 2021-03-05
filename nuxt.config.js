
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
      { property: 'og:title', content: 'Audio -> Movie GeneratorZ' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://audio-movie-gen.app' },
      { property: 'og:description', content: '音声ファイルからmp4動画を生成するやつ' },
      { property: 'og:image', content: 'https://audio-movie-gen.app' },
      { name: 'twitter:card', content: 'summary' }
    ],
    script: [],
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
    ['@nuxtjs/google-analytics', {
      id: 'G-NQ6EHBTJ1G'
    }]
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

# audio-movie-gen-app

Webだけで音声ファイルからmp4動画を生成するものです。  
https://audio-movie-gen.app

このサービスの核の部分は [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) を利用しています。  
[ffmpeg](https://ffmpeg.org/) および [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) に感謝を🙏


## 動画テンプレートの追加の仕方

クライアントサイドで完結しているプロジェクトなので手元ですぐに動かすことができます。  
また、動画テンプレートの追加も、ページ機能と分離して作っているので容易に行えます。  
動画テンプレート追加のプルリクエストはお待ちしています(僕が手を入れる可能性はありますが)  

詳しくは下記を参照してください。
https://github.com/cagpie/audio-movie-gen-app/wiki/%E5%8B%95%E7%94%BB%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9

## Build Setup

(initしたときから編集してません)  

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

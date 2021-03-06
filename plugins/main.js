import Vue from 'vue'

import VModal from 'vue-js-modal'
//import VModal from 'vue-js-modal/dist/ssr.index.js'
Vue.use(VModal)

import { ColorPicker } from 'vue-color-gradient-picker'
import 'vue-color-gradient-picker/dist/index.css'
Vue.component('ColorPicker', ColorPicker)
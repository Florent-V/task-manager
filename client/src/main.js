import './assets/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { cropText } from '@/utils/crop.js';

import { OhVueIcon, addIcons } from "oh-vue-icons";
import * as MdIcons from "oh-vue-icons/icons/md";
import * as FaIcons from "oh-vue-icons/icons/fa";

const Fa = Object.values({ ...FaIcons });
const Md = Object.values({ ...MdIcons });

addIcons(...Fa);
addIcons(...Md);

const app = createApp(App)

app.config.globalProperties.$cropText = cropText;
app.component("v-icon", OhVueIcon);
app.use(createPinia())
app.use(router)
app.mount('#app')

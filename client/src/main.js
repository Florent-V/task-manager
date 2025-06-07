import './assets/index.css'
import './assets/quilljs.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { MdClose,
  MdDelete,
  MdAdd,
  MdPhotocamera,
  MdPhotocameraRound,
  MdRemoveredeye,
  MdShareOutlined,
  MdCheckboxOutlined,
  MdCheckboxoutlineblank,
  FaMinus,
  FaPlus,
  FaEdit,
  FaRegularTrashAlt,
  FaRegularCheckSquare,
  BiThreeDotsVertical,
  MdExittoappRound,
  MdModeedit,
} from "oh-vue-icons/icons";

import { cropText } from '@/utils/crop.js';

import App from './App.vue'
import router from './router'


addIcons(MdClose,
  MdDelete,
  MdAdd,
  MdPhotocamera,
  MdPhotocameraRound,
  MdRemoveredeye,
  MdShareOutlined,
  MdCheckboxOutlined,
  MdCheckboxoutlineblank,
  FaMinus,
  FaPlus,
  FaEdit,
  FaRegularTrashAlt,
  FaRegularCheckSquare,
  BiThreeDotsVertical,
  MdExittoappRound,
  MdModeedit,
);

const app = createApp(App)

app.config.globalProperties.$cropText = cropText;
app.component("VIcon", OhVueIcon);
app.use(createPinia())
app.use(router)
app.mount('#app')

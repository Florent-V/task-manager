import './assets/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { cropText } from '@/utils/crop.js';

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
  BiThreeDotsVertical
} from "oh-vue-icons/icons";

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
  BiThreeDotsVertical
);

const app = createApp(App)

app.config.globalProperties.$cropText = cropText;
app.component("v-icon", OhVueIcon);
app.use(createPinia())
app.use(router)
app.mount('#app')

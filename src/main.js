import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import Toast from 'vue-toastification';
import { createPinia } from "pinia";
import 'vue-toastification/dist/index.css';


createApp(App)
    .use(router)
    .use(createPinia())
    .use(Toast)
    .mount('#app')

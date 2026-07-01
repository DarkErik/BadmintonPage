// npm install -D tailwindcss@3
// npm install @floating-ui/vue
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from "pinia"
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

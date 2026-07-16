import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Mobil tarayıcı üst/alt çubuklarını grafit yap (tema ile uyumlu)
function applyThemeColor() {
  const color = '#0a0c11'
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = color
}
applyThemeColor()

createApp(App).mount('#app')

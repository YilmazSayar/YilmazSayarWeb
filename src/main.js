import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Mobil tarayıcı üst/alt çubuklarını siyah yap (Transfermarkt tarzı)
function applyThemeColor() {
  const color = '#000000'
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

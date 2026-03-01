import 'uno.css'
import 'element-plus/dist/index.css'
import 'element-plus/dist/index.css'

import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

async function initApp() {
  // For redirect test page: call getRedirectResult() immediately on load, before any Vue/auth state.
  // This avoids getRedirectResult() returning null due to premature call or mixed popup/redirect.
  if (window.location.pathname === '/test-redirect') {
    const { getRedirectResultToken } = await import('./services/firebase-auth')
    await getRedirectResultToken()
  }

  const app = createApp(App)
  app.use(router)
  app.use(ElementPlus)
  app.mount('#app')
}

initApp()

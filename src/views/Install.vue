<template>
  <div class="install-page">
    <div class="app-header">
      <h1>Install DWG Viewer for Google Drive™</h1>
      <div class="header-actions">
        <router-link to="/home" class="header-link">Home</router-link>
      </div>
    </div>

    <div class="install-content">
      <p class="intro">
        Add <strong>DWG Viewer</strong> to your Google Drive™ so you can open DWG and DXF files directly from Drive.
      </p>

      <section class="explanation">
        <h2>What happens when you install</h2>
        <p>
          After you authorize the app, <strong>DWG Viewer</strong> will appear in the <strong>Open with</strong> menu
          when you right‑click a DWG or DXF file (or use the “⋮” menu on the file) in Google Drive™. You can then
          open drawings in the viewer with one click.
        </p>
      </section>

      <section v-if="installed" class="status-section installed">
        <h2>✓ Installed</h2>
        <p>
          DWG Viewer is connected to your Google account. When you go to
          <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Google Drive™</a>,
          right‑click any DWG or DXF file and choose <strong>Open with</strong> → <strong>DWG Viewer</strong> to open it here.
        </p>
        <router-link to="/home" class="btn btn-secondary">Go to Home</router-link>
      </section>

      <section v-else class="action-section">
        <p class="action-intro">
          Click the button below to authorize the app with your Google account. You will be redirected to Google to sign in and grant access; when you return here, the app will be installed.
        </p>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading"
          @click="startInstall"
        >
          {{ loading ? 'Redirecting…' : 'Install' }}
        </button>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </section>

      <section class="trademark-notice">
        <p>Google Drive™ is a trademark of Google LLC.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getRedirectResultToken,
  signInWithRedirectFlow
} from '../services/firebase-auth'

const installed = ref(false)
const loading = ref(false)
const error = ref('')

const TOKEN_KEY = 'google_drive_token'

async function checkRedirectResult() {
  try {
    const payload = await getRedirectResultToken()
    if (payload) {
      const tokenData = {
        access_token: payload.access_token,
        expires_in: payload.expires_in,
        scope: payload.scope,
        token_type: payload.token_type || 'Bearer',
        saved_at: Date.now()
      }
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData))
      installed.value = true
    }
  } catch (e) {
    console.error('Install: failed to get redirect result', e)
    error.value = 'Authorization could not be completed. Please try again.'
  }
}

async function startInstall() {
  error.value = ''
  loading.value = true
  try {
    const forceConsent = true;
    await signInWithRedirectFlow(forceConsent)
    // Redirecting away; code below may not run
  } catch (e) {
    console.error('Install: redirect failed', e)
    error.value = 'Install could not start. Check that the app is configured correctly (Firebase settings).'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkRedirectResult()
})
</script>

<style scoped>
.install-page {
  min-height: calc(100vh - var(--footer-height, 50px));
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.app-header .header-actions {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-link {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.95;
}

.header-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.install-content {
  max-width: 800px;
  margin: 24px auto 32px;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px 48px;
}

.intro {
  margin: 0 0 24px 0;
  line-height: 1.6;
  color: #333;
}

section {
  margin-bottom: 32px;
}

section:last-child {
  margin-bottom: 0;
}

h2 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.explanation p,
.action-intro {
  margin: 0 0 16px 0;
  line-height: 1.6;
  color: #555;
}

.status-section.installed h2 {
  color: #2e7d32;
  border-bottom-color: #2e7d32;
}

.action-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: background-color 0.2s, opacity 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd6;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.error-msg {
  margin-top: 12px;
  color: #c62828;
  font-size: 0.95rem;
}

.trademark-notice p {
  font-size: 12px;
  color: #999;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

a {
  color: #409EFF;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .install-content {
    margin-left: 12px;
    margin-right: 12px;
    padding: 24px 20px;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }

  h2 {
    font-size: 1.1rem;
  }
}
</style>

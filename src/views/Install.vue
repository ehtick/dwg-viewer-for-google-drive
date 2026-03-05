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

      <!-- Recommended: Marketplace -->
      <section class="marketplace-section">
        <h2>Install from Google Workspace Marketplace <span class="badge-recommended">Recommended</span></h2>
        <p>
          DWG Viewer is published on the Google Workspace Marketplace. Installing from there is the simplest and most
          reliable way — your authorization is saved to your Google account and persists across sessions.
        </p>
        <a
          href="https://workspace.google.com/marketplace/app/dwg_viewer/641533811831"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-marketplace"
        >
          Install from Google Workspace Marketplace →
        </a>
        <p class="marketplace-note">
          After installing from Marketplace, right‑click any DWG or DXF file in
          <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Google Drive™</a>
          and choose <strong>Open with</strong> → <strong>DWG Viewer</strong>.
        </p>
      </section>

      <div class="divider">
        <span>or</span>
      </div>

      <!-- Alternative: manual auth -->
      <section class="explanation">
        <h2>Authorize directly (for testing / development)</h2>
        <p>
          If you cannot access the Marketplace, you can authorize the app manually below.
          Note that this authorization is only stored in your current browser and will expire after about one hour.
        </p>
        <p>
          After authorization, <strong>DWG Viewer</strong> will appear in the <strong>Open with</strong> menu in Google Drive™.
          Your permissions can be viewed or revoked at any time from your
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account permissions</a> page.
        </p>
      </section>

      <section v-if="installed" class="status-section installed">
        <h2>✓ Authorized</h2>
        <p>
          DWG Viewer is connected to your Google account. Go to
          <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Google Drive™</a>,
          right‑click any DWG or DXF file and choose <strong>Open with</strong> → <strong>DWG Viewer</strong>.
        </p>
        <p class="refresh-tip">
          <strong>Tip:</strong> If Drive is already open in another tab, refresh it so DWG Viewer appears in the <strong>Open with</strong> menu.
        </p>
        <router-link to="/home" class="btn btn-secondary">Go to Home</router-link>
      </section>

      <section v-else class="action-section">
        <button
          type="button"
          class="btn btn-manual"
          :disabled="loading"
          @click="startInstall"
        >
          {{ loading ? 'Opening sign-in…' : 'Authorize manually' }}
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
import { onMounted, ref, watch } from 'vue'
import { useGoogleDrive } from '../composables/useGoogleDrive'

const { isAuthenticated, authenticate, tryRestoreAuth } = useGoogleDrive()

const installed = ref(false)
const loading = ref(false)
const error = ref('')
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

watch(isAuthenticated, (val) => {
  if (val) {
    installed.value = true
    loading.value = false
    if (loadingTimeout != null) {
      window.clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
  }
})

async function startInstall() {
  error.value = ''
  loading.value = true
  loadingTimeout = window.setTimeout(() => {
    loading.value = false
    loadingTimeout = null
  }, 120000)
  try {
    await authenticate(true)
  } catch (e) {
    console.error('Install: auth failed', e)
    error.value = 'Authorization could not start. Check that the app is configured (e.g. VITE_GOOGLE_CLIENT_ID).'
    loading.value = false
    if (loadingTimeout) {
      window.clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
  }
}

onMounted(async () => {
  await tryRestoreAuth()
  if (isAuthenticated.value) {
    installed.value = true
  }
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
  margin-bottom: 28px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Marketplace section */
.marketplace-section {
  background: #f5f7ff;
  border: 1.5px solid #667eea;
  border-radius: 10px;
  padding: 24px 28px;
  margin-bottom: 0;
}

.marketplace-section h2 {
  border-bottom-color: #667eea;
}

.badge-recommended {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: #667eea;
  color: white;
  border-radius: 20px;
  padding: 3px 10px;
  vertical-align: middle;
}

.marketplace-section p {
  margin: 0 0 16px 0;
  line-height: 1.6;
  color: #555;
}

.marketplace-note {
  margin-top: 14px !important;
  font-size: 0.92rem;
  color: #666 !important;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 28px 0;
  color: #aaa;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 14px;
}

/* Explanation section (muted) */
.explanation {
  opacity: 0.85;
}

.explanation h2 {
  border-bottom-color: #ccc;
  color: #666;
  font-size: 1.05rem;
}

.explanation p {
  margin: 0 0 14px 0;
  line-height: 1.6;
  color: #777;
  font-size: 0.95rem;
}

.status-section.installed h2 {
  color: #2e7d32;
  border-bottom-color: #2e7d32;
}

.refresh-tip {
  margin: 16px 0 0 0;
  padding: 12px 14px;
  background: #f0f7f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2e7d32;
}

.action-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Buttons */
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

.btn-marketplace {
  background: #667eea;
  color: white;
  font-size: 1rem;
}

.btn-marketplace:hover {
  background: #5a6fd6;
  text-decoration: none;
  color: white;
}

.btn-manual {
  background: transparent;
  color: #888;
  border: 1.5px solid #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 9px 18px;
}

.btn-manual:hover:not(:disabled) {
  border-color: #aaa;
  color: #555;
}

.btn-manual:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  margin-top: 16px;
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
    font-size: 1.05rem;
  }
}
</style>

<template>
  <div class="home-view">
    <div class="app-header">
      <h1>DWG Viewer</h1>
      <div class="header-actions">
        <router-link to="/home" class="header-link">Home</router-link>
        <router-link to="/local-file" class="header-link">View local files</router-link>
      </div>
    </div>

    <div class="app-content">
      <div class="standard-mode">
        <div v-if="loadingMessage" class="loading-indicator">
          <el-icon class="loading-icon" size="24"><Loading /></el-icon>
          <span>{{ loadingMessage }}</span>
        </div>

        <div v-if="!isAuthenticated" class="sign-in-prompt">
          <p class="sign-in-message">You need to be signed in to access this file.</p>
          <el-button type="primary" size="large" :loading="isLoading" :disabled="isRestoringAuth" @click="handleSignIn">
            Sign in with Google
          </el-button>
        </div>

        <div v-if="fileLoadError" class="error-indicator">
          <el-icon class="error-icon" size="24"><Warning /></el-icon>
          <span>{{ fileLoadError }}</span>
        </div>

        <div class="viewer-container">
          <div class="sidebar">
            <div class="app-purpose-section">
              <h2 class="purpose-title">About this application</h2>
              <p class="purpose-text">
                <strong>DWG Viewer</strong> is a web application that lets you <strong>view DWG and DXF CAD drawing files</strong> stored in your Google Drive™ without downloading them or installing desktop software.
              </p>
              <p class="purpose-text">
                We use Google Drive™ access only to <strong>open the files you choose</strong> via “Open with” in Google Drive™. We do not access, store, or process your files beyond displaying them in the viewer.
              </p>
            </div>

            <div v-if="currentFile || fileId" class="file-info-wrapper">
              <el-card class="file-info-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Document /></el-icon>
                    <span>File info</span>
                  </div>
                </template>
                <div class="file-info-content">
                  <div v-if="currentFile?.name" class="file-info-row" :title="currentFile?.id || fileId || undefined">
                    <span class="file-info-label">name</span><span class="file-info-value">{{ currentFile.name }}</span>
                  </div>
                  <div v-if="currentFile?.size" class="file-info-row"><span class="file-info-label">size</span><span class="file-info-value">{{ formatFileSize(currentFile.size) }}</span></div>
                  <div v-if="currentFile?.mimeType" class="file-info-row"><span class="file-info-label">mimeType</span><span class="file-info-value">{{ currentFile.mimeType }}</span></div>
                  <div v-if="currentFile?.lastEditedUtc" class="file-info-row"><span class="file-info-label">lastEditedUtc</span><span class="file-info-value">{{ currentFile.lastEditedUtc }}</span></div>
                </div>
              </el-card>
            </div>
          </div>

          <div class="viewer-main">
            <div class="cad-viewer">
              <div
                id="viewer-container"
                ref="viewerContainer"
                class="x-viewer-wrapper"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Loading, Warning } from '@element-plus/icons-vue'
import { Model2dConfig, Viewer2d, Viewer2dConfig } from '@x-viewer/core'
import {
  AxisGizmoPlugin,
  BottomBarPlugin,
  LayerManagerPlugin,
  MarkupPlugin,
  MeasurementPlugin,
  ScreenshotPlugin,
  Settings2dPlugin,
  ToolbarMenuId,
  Viewer2dToolbarPlugin
} from '@x-viewer/plugins'
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import { useGoogleDrive } from '../composables/useGoogleDrive'

const route = useRoute()

const {
  isAuthenticated,
  tryRestoreAuth,
  currentFile,
  getFileContent,
  getFileDetails,
  authenticate,
} = useGoogleDrive()

const fileUrl = ref<string>('')
const isLoading = ref(false)
const isRestoringAuth = ref(true) // it will try to restore auth in onMounted() and update to false when done
const viewerContainer = ref<HTMLElement | null>(null)
const viewer = ref<Viewer2d | null>(null)
const layerManagerPlugin = ref<LayerManagerPlugin | null>(null)
const fileLoadError = ref<string>('')

// Resolved once in onMounted from ?fileId=xxx or Google Drive's ?state={"ids":["xxx"]}
const fileId = ref<string | null>(null)

async function handleSignIn() {
  isLoading.value = true
  await authenticate(false)
  isLoading.value = false
}

function parseFileIdFromQuery(): string {
  // Simple param written by us on previous visit
  const simple = route.query.fileId
  if (simple && typeof simple === 'string') return simple

  // Google Drive "Open with" format: state={"ids":["xxx"],...}
  const stateParam = route.query.state
  if (!stateParam || typeof stateParam !== 'string') return ''
  try {
    const state = JSON.parse(decodeURIComponent(stateParam))
    if (state?.ids?.[0]) return state.ids[0]
  } catch {
    try {
      const state = JSON.parse(stateParam)
      if (state?.ids?.[0]) return state.ids[0]
    } catch { /* ignore */ }
  }
  return ''
}

const loadingMessage = computed(() => {
  if (!fileId.value) return ''
  if (fileUrl.value) return ''
  if (isLoading.value) return 'Signing in with Google…'
  if (isAuthenticated.value) return 'Downloading file…'
  return ''
})

const formatFileSize = (sizeStr: string) => {
  const bytes = parseInt(sizeStr, 10)
  if (Number.isNaN(bytes)) {
    return sizeStr
  }
  const kb = bytes / 1024
  if (kb >= 1024) {
    const mb = kb / 1024
    return `${mb.toFixed(2)} MB`
  }
  return `${kb.toFixed(2)} KB`
}

const cleanupBlobUrl = () => {
  if (fileUrl.value && fileUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(fileUrl.value)
  }
}

const cleanupViewer = () => {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
}

const loadFileAsBlob = async (fileId: string) => {
  fileLoadError.value = ''
  try {
    const fileContent = await getFileContent(fileId)
    const blob = new Blob([fileContent])
    const blobUrl = URL.createObjectURL(blob)
    fileUrl.value = blobUrl
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch file'
    fileLoadError.value = errorMessage.includes('FILE_OPEN_WITH_REQUIRED')
      ? 'This file must be opened via "Open with" in Google Drive™ to view with current permissions.'
      : `Error getting file content: ${errorMessage}`
  }
}

const initViewer = async () => {
  if (!viewerContainer.value) return
  if (viewer.value) return

  try {
    const language = 'en'
    const viewerCfg = {
      containerId: 'viewer-container',
      language,
      enableSpinner: true,
      enableProgressBar: true,
      enableLayoutBar: true,
      enableLocalCache: false,
    } as Viewer2dConfig
    const viewerInstance: Viewer2d = new Viewer2d(viewerCfg)

    const fontFiles = ["libs/fonts/simplex.shx", "libs/fonts/hztxt.shx", "libs/fonts/arial.ttf", "libs/fonts/Microsoft_YaHei.ttf"]
    await viewerInstance.setFont(fontFiles)

    new AxisGizmoPlugin(viewerInstance as any, { ignoreZAxis: true })
    new BottomBarPlugin(viewerInstance as any)
    const layerManager = new LayerManagerPlugin(viewerInstance as any, { containerId: 'viewer-container', visible: false })
    layerManagerPlugin.value = layerManager
    new MarkupPlugin(viewerInstance as any)
    new MeasurementPlugin(viewerInstance as any, { language })
    new ScreenshotPlugin(viewerInstance as any)
    new Settings2dPlugin(viewerInstance as any, { language, visible: false, containerId: 'viewer-container' })

    const menuConfig = {
      [ToolbarMenuId.Layers]: {
        onActive: () => {
          if (layerManagerPlugin.value) {
            layerManagerPlugin.value.setVisible(true)
          }
        },
        onDeactive: () => {
          if (layerManagerPlugin.value) {
            layerManagerPlugin.value.setVisible(false)
          }
        },
        mutexIds: []
      },
      [ToolbarMenuId.Markup]: {
        visible: false
      },
      [ToolbarMenuId.MarkupVisibility]: {
        visible: false
      },
      [ToolbarMenuId.Settings]: {
        visible: false
      }
    }

    new Viewer2dToolbarPlugin(viewerInstance as any, { menuConfig, language })

    viewer.value = viewerInstance
  } catch (error) {
    console.error('Error initializing viewer:', error)
  }
}

// Load model into viewer. Only after auth and file request succeeded (fileUrl and currentFile set).
const loadModel = async () => {
  if (!viewer.value || !fileUrl.value) return
  try {
    const modelCfg = {
      modelId: currentFile.value?.name || 'model_1',
      src: fileUrl.value,
      merge: true,
    } as Model2dConfig
    viewer.value.loadModel(modelCfg)
  } catch (e) {
    console.error('Error loading model:', e)
  }
}

watch([fileUrl, viewerContainer, viewer], async ([url, container, v]) => {
  if (!url || !container || !currentFile.value || !v) return
  await nextTick()
  await loadModel()
}, { immediate: true })

watch(currentFile, async (file) => {
  if (file) {
    fileLoadError.value = ''
    cleanupBlobUrl()
    fileUrl.value = ''
    await loadFileAsBlob(file.id)
  }
}, { immediate: true })

watch(isAuthenticated, async (authenticated) => {
  if (!authenticated) return
  if (!fileId.value) {
    const resolvedId = parseFileIdFromQuery()
    if (!resolvedId) {
      fileLoadError.value = 'No valid file ID provided. Open a file from Google Drive via "Open with" to view it here.'
      return
    }
    fileId.value = resolvedId
  }
  const details = await getFileDetails(fileId.value)
  currentFile.value = details ?? { id: fileId.value, name: '', size: '', lastEditedUtc: '', mimeType: '', url: '' }
}, { immediate: true })

onMounted(async () => {
  // isRestoringAuth.value = true
  try {
    // Resolve fileId once from URL (?fileId=xxx or ?state={"ids":["xxx"]}).
    const resolvedId = parseFileIdFromQuery()
    if (!resolvedId) {
      fileLoadError.value = 'No valid file ID provided. Open a file from Google Drive via "Open with" to view it here.'
    }
    fileId.value = resolvedId

    // Normalise URL to ?fileId=xxx so the page is bookmarkable and refresh-safe. 
    // E.g., below url will be normalized to the latter one.
    // http://localhost:5173/?state={%22ids%22:[%2211YGgbQBr6vkuBh3NEVbyYSA4xkcIvdgU%22],%22action%22:%22open%22,%22userId%22:%22100191952719869236324%22,%22resourceKeys%22:{}}&iss=https://accounts.google.com&code=4/0AfrIepAS1pk_9GGajJJgFUDTOZQh3nCN7tHSsDKs2VwKcgofK1p3iOF0TtOnKLlvPZv5TQ&scope=https://www.googleapis.com/auth/drive.file
    // http://localhost:5173/?fileId=11YGgbQBr6vkuBh3NEVbyYSA4xkcIvdgU
    // history.replaceState does not trigger Vue Router, so route.query is unaffected.
    window.history.replaceState(null, '', `${window.location.pathname}?fileId=${encodeURIComponent(resolvedId)}`)

    await nextTick()
    await initViewer()

    // Restore token from localStorage. If still not authenticated after this,
    // needsSignIn becomes true and the template shows the sign-in button.
    // authenticate() must be called from a user click so the browser allows the popup.
    await tryRestoreAuth()
  } catch (error) {
    console.error('Error restoring auth:', error)
  } finally {
    isRestoringAuth.value = false
  }
})

onUnmounted(() => {
  cleanupViewer()
  cleanupBlobUrl()
})
</script>

<style scoped>
.home-view {
  height: 100%;
  min-height: calc(100vh - var(--footer-height, 50px));
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
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

.app-content {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-icon {
  color: #409EFF;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.standard-mode {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  font-size: 16px;
  color: #409EFF;
  z-index: 100;
  pointer-events: none;
  font-weight: 500;
}

.error-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  font-size: 14px;
  color: #F56C6C;
  z-index: 100;
  pointer-events: none;
  font-weight: 500;
}

.error-icon {
  color: #F56C6C;
  animation: none;
}

.sign-in-prompt {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: rgba(255, 255, 255, 1);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 100;
}

.sign-in-message {
  color: rgb(107 114 128);
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}


.viewer-container {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 20px;
  width: 100%;
  background: white;
  padding-right: 2px;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 0;
}

.sidebar {
  width: 400px;
  border-right: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  position: relative;
  min-height: 0;
}

.app-purpose-section {
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.purpose-title {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.purpose-text {
  margin: 0 0 8px 0;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
}

.purpose-text:last-child {
  margin-bottom: 0;
}

.file-info-wrapper {
  flex-shrink: 0;
}

.file-info-card {
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  border: none;
  border-bottom: 1px solid #e4e7ed;
}

.file-info-card :deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.file-info-card :deep(.el-card__body) {
  padding: 12px 20px 20px 20px;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.file-info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.file-info-row {
  display: flex;
  gap: 8px;
  word-break: break-all;
}

.file-info-label {
  flex-shrink: 0;
  font-weight: 600;
  color: #606266;
  min-width: 5em;
}

.file-info-value {
  color: #303133;
  min-width: 0;
}

.viewer-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.cad-viewer {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.cad-viewer .x-viewer-wrapper {
  width: 100%;
  height: 100%;
}

@media (max-width: 1024px) {
  .viewer-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
    max-height: 50vh;
  }
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.2rem;
  }

  .app-content {
    padding: 0;
  }

  .viewer-container {
    margin: 0;
    border-radius: 0;
  }

  .sidebar {
    max-height: 40vh;
  }
}
</style>

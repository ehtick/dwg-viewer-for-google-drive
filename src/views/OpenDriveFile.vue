<template>
  <div class="home-view">
    <div class="app-header">
      <h1>DWG Viewer</h1>
      <div class="header-actions">
        <router-link to="/privacy" class="header-link">Privacy</router-link>
        <router-link to="/terms" class="header-link">Terms</router-link>
        <router-link to="/local-file">
          <el-button type="primary" text>
            View local files
          </el-button>
        </router-link>
      </div>
    </div>

    <div class="app-content">
      <div class="standard-mode">
        <!-- Loading indicator below header, centered -->
        <div v-if="isLoading" class="loading-indicator">
          <el-icon class="loading-icon" size="24"><Loading /></el-icon>
          <span>Loading...</span>
        </div>

        <!-- Error indicator below header, centered -->
        <div v-if="fileLoadError" class="error-indicator">
          <el-icon class="error-icon" size="24"><Warning /></el-icon>
          <span>{{ fileLoadError }}</span>
        </div>

        <div class="viewer-container">
          <div class="sidebar">
            <!-- App purpose - required for OAuth verification: homepage must explain purpose -->
            <div class="app-purpose-section">
              <h2 class="purpose-title">About this application</h2>
              <p class="purpose-text">
                <strong>DWG Viewer</strong> is a web application that lets you <strong>view DWG and DXF CAD drawing files</strong> stored in your Google Drive™ without downloading them or installing desktop software.
              </p>
              <p class="purpose-text">
                We use Google Drive™ access only to <strong>list and open the files you choose</strong> via the file picker. We do not access, store, or process your files beyond displaying them in the viewer. You can also view local files without connecting to Google Drive™.
              </p>
            </div>

            <!-- Google Drive Auth - always shown at top -->
            <div class="auth-section">
              <GoogleDriveAuth />
            </div>

            <div v-if="parsedFileId" class="file-id-section">
              <div class="file-id-label">File ID: {{ parsedFileId }}</div>
            </div>
          </div>

          <div class="viewer-main">
            <div v-if="fileUrl" class="cad-viewer">
              <div
                id="viewer-container"
                ref="viewerContainer"
                class="x-viewer-wrapper"
              ></div>
            </div>

            <div v-else class="welcome-message">
              <el-empty description="Opening file from Google Drive™..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, Warning } from '@element-plus/icons-vue'
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
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import GoogleDriveAuth from '../components/GoogleDriveAuth.vue'
import { useGoogleDrive } from '../composables/useGoogleDrive'

const route = useRoute()

const {
  isAuthenticated,
  isLoading,
  currentFile,
  getFileContent,
  handleDriveAppAction
} = useGoogleDrive()

const fileUrl = ref<string>('')
const viewerContainer = ref<HTMLElement | null>(null)
const viewer = ref<Viewer2d | null>(null)
const layerManagerPlugin = ref<LayerManagerPlugin | null>(null)
const fileLoadError = ref<string>('')
const parsedFileId = ref<string>('')

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
    // Show user-friendly message when 404 is due to drive.file scope (Picker vs Open with)
    if (errorMessage.includes('FILE_OPEN_WITH_REQUIRED')) {
      fileLoadError.value = errorMessage.replace('FILE_OPEN_WITH_REQUIRED:', '').trim()
    } else {
      fileLoadError.value = `Error getting file content: ${errorMessage}`
    }
  }
}

const initViewer = async () => {
  if (!viewerContainer.value || !fileUrl.value) return

  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }

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
      }
    }

    new Viewer2dToolbarPlugin(viewerInstance as any, { menuConfig, language })

    try {
      const modelCfg = {
        modelId: currentFile.value?.name || 'model_1',
        src: fileUrl.value,
        merge: true,
      } as Model2dConfig
      viewerInstance.loadModel(modelCfg)
    } catch (e) {
      console.error('Error loading file:', e)
    }

    viewer.value = viewerInstance
  } catch (error) {
    console.error('Error initializing viewer:', error)
  }
}

watch([fileUrl, viewerContainer], async ([url, container]) => {
  if (url && container && currentFile.value) {
    await nextTick()
    await initViewer()
  }
}, { immediate: true })

watch(currentFile, async (file) => {
  if (file) {
    fileLoadError.value = ''
    cleanupBlobUrl()
    fileUrl.value = ''
    cleanupViewer()
    await loadFileAsBlob(file.id)
  }
}, { immediate: true })

// Store fileId and file loading state
const pendingFileId = ref<string | null>(null)
const fileLoadAttempted = ref(false)

// Watch for authentication completion, then load file
watch(isAuthenticated, async (authenticated) => {
  // Only load file if authenticated and we have a pending fileId and haven't attempted loading yet
  if (authenticated && pendingFileId.value && !fileLoadAttempted.value) {
    fileLoadAttempted.value = true
    try {
      await handleDriveAppAction({
        fileId: pendingFileId.value,
        fileName: '',
        mimeType: ''
      })
    } catch (error) {
      console.error('Error loading file from Google Drive:', error)
      fileLoadError.value = error instanceof Error ? error.message : 'Failed to load file from Google Drive.'
    }
  }
}, { immediate: true })

onMounted(async () => {
  // Parse state parameter from Google Drive "Open with" action
  // Google encodes the state parameter, so we need to decode it first
  // E.g., raw url: http://localhost:5173/open?state={"ids":["xxx"]}
  // Encoded: http://localhost:5173/open?state=%7B%22ids%22%3A%5B%22xxx%22%5D%7D
  const stateParam = route.query.state
  if (!stateParam || typeof stateParam !== 'string') {
    fileLoadError.value = 'Missing or invalid state parameter from Google Drive.'
    return
  }

  // Decode URL-encoded state parameter before parsing
  let decodedState: string
  try {
    decodedState = decodeURIComponent(stateParam)
  } catch (error) {
    fileLoadError.value = `Failed to decode state parameter from Google Drive. Error: ${error}`
    return
  }

  // Parse as JSON (format: {"ids":["xxx"]})
  let state: any = null
  try {
    state = JSON.parse(decodedState)
  } catch (error) {
    fileLoadError.value = `Invalid state format from Google Drive. Expected format: {"ids":["xxx"]}. Error: ${error}`
    return
  }

  // Extract fileId from ids array
  let fileId: string | null = null
  if (state && state.ids && Array.isArray(state.ids) && state.ids.length > 0) {
    fileId = state.ids[0] // Get the first file ID from ids array
  } else {
    fileLoadError.value = 'No file ID found in state parameter. Expected format: {"ids":["xxx"]}'
    return
  }

  if (!fileId) {
    fileLoadError.value = 'No file ID available.'
    return
  }

  // Store parsed fileId for display
  parsedFileId.value = fileId
  pendingFileId.value = fileId

  // If already authenticated, trigger file load immediately
  // Otherwise, wait for watch to trigger when authentication completes
  if (isAuthenticated.value && !fileLoadAttempted.value) {
    fileLoadAttempted.value = true
    try {
      await handleDriveAppAction({
        fileId,
        fileName: '',
        mimeType: ''
      })
    } catch (error) {
      console.error('Error loading file from Google Drive:', error)
      fileLoadError.value = error instanceof Error ? error.message : 'Failed to load file from Google Drive.'
    }
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
  font-size: 16px;
  color: #F56C6C;
  z-index: 100;
  pointer-events: none;
  font-weight: 500;
}

.error-icon {
  color: #F56C6C;
  animation: none;
}

.viewer-container {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 20px;
  width: 100%;
  background: white;
  padding-right: 2px;
  border-radius: 0px;
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

.auth-section {
  flex-shrink: 0;
  border-bottom: 1px solid #e4e7ed;
}

.file-id-section {
  flex-shrink: 0;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.file-id-label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  font-family: monospace;
  word-break: break-all;
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


.welcome-message {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
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

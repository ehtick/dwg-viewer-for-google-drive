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
        <div v-if="isLoading" class="loading-indicator">
          <el-icon class="loading-icon" size="24"><Loading /></el-icon>
          <span>Loading...</span>
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

            <div v-if="currentFile || routeFileId" class="file-info-wrapper">
              <el-card class="file-info-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Document /></el-icon>
                    <span>File info</span>
                  </div>
                </template>
                <div class="file-info-content">
                  <div v-if="currentFile?.name" class="file-info-row" :title="currentFile?.id || routeFileId || undefined">
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
  isLoading,
  currentFile,
  getFileContent,
  authenticate,
  handleDriveAppAction
} = useGoogleDrive()

const fileUrl = ref<string>('')
const viewerContainer = ref<HTMLElement | null>(null)
const viewer = ref<Viewer2d | null>(null)
const layerManagerPlugin = ref<LayerManagerPlugin | null>(null)
const fileLoadError = ref<string>('')

// Parse fileId from route.query.state (format: {"ids":["xxx"]})
const routeFileId = computed(() => {
  const stateParam = route.query.state
  if (!stateParam || typeof stateParam !== 'string') return null
  try {
    const decoded = decodeURIComponent(stateParam)
    const state = JSON.parse(decoded)
    if (state?.ids?.[0]) return state.ids[0]
  } catch {
    try {
      const state = JSON.parse(stateParam)
      if (state?.ids?.[0]) return state.ids[0]
    } catch {
      // ignore
    }
  }
  return null
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

const fileLoadAttempted = ref(false)

watch(isAuthenticated, async (authenticated) => {
  const fileId = routeFileId.value
  if (authenticated && fileId && !fileLoadAttempted.value) {
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
}, { immediate: true })

onMounted(async () => {
  const fileId = routeFileId.value
  if (!fileId) {
    fileLoadError.value = 'Missing or invalid state parameter from Google Drive. Expected format: {"ids":["xxx"]}'
    return
  }

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
    return
  }

  let retries = 0
  while (!isAuthenticated.value && retries < 15) {
    await new Promise(resolve => setTimeout(resolve, 200))
    retries++
  }
  if (!isAuthenticated.value) {
    await authenticate()
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

<template>
  <div class="home-view">
    <div class="app-header">
      <h1>DWG Viewer</h1>
      <div class="header-actions">
        <router-link to="/local-file" class="header-link">View local files</router-link>
      </div>
    </div>

    <div class="app-content">
      <div v-if="isLoading" class="loading-indicator">
          <el-icon class="loading-icon" size="24"><Loading /></el-icon>
          <span>Loading...</span>
        </div>

      <div class="center-card">
        <section class="app-purpose-section">
              <h2 class="purpose-title">About this application</h2>
              <p class="purpose-text">
                <strong>DWG Viewer</strong> is a web application that lets you <strong>view DWG and DXF CAD drawing files</strong> stored in your Google Drive™ without downloading them or installing desktop software.
              </p>
              <p class="purpose-text">
                We use Google Drive™ access only to <strong>open the files you choose</strong> via “Open with” in Google Drive™. We do not access, store, or process your files beyond displaying them in the viewer.
              </p>
        </section>

        <section class="auth-section">
          <h2 class="auth-title">Google Drive Integration</h2>
          <GoogleDriveAuth />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { onMounted, onUnmounted } from 'vue'

import GoogleDriveAuth from '../components/GoogleDriveAuth.vue'
// import GoogleDriveFilePicker from '../components/GoogleDriveFilePicker.vue'
import { useGoogleDrive } from '../composables/useGoogleDrive'


const {
  isLoading,
  tryRestoreAuth,
} = useGoogleDrive()


onMounted(async () => {
  await tryRestoreAuth()
})

onUnmounted(() => {
})
</script>

<style scoped>
.home-view {
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

.app-content {
  flex: 1 0 auto;
  min-height: calc(100vh - var(--footer-height, 35px) - 72px);
  padding: 32px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  color: #409EFF;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  font-size: 16px;
  color: #409EFF;
  font-weight: 500;
}

.center-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.app-purpose-section {
  padding: 32px 36px 28px;
  border-bottom: 1px solid #ebeef5;
}

.purpose-title {
  margin: 0 0 14px 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #303133;
  letter-spacing: -0.01em;
}

.purpose-text {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.purpose-text:last-child {
  margin-bottom: 0;
}

.auth-section {
  padding: 28px 36px 32px;
}

.auth-title {
  margin: 0 0 16px 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #303133;
  letter-spacing: -0.01em;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.2rem;
  }

  .app-content {
    padding: 24px 16px 32px;
    justify-content: flex-start;
  }

  .center-card {
    max-width: 100%;
  }

  .app-purpose-section {
    padding: 24px 20px 20px;
  }

  .auth-section {
    padding: 24px 20px 28px;
  }
}
</style>

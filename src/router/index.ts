import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import OpenDriveFile from '../views/OpenDriveFile.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'
import LocalFile from '../views/LocalFile.vue'
import Support from '../views/Support.vue'
import Install from '../views/Install.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'OpenDriveFile', component: OpenDriveFile },
    { path: '/open', name: 'OpenDriveFileOpen', component: OpenDriveFile },
    { path: '/home', name: 'Home', component: Home },
    { path: '/install', name: 'Install', component: Install },
    { path: '/privacy', name: 'Privacy', component: Privacy },
    { path: '/terms', name: 'Terms', component: Terms },
    { path: '/local-file', name: 'LocalFile', component: LocalFile },
    { path: '/support', name: 'Support', component: Support },
  ],
})

export default router

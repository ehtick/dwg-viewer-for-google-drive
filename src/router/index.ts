import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import OpenDriveFile from '../views/OpenDriveFile.vue'
import Privacy from '../views/Privacy.vue'
import Terms from '../views/Terms.vue'
import LocalFile from '../views/LocalFile.vue'
import Support from '../views/Support.vue'
import Install from '../views/Install.vue'
import TestRedirect from '../views/TestRedirect.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // http://localhost:5173/?state={%22ids%22:[%2211YGgbQBr6vkuBh3NEVbyYSA4xkcIvdgU%22],%22action%22:%22open%22,%22userId%22:%22100191952719869236324%22,%22resourceKeys%22:{}}&iss=https://accounts.google.com&code=4/0AfrIepAS1pk_9GGajJJgFUDTOZQh3nCN7tHSsDKs2VwKcgofK1p3iOF0TtOnKLlvPZv5TQ&scope=https://www.googleapis.com/auth/drive.file
    { path: '/', name: 'OpenDriveFile', component: OpenDriveFile },
    { path: '/open', name: 'OpenDriveFileOpen', component: OpenDriveFile },
    { path: '/home', name: 'Home', component: Home },
    { path: '/install', name: 'Install', component: Install },
    { path: '/test-redirect', name: 'TestRedirect', component: TestRedirect },
    { path: '/privacy', name: 'Privacy', component: Privacy },
    { path: '/terms', name: 'Terms', component: Terms },
    { path: '/local-file', name: 'LocalFile', component: LocalFile },
    { path: '/support', name: 'Support', component: Support },
  ],
})

export default router

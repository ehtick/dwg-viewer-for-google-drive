<template>
  <div>
    <p>Calling getRedirectResult()...</p>
    <p id="resultToken"></p>
    <button @click="() => signInWithRedirectFlow(true)">Sign in with Redirect</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getRedirectResultToken, signInWithRedirectFlow } from '../services/firebase-auth'

onMounted(async () => {
  const el = document.getElementById('resultToken')
  const payload = await getRedirectResultToken()
  el!.textContent = `resultToken: ${payload}`
})
</script>


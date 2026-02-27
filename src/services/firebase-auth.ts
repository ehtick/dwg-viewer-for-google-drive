/**
 * Firebase Authentication: redirect-based sign-in (no popup, no custom backend).
 * When Firebase is configured, uses signInWithRedirect / getRedirectResult to get an access token for Drive API.
 */

import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type UserCredential
} from 'firebase/auth'
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install'
]

function getFirebaseConfig(): Record<string, string> | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const appId = import.meta.env.VITE_FIREBASE_APP_ID
  if (!apiKey || !authDomain || !projectId || !appId) return null
  return { apiKey, authDomain, projectId, appId }
}

let app: FirebaseApp | null = null

function getOrInitApp(): FirebaseApp {
  if (app) return app
  const config = getFirebaseConfig()
  if (!config) throw new Error('Firebase config missing (VITE_FIREBASE_* env)')
  if (getApps().length > 0) {
    app = getApp()
  } else {
    app = initializeApp(config)
  }
  return app
}

export function getFirebaseAuth() {
  return getAuth(getOrInitApp())
}

/** Google provider with drive.file and drive.install scopes for Drive API */
export function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  DRIVE_SCOPES.forEach(scope => provider.addScope(scope))
  return provider
}

/** Redirect to Google sign-in (full-page, no popup) */
export async function signInWithRedirectFlow(): Promise<void> {
  const auth = getFirebaseAuth()
  const provider = createGoogleProvider()
  await signInWithRedirect(auth, provider)
}

export type RedirectTokenPayload = {
  access_token: string
  expires_in: number
  scope?: string
  token_type: string
}

/**
 * Get result from redirect return; returns access_token payload or null.
 * Safe to call from multiple places (e.g. useGoogleDrive): only one getRedirectResult() is performed.
 */
export async function getRedirectResultToken(): Promise<RedirectTokenPayload | null> {
  const auth = getFirebaseAuth()
  let result: UserCredential | null = await getRedirectResult(auth)
  if (!result) {
    // result should be null if this is not a redirect return.
    // It should not be null if this is a redirect return.
    console.log('getRedirectResultToken: no result')
    return Promise.resolve(null)
  }
  const credential = GoogleAuthProvider.credentialFromResult(result)
  if (!credential?.accessToken) {
    console.error('getRedirectResultToken: no access token')
    return Promise.resolve(null)
  }
  const expires_in = 3600
  return Promise.resolve({
    access_token: credential.accessToken,
    expires_in,
    scope: DRIVE_SCOPES.join(' '),
    token_type: 'Bearer'
  })
}

/** Sign out from Firebase Auth */
export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth()
  await firebaseSignOut(auth)
}

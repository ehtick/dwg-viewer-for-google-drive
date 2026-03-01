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
  if (!apiKey || !authDomain || !projectId || !appId) {
    console.log('Firebase config missing (VITE_FIREBASE_* env)')
    return null
  }
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
    console.log('FirebaseApp initialized')
  }
  return app
}

export function getFirebaseAuth() {
  return getAuth(getOrInitApp())
}

/**
 * Google provider with drive.file and drive.install scopes for Drive API.
 * Note: Firebase's GoogleAuthProvider() adds "profile" (and often "email") by default; these
 * cannot be removed via the API. Requesting profile is usually not the cause of login failure;
 * redirect timing, same-origin, or third-party cookies are more likely.
 */
export function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  DRIVE_SCOPES.forEach(scope => provider.addScope(scope))
  return provider
}

/** Redirect to Google sign-in (full-page, no popup). When forceConsent is true, user is shown the consent screen every time. */
export async function signInWithRedirectFlow(forceConsent?: boolean): Promise<void> {
  const auth = getFirebaseAuth()
  const provider = createGoogleProvider()
  if (forceConsent) {
    provider.setCustomParameters({ prompt: 'consent' })
  }
  await signInWithRedirect(auth, provider)
  // since it redirect to the sign-in page, we don't need to return anything
}

export type RedirectTokenPayload = {
  access_token: string
  expires_in: number
  scope?: string
  token_type: string
}

// getRedirectResult() may only be called once per redirect; Firebase consumes the result.
// We call it once and cache the payload so multiple callers all get the same value.
let cachedRedirectPayload: RedirectTokenPayload | null = null
let redirectResultPromise: Promise<RedirectTokenPayload | null> | null = null

/**
 * Get result from redirect return; returns access_token payload or null.
 * Firebase getRedirectResult() is one-time only, so we run it once and cache the result.
 * Safe to call from multiple places: later calls get the cached value (or null).
 * When Firebase config is missing, returns null instead of throwing.
 */
export async function getRedirectResultToken(): Promise<RedirectTokenPayload | null> {
  if (cachedRedirectPayload) return cachedRedirectPayload
  if (redirectResultPromise) return redirectResultPromise

  redirectResultPromise = (async (): Promise<RedirectTokenPayload | null> => {
    try {
      const auth = getFirebaseAuth()
      const result: UserCredential | null = await getRedirectResult(auth)
      if (!result) {
        console.log('getRedirectResultToken: no result')
        return null
      }
      const credential = GoogleAuthProvider.credentialFromResult(result)
      if (!credential?.accessToken) {
        console.error('getRedirectResultToken: no access token')
        return null
      }
      const payload: RedirectTokenPayload = {
        access_token: credential.accessToken,
        expires_in: 3600,
        scope: DRIVE_SCOPES.join(' '),
        token_type: 'Bearer'
      }
      cachedRedirectPayload = payload
      return payload
    } catch (e) {
      if (getFirebaseConfig() == null) return null
      throw e
    }
  })()

  return redirectResultPromise
}

/** Sign out from Firebase Auth */
export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth()
  await firebaseSignOut(auth)
}

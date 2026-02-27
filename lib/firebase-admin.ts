import admin from 'firebase-admin'

// Initialize once — uses project ID only (no service account needed for token verification)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

export { admin }

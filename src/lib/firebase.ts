import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import type {
  AuthenticateLineUserParams,
  AuthenticateLineUserResult,
} from "../../server-types";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "asia-southeast1");

// Connect to emulators in development mode
if (process.env.NODE_ENV === "development") {
  // Auth emulator
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });

  // Firestore emulator
  connectFirestoreEmulator(db, "localhost", 8080);

  // Functions emulator
  connectFunctionsEmulator(functions, "localhost", 5001);

  console.log("Connected to Firebase emulators");
}

// Firebase Cloud Function for LINE authentication
// Note: Using v2 callable functions
const authenticateLineUser = httpsCallable<
  AuthenticateLineUserParams,
  AuthenticateLineUserResult
>(functions, "authenticateLineUser");

// Sign in with custom token
const signInWithToken = async (token: string) => {
  try {
    return await signInWithCustomToken(auth, token);
  } catch (error) {
    console.error("Error signing in with custom token:", error);
    throw error;
  }
};

// Get user data from Firestore
const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Sign out
const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Listen for auth state changes
const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export {
  auth,
  db,
  authenticateLineUser,
  signInWithToken,
  getUserData,
  signOut,
  onAuthStateChange,
};

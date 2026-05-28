import { initializeApp } from "firebase/app";
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account"
  });
}

async function ensureUserProfile(user) {
  if (!db || !user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export function subscribeToAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  getRedirectResult(auth)
    .then((result) => ensureUserProfile(result?.user))
    .catch(() => {});

  return onAuthStateChanged(auth, (user) => {
    callback(user);

    if (user) {
      ensureUserProfile(user).catch(() => {});
    }
  });
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error("Firebase is not configured yet.");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await ensureUserProfile(user);
    return user;
  } catch (error) {
    if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw error;
  }
}

export async function logout() {
  if (auth) {
    await signOut(auth);
  }
}

export async function fetchTrips(userId) {
  if (!db || !userId) return [];

  const tripsRef = collection(db, "users", userId, "trips");
  const snapshot = await getDocs(query(tripsRef, orderBy("createdAt", "desc")));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));
}

export async function saveTrip(userId, trip) {
  if (!db || !userId) return trip;

  const tripsRef = collection(db, "users", userId, "trips");
  const payload = {
    ...trip,
    ownerId: userId,
    createdAt: trip.createdAt || new Date().toISOString(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(tripsRef, payload);

  return { ...payload, id: docRef.id };
}

export async function removeTrip(userId, tripId) {
  if (!db || !userId || !tripId) return;
  await deleteDoc(doc(db, "users", userId, "trips", tripId));
}

// ── Profile Management ──────────────────────────

export async function getUserProfile(userId) {
  if (!db || !userId) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(userId, data) {
  if (!db || !userId) return;

  const updatePayload = {
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) updatePayload.name = data.displayName;
  if (data.photoURL !== undefined) updatePayload.photoURL = data.photoURL;
  if (data.travelPrefs !== undefined) updatePayload.travelPrefs = data.travelPrefs;
  if (data.profileSetupDone !== undefined) updatePayload.profileSetupDone = data.profileSetupDone;

  await setDoc(doc(db, "users", userId), updatePayload, { merge: true });
}

export { auth };


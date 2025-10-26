// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  initializeFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnAzn18yGCVuWLUCx3KVC9Sf656MicZ38",
  authDomain: "rebzlist.firebaseapp.com",
  projectId: "rebzlist",
  storageBucket: "rebzlist.appspot.com",
  messagingSenderId: "319668133045",
  appId: "1:319668133045:web:bf7bc4fc3d1781db75f2fc",
  measurementId: "G-48186NQYRC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore with resilient networking
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // friendlier to github.io / strict networks
  useFetchStreams: false              // reduces some proxy issues
});

// Offline cache (works in one tab at a time)
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('IndexedDB persistence requires a single open tab of the app.');
  } else if (err.code === 'unimplemented') {
    console.warn('IndexedDB not available in this browser (private mode / old WebView).');
  }
});

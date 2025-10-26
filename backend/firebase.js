// backend/firebase.js (v10.12.0 CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBnAzn18yGCVuWLUCx3KVC9Sf656MicZ38",
  authDomain: "rebzlist.firebaseapp.com",
  projectId: "rebzlist",
  storageBucket: "rebzlist.firebasestorage.app",
  messagingSenderId: "319668133045",
  appId: "1:319668133045:web:bf7bc4fc3d1781db75f2fc",
  measurementId: "G-48186NQYRC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Make persistence multi-tab and fail gracefully if not supported
try {
  await enableMultiTabIndexedDbPersistence(db);
  console.log('Firestore persistence: multi-tab');
} catch (e) {
  console.warn('Persistence disabled:', e.code || e);
}

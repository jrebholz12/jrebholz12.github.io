// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

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

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);


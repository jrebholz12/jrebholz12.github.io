// Imports
import { toggleSettings } from "../backend/page-folders/backend-index.js";
import { sortTabs } from "../backend/page-folders/global-js.js";
import { updateLastName, getLastName, changeTheme, initiateTheme } from "../backend/docs.js";
import { auth } from '../backend/firebase.js';

import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  doc, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const defaultUnitInputList = ['g','tsp', 'ea', 'can', 'bunch', 'tbs', 'quart', 'gallon', 'oz', 'clove', 'cup', 'loaf', 'slice', 'lb', 'pack', 'bunch', 'jar'];
let unitInputList = [];

// Function to load units from Firestore or default to predefined list
export async function loadUnitInputList() {
  const user = auth.currentUser;

  if (user) {
    const userDocRef = doc(db, 'users', user.uid, 'data', 'unitList');
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        unitInputList = docSnap.data().unitList || defaultUnitInputList;
      } else {
        unitInputList = defaultUnitInputList;
      }
    } catch (error) {
      console.error("Error fetching unit list from Firestore:", error);
      unitInputList = defaultUnitInputList;
    }
  } else {
    unitInputList = defaultUnitInputList;
  }
}

// Wrap all your initialization inside an async function that waits for the user authentication
async function initializeApp() {
  // Set persistence for the session
  await setPersistence(auth, browserLocalPersistence)
    .catch((error) => console.error('Error setting persistence:', error.message));

  // Wait for authentication state change
  onAuthStateChanged(auth, async (user) => {
    const authLink = document.getElementById('authLink'); // ensure this exists in your DOM
    if (user) {
      // Fetch user data (last name and theme) — pass the user!
      await getLastName(user);
      await initiateTheme();

      // Update UI to reflect sign-in status
      if (authLink) authLink.innerText = 'Sign Out';
      document.getElementById('settingsContainer').classList.remove('display-off');

      // Load other DOM-related functions
      sortTabs('home', 'home');
    } else {
      if (authLink) authLink.innerText = 'Sign In';
      document.getElementById('settingsContainer').classList.add('display-off');

      // Initialize default theme / homepage for signed-out users
      await initiateTheme();
    }
  });
}

// Call this function after DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
});

// Event Listeners for settings
document.getElementById('settingsImage').addEventListener('click', toggleSettings);
document.getElementById('last-name-indicator').addEventListener('keydown', (event) => updateLastName(event));
document.getElementById('lightTheme').addEventListener('click', () => changeTheme('light'));
document.getElementById('darkTheme').addEventListener('click', () => changeTheme('dark'));

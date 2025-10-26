// scripts/index.js

// Imports
import { toggleSettings } from "../backend/page-folders/backend-index.js";
import { sortTabs } from "../backend/page-folders/global-js.js";
import { updateLastName, getLastName, changeTheme, initiateTheme } from "../backend/docs.js";
import { auth, db } from '../backend/firebase.js';

import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// local state
let defaultUnitInputList = ['g','tsp', 'ea', 'can', 'bunch', 'tbs', 'quart', 'gallon', 'oz', 'clove', 'cup', 'loaf', 'slice', 'lb', 'pack', 'bunch', 'jar'];
let unitInputList = [];

// define DOM refs used here
const authLink = document.getElementById('authLink');

// Load units (if signed in)
export async function loadUnitInputList() {
  const user = auth.currentUser;

  if (user) {
    const userDocRef = doc(db, 'users', user.uid, 'data', 'unitList');
    try {
      const docSnap = await getDoc(userDocRef);
      unitInputList = docSnap.exists()
        ? (docSnap.data().unitList || defaultUnitInputList)
        : defaultUnitInputList;
    } catch (error) {
      console.error("Error fetching unit list from Firestore:", error);
      unitInputList = defaultUnitInputList;
    }
  } else {
    unitInputList = defaultUnitInputList;
  }
}

// Init after DOM ready
async function initializeApp() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await getLastName();
      await initiateTheme();
      if (authLink) authLink.innerText = 'Sign Out';
      document.getElementById('settingsContainer')?.classList.remove('display-off');
      sortTabs('home', 'home');
    } else {
      if (authLink) authLink.innerText = 'Sign In';
      document.getElementById('settingsContainer')?.classList.add('display-off');
      initiateTheme();
      sortTabs('home', 'home')
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
});

// Settings events
document.getElementById('settingsImage')?.addEventListener('click', toggleSettings);
document.getElementById('last-name-indicator')?.addEventListener('keydown', (event) => updateLastName(event));
document.getElementById('lightTheme')?.addEventListener('click', () => changeTheme('light'));
document.getElementById('darkTheme')?.addEventListener('click', () => changeTheme('dark'));

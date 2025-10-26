//Imports needed functions
import { toggleSettings } from "../backend/page-folders/backend-index.js";
import { sortTabs } from "../backend/page-folders/global-js.js";
import { updateLastName, getLastName, changeTheme, initiateTheme } from "../backend/docs.js";
import { auth, db } from '../backend/firebase.js';
import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';

let defaultUnitInputList = ['g','tsp', 'ea', 'can', 'bunch', 'tbs', 'quart', 'gallon', 'oz', 'clove', 'cup', 'loaf', 'slice', 'lb', 'pack', 'bunch', 'jar'];
let unitInputList = [];


// Function to load units from Firestore or default to predefined list
export async function loadUnitInputList() {
  const user = auth.currentUser;

  if (user) {
    const userDocRef = doc(db, 'users', user.uid, 'data', 'unitList');
    
    try {
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Get the saved units from Firestore
        unitInputList = docSnap.data().unitList || defaultUnitInputList;
      } else {
        // Use the default list if no custom list is found
        unitInputList = defaultUnitInputList;
      }
    } catch (error) {
      console.error("Error fetching unit list from Firestore:", error);
      // Fallback to default list in case of error
      unitInputList = defaultUnitInputList;
    }
  } else {
    // No user is signed in, use default list
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
    if (user) {

      // Fetch user data (last name and theme)
      await getLastName();
      await initiateTheme();

      // Update UI to reflect sign-in status
      authLink.innerText = 'Sign Out';
      document.getElementById('settingsContainer').classList.remove('display-off');

      // Load other DOM-related functions
      sortTabs('home', 'home');

    } else {
      authLink.innerText = 'Sign In';
      document.getElementById('settingsContainer').classList.add('display-off');

      // You can initialize the theme and other things for unauthenticated users here if needed
      initiateTheme();
    }
  });
}

// Call this function after DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp(); // Ensure the app initializes after the DOM is ready
});


// Event Listeners for settings
document.getElementById('settingsImage').addEventListener('click', toggleSettings);
document.getElementById('last-name-indicator').addEventListener('keydown', (event) => updateLastName(event));
document.getElementById('lightTheme').addEventListener('click', () => changeTheme('light'));
document.getElementById('darkTheme').addEventListener('click', () => changeTheme('dark'));

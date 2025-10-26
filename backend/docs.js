// docs.js
import { db, auth } from './firebase.js';
import {
  doc,
  setDoc,
  updateDoc,
  getDocFromServer,
  getDocFromCache
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Runs anywhere to check if the user is signed in
export function checkUserAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) callback(user);
    // else: do nothing
  });
}

export function updateLastName(event) {
  const area = document.getElementById('last-name-indicator');
  const name = area.value || '';

  if (event.key === "Enter") {
    document.getElementById('familyName').innerHTML = name;

    const user = auth.currentUser;
    if (!user) {
      console.error("No user is signed in.");
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    setDoc(userDocRef, { lastName: name }, { merge: true })
      .catch((error) => {
        console.error("Error saving last name to Firestore: ", error);
      });

    // Hide the settings box after saving
    const box = document.getElementById('settingsBox');
    box.classList.add('display-off');
  }
}

// Resilient last name fetch: server first → cache fallback
export async function getLastName(user) {
  const u = user ?? auth.currentUser;
  const nameEl = document.getElementById('familyName');

  if (!u) {
    if (nameEl) nameEl.innerHTML = "";
    return;
  }

  const ref = doc(db, 'users', u.uid);

  // Try server
  try {
    const s = await getDocFromServer(ref);
    if (s.exists()) {
      const name = s.data().lastName ?? '';
      if (name && nameEl) nameEl.innerHTML = name;
      return;
    }
  } catch (e) {
    // swallow and try cache
  }

  // Fallback to cache
  try {
    const s = await getDocFromCache(ref);
    if (s.exists()) {
      const name = s.data().lastName ?? '';
      if (name && nameEl) nameEl.innerHTML = name;
    }
  } catch (e) {
    // leave empty if not available
  }
}

export async function changeTheme(theme) {
  // Apply theme to DOM
  document.body.style.backgroundImage = `url('pictures/${theme}wallpaper.jpg')`;
  document.getElementById('homepageArea').innerHTML = `
    <div id="recBackground" class="${theme}-rectangle-background">
      <img class="cover" id="cookbookImage" src="icons/${theme}cookbook.png">
      <img class="spiral" src="icons/notebook-removebg-preview.png">
      <div class="box-container">
        <a href="add-recipe.html">
          <div class="${theme}-button-box">
            <img class="image-list" src="icons/recipeBox.png"> My Recipe Box
          </div>
        </a>
        <a href="browse-recipes.html">
          <div class="${theme}-button-box">
            <img class="image-list" src="icons/littlebook.webp"> My CookBook
          </div>
        </a>
      </div>
    </div>
  `;

  // Hide settings
  const box = document.getElementById('settingsBox');
  box.classList.add('display-off');

  // Save theme in profile
  const user = auth.currentUser;
  if (!user) {
    console.error("No user is signed in. Theme not saved to Firestore.");
    return;
  }

  const userDocRef = doc(db, 'users', user.uid);
  try {
    await updateDoc(userDocRef, { theme });
  } catch (error) {
    console.error("Error updating theme in Firestore: ", error);
  }
}

// Resilient theme init: server first → cache fallback, then render
export async function initiateTheme() {
  let theme = 'light'; // default
  const location = document.getElementById('homepageArea');
  const user = auth.currentUser;

  if (user) {
    const ref = doc(db, 'users', user.uid);
    try {
      const s = await getDocFromServer(ref);
      if (s.exists()) theme = s.data().theme ?? 'light';
    } catch (e) {
      try {
        const s = await getDocFromCache(ref);
        if (s.exists()) theme = s.data().theme ?? 'light';
      } catch (_) {}
    }
  }

  applyTheme(theme, location);
}

// Apply the theme and insert HTML
function applyTheme(theme, location) {
  document.body.style.backgroundImage = `url('pictures/${theme}wallpaper.jpg')`;
  const html = `
    <div id="recBackground" class="${theme}-rectangle-background">
      <img class="cover" id="cookbookImage" src="icons/${theme}cookbook.png">
      <img class="spiral" src="icons/notebook-removebg-preview.png">
      <div class="box-container">
        <a href="add-recipe.html">
          <div class="${theme}-button-box">
            <img class="image-list" src="icons/recipeBox.png">
            My Recipe Box
          </div>
        </a>
        <a href="browse-recipes.html">
          <div class="${theme}-button-box">
            <img class="image-list" src="icons/littlebook.webp">
            My CookBook
          </div>
        </a>
      </div>
    </div>
  `;
  location.innerHTML = html;
  document.body.style.backgroundSize = '80%';
}

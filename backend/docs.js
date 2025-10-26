import { db, auth } from './firebase.js'; // Make sure you import the Firestore and auth instances
import { doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'; // Firestore functions
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js'

// This will run on every page to check if the user is signed in
export function checkUserAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, pass user to the callback
      callback(user);
    } else {
      // User is signed out
    }
  });
}


export function updateLastName(event) {
  let area = document.getElementById('last-name-indicator');
  let name = area.value || '';
  
  if (event.key === "Enter") {
    let displayName = name;
    document.getElementById('familyName').innerHTML = displayName;

    // Get the current authenticated user
    const user = auth.currentUser;

    if (user) {
      // Create a reference to the Firestore document
      const userDocRef = doc(db, 'users', user.uid);

      // Save the last name to Firestore under the current user's document
      setDoc(userDocRef, {
        lastName: name
      }, { merge: true }) // 'merge: true' will update only the last name, keeping other fields intact
      .then(() => {
      })
      .catch((error) => {
        console.error("Error saving last name to Firestore: ", error);
      });
      
      // Hide the settings box after saving
      let box = document.getElementById('settingsBox');
      box.classList.add('display-off');
    } else {
      console.error("No user is signed in.");
    }
  }
}

export async function getLastName(user) {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);

    try {
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const name = data.lastName || '';

        if (name) {
          document.getElementById('familyName').innerHTML = name;
        }
      } else {
      }
    } catch (error) {
      console.error("Error fetching last name from Firestore: ", error);
    }
  } else {
    document.getElementById('familyName').innerHTML = "";
  }
}

// Listen to authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Call getLastName when the user is signed in
    getLastName(user);
  } else {
    document.getElementById('familyName').innerHTML = "Your Name Here";
  }
});


export async function changeTheme(theme) {
  // Apply the theme changes to the DOM
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

  // Hide the settings box after applying the theme
  let box = document.getElementById('settingsBox');
  box.classList.add('display-off');

  // Save the theme to Firestore under the current user
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, 'users', user.uid); // Reference to the user's Firestore document
    try {
      await updateDoc(userDocRef, { theme: theme });
    } catch (error) {
      console.error("Error updating theme in Firestore: ", error);
    }
  } else {
    console.error("No user is signed in. Theme not saved to Firestore.");
  }
}

export async function initiateTheme() {
  let theme = 'light'; // Default theme
  const location = document.getElementById('homepageArea');

  // Check if a user is signed in
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, 'users', user.uid); // Reference to the user's Firestore document

    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        theme = userDoc.data().theme || 'light'; // Get the theme from Firestore, fallback to 'light'
      }
    } catch (error) {
      console.error("Error retrieving theme from Firestore:", error);
    }
  } else {
  }

  // Only insert HTML after verifying the user's theme
  applyTheme(theme, location);
}

// Separate function to apply the theme and insert HTML
function applyTheme(theme, location) {
  // Apply the theme to the DOM
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




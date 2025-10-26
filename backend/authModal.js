import {  signOut } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { auth, db } from '../backend/firebase.js';
import { initiateTheme } from "../backend/docs.js";

// Sign Out Function
function signOutUser() {
  signOut(auth)
    .then(() => {
      authLink.innerText = 'Sign In';
      document.getElementById('settingsContainer').classList.add('display-off');
      document.getElementById('familyName').innerHTML = 'Your Name Here';
      initiateTheme();
    })
    .catch((error) => {
      console.error('Error signing out:', error.message);
    });
}


// Get modal and close button elements
const modal = document.getElementById('authModal');
const authLink = document.getElementById('authLink');
const closeBtn = document.querySelector('.close');

// Get sign-in and sign-up containers
const signInContainer = document.getElementById('sign-in-container');
const signUpContainer = document.getElementById('sign-up-container');

// Get the toggle links
const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');

// Utility function to toggle modal visibility
function toggleModal(show) {
  modal.style.display = show ? 'block' : 'none';
  modal.setAttribute('aria-hidden', show ? 'false' : 'true');
  if (show) {
    signInContainer.style.display = 'flex';
    signUpContainer.style.display = 'none';
  }
}

// Utility function to switch between forms
export function switchToForm(showContainer, hideContainer) {
  hideContainer.style.display = 'none';
  showContainer.style.display = 'flex';
}

// Open modal when the sign-in/sign-up link is clicked
authLink.addEventListener('click', (event) => {
  event.preventDefault();
  if (authLink.innerText === "Sign Out") {
    return;
  }
  toggleModal(true);
});

// Close modal when the 'X' is clicked
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    toggleModal(false);
  });
}


// Switch to the Sign-Up form
if (switchToSignUp) {
  switchToSignUp.addEventListener('click', (event) => {
    event.preventDefault();
    switchToForm(signUpContainer, signInContainer);
  });
}

// Switch back to the Sign-In form
if (switchToSignIn) {
  switchToSignIn.addEventListener('click', (event) => {
    event.preventDefault();
    switchToForm(signInContainer, signUpContainer);
  });
}

// Open modal when the sign-in/sign-up link is clicked
authLink.addEventListener('click', (event) => {
  event.preventDefault();
  if (authLink.innerText === 'Sign Out') {
    signOutUser(); // Sign out if user is already signed in
  } else {
    modal.style.display = 'block';
    signInContainer.style.display = 'flex';
    signUpContainer.style.display = 'none';
  }
});

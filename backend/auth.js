// backend/auth.js
import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getLastName, initiateTheme } from './docs.js';

// Cache DOM
const modal = document.getElementById('authModal');
const authLink = document.getElementById('authLink');
const signInContainer = document.getElementById('sign-in-container');
const signUpContainer = document.getElementById('sign-up-container');
const signInForm = document.getElementById('signInButton');
const signUpForm = document.getElementById('signUpButton');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Persistence (one place only)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('Persistence set to local.'))
  .catch((error) => console.error('Error setting persistence:', error.message));

// Forgot password
forgotPasswordLink?.addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('signInEmail').value.trim();
  if (!email) return displayError('Please enter your email to reset your password.', signInContainer);

  sendPasswordResetEmail(auth, email)
    .then(() => displaySuccess('A password reset email has been sent. Please check your inbox.', signInContainer))
    .catch((error) => {
      const map = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/internal-error': 'An error occurred. Please try again later.',
      };
      displayError(map[error.code] || 'An unexpected error occurred.', signInContainer);
    });
});

// Sign up
signUpForm?.addEventListener('click', () => {
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value.trim();
  const verifyPassword = document.getElementById('signUpVerifyPassword').value.trim();

  clearErrors();
  if (!isValidEmail(email)) return displayError('Please enter a valid email address.', signUpContainer);
  if (!isValidPassword(password)) return displayError('Password must be at least 6 characters long.', signUpContainer);
  if (password !== verifyPassword) return displayError('Passwords do not match. Please try again.', signUpContainer);

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => closeModal())
    .catch(handleSignUpError);
});

// Sign in
signInForm?.addEventListener('click', () => {
  const email = document.getElementById('signInEmail').value.trim();
  const password = document.getElementById('signInPassword').value.trim();

  clearErrors();
  if (!isValidEmail(email)) return displayError('Please enter a valid email address.', signInContainer);
  if (!isValidPassword(password)) return displayError('Password must be at least 6 characters long.', signInContainer);

  signInWithEmailAndPassword(auth, email, password)
    .then(() => closeModal())
    .catch((error) => {
      console.error('Sign-In Error:', error);
      handleSignInError(error);
    });
});

// Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (authLink) authLink.innerText = 'Sign Out';
    document.getElementById('settingsContainer')?.classList.remove('display-off');
    getLastName();
    initiateTheme();
  } else {
    if (authLink) authLink.innerText = 'Sign In';
    document.getElementById('settingsContainer')?.classList.add('display-off');
  }
});

// Sign out (exported for authModal)
export function signOutUser() {
  signOut(auth)
    .then(() => {
      if (authLink) authLink.innerText = 'Sign In';
      document.getElementById('settingsContainer')?.classList.add('display-off');
      document.getElementById('familyName').innerText = 'Your Name Here';
      initiateTheme();
    })
    .catch((error) => console.error('Error signing out:', error.message));
}

// Helpers
function handleSignInError(error) {
  const map = {
    'auth/invalid-email': 'Invalid email address. Please enter a valid email.',
    'auth/invalid-login-credentials': 'Incorrect password. Please try again.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
    'auth/internal-error': 'An unexpected error occurred. Please try again later.',
  };
  displayError(map[error.code] || 'An unknown error occurred. Please try again.', signInContainer);
}

function handleSignUpError(error) {
  const map = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
  };
  displayError(map[error.code] || 'An unexpected error occurred.', signUpContainer);
}

function displayError(message, container) {
  clearErrors();
  const el = document.createElement('div');
  el.className = 'error-message';
  el.innerText = message;
  container.appendChild(el);
}
function displaySuccess(message, container) {
  clearErrors();
  const el = document.createElement('div');
  el.className = 'success-message';
  el.innerText = message;
  container.appendChild(el);
}
function clearErrors() {
  document.querySelectorAll('.error-message, .success-message').forEach((el) => el.remove());
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPassword(password) {
  return password.length >= 6;
}
function closeModal() {
  modal.style.display = 'none';
  clearErrors();
}

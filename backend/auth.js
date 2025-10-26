import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { getLastName, initiateTheme } from './docs.js';
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';

// Add event listener for the "Forgot Password" link
document.getElementById('forgotPasswordLink').addEventListener('click', (event) => {
  event.preventDefault();

  // Get the user's email from the sign-in form
  const email = document.getElementById('signInEmail').value.trim();

  // Check if email is entered
  if (!email) {
    displayError('Please enter your email to reset your password.', signInContainer);
    return;
  }

  // Send password reset email
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Show success message
      displaySuccess(
        'A password reset email has been sent. Please check your inbox.',
        signInContainer
      );
    })
    .catch((error) => {
      // Handle errors
      const errorMessages = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/internal-error': 'An error occurred. Please try again later.',
      };
      const message = errorMessages[error.code] || 'An unexpected error occurred.';
      displayError(message, signInContainer);
    });
});


// Cache DOM elements
const modal = document.getElementById('authModal');
const authLink = document.getElementById('authLink');
const signInContainer = document.getElementById('sign-in-container');
const signUpContainer = document.getElementById('sign-up-container');
const signInForm = document.getElementById('signInButton');
const signUpForm = document.getElementById('signUpButton');

// Set Firebase persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('Persistence set to local.'))
  .catch((error) => console.error('Error setting persistence:', error.message));

// Sign-Up Function
// Sign-Up Function
signUpForm.addEventListener('click', () => {
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value.trim();
  const verifyPassword = document.getElementById('signUpVerifyPassword').value.trim();

  clearErrors(); // Clear any previous error messages

  // Validate email and passwords
  if (!isValidEmail(email)) {
    return displayError('Please enter a valid email address.', signUpContainer);
  }
  if (!isValidPassword(password)) {
    return displayError('Password must be at least 6 characters long.', signUpContainer);
  }
  if (password !== verifyPassword) {
    return displayError('Passwords do not match. Please try again.', signUpContainer);
  }

  // Proceed with Firebase sign-up if all validations pass
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('User signed up:', userCredential.user);
      closeModal(); // Close modal on successful sign-up
    })
    .catch((error) => {
      handleSignUpError(error); // Handle errors
    });
});



// Sign-In Function
signInForm.addEventListener('click', () => {
  const email = document.getElementById('signInEmail').value.trim();
  const password = document.getElementById('signInPassword').value.trim();

  clearErrors();

  if (!isValidEmail(email)) {
    return displayError('Please enter a valid email address.', signInContainer);
  }
  if (!isValidPassword(password)) {
    return displayError('Password must be at least 6 characters long.', signInContainer);
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('User signed in:', userCredential.user);
      closeModal();
    })
    .catch((error) => {
      console.error('Sign-In Error:', error); // Log the error for debugging
      handleSignInError(error); // Handle errors
    });
});

function handleSignInError(error) {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address. Please enter a valid email.',
    'auth/invalid-login-credentials': 'Incorrect password. Please try again.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
    'auth/internal-error': 'An unexpected error occurred. Please try again later.',
  };

  // Use Firebase error code to map a user-friendly message
  const message = errorMessages[error.code] || 'An unknown error occurred. Please try again.';
  displayError(message, signInContainer);
}


function handleSignUpError(error) {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
  };
  const message = errorMessages[error.code] || 'An unexpected error occurred.';
  displayError(message, signUpContainer);
}


// Utility Functions
function displayError(message, container) {
  clearErrors(); // Clear previous errors
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.innerText = message;
  container.appendChild(errorElement);
}

// Display Success Messages
function displaySuccess(message, container) {
  clearErrors(); // Clear previous messages
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.innerText = message;
  container.appendChild(successElement);
}

// Clear Error and Success Messages
function clearErrors() {
  document.querySelectorAll('.error-message, .success-message').forEach((el) => el.remove());
}


// Validate Inputs
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return password.length >= 6;
}

// Sign Out
function signOutUser() {
  signOut(auth)
    .then(() => {
      console.log('User signed out');
      authLink.innerText = 'Sign In';
      document.getElementById('settingsContainer').classList.add('display-off');
      document.getElementById('familyName').innerText = 'Your Name Here';
      initiateTheme();
    })
    .catch((error) => console.error('Error signing out:', error.message));
}

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    authLink.innerText = 'Sign Out';
    document.getElementById('settingsContainer').classList.remove('display-off');
    getLastName();
    initiateTheme();
  } else {
    authLink.innerText = 'Sign In';
    document.getElementById('settingsContainer').classList.add('display-off');
  }
});

// Modal Utilities
function closeModal() {
  modal.style.display = 'none';
  clearErrors();
}


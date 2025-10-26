// backend/authModal.js
import { signOutUser } from './auth.js'; // reuse the exported function

// Modal bits
const modal = document.getElementById('authModal');
const authLink = document.getElementById('authLink');
const closeBtn = document.querySelector('.close');

const signInContainer = document.getElementById('sign-in-container');
const signUpContainer = document.getElementById('sign-up-container');

const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');

function toggleModal(show) {
  modal.style.display = show ? 'block' : 'none';
  modal.setAttribute('aria-hidden', show ? 'false' : 'true');
  if (show) {
    signInContainer.style.display = 'flex';
    signUpContainer.style.display = 'none';
  }
}

export function switchToForm(showContainer, hideContainer) {
  hideContainer.style.display = 'none';
  showContainer.style.display = 'flex';
}

// Open modal (only if not signed in)
authLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (authLink.innerText === 'Sign Out') {
    signOutUser();
  } else {
    toggleModal(true);
  }
});

closeBtn?.addEventListener('click', () => toggleModal(false));

switchToSignUp?.addEventListener('click', (e) => {
  e.preventDefault();
  switchToForm(signUpContainer, signInContainer);
});
switchToSignIn?.addEventListener('click', (e) => {
  e.preventDefault();
  switchToForm(signInContainer, signUpContainer);
});

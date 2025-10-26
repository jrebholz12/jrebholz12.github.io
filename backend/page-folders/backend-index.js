import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';




export function toggleSettings(){
  let box = document.getElementById('settingsBox')
  if(box.classList.contains('display-off')){
    box.classList.remove('display-off')
  } else {
    box.classList.add('display-off')
  }
  console.log(box.classList)
  console.log(document.getElementById('settingsContainer').innerHTML)
}
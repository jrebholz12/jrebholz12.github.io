//Imports needed functions from backend and global
import { saveRecipe, printRecipe, deleteRecipe, addIngredient, populateRecipeBox, addField, previewImage, searchRecipes, showHelp } from '../backend/page-folders/backend-add-recipe.js'
import { getLastName } from '../backend/docs.js';
import { sortTabs } from "../backend/page-folders/global-js.js"
import { auth } from '../backend/firebase.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'


//On Start-up
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user);
    // Handle the signed-in user and update the UI accordingly
  } else {
    console.log("No user is signed in.");
    // Redirect to login page if necessary
  }
});

getLastName()
sortTabs('recipeBox', 'recipe-box');




//Event Listeners
const fields = [
  { id: 'id-title', fieldName: 'title' },
  { id: 'id-website', fieldName: 'website' },
  { id: 'id-cuisine', fieldName: 'cuisine' },
  { id: 'id-servings', fieldName: 'servings' },
  { id: 'id-picture', fieldName: 'picture' }
];

fields.forEach(({ id, fieldName }) => {
  const element = document.getElementById(id);
  
  ['keydown', 'blur'].forEach(eventType => {
    element.addEventListener(eventType, (event) => addField(event, fieldName));
  });
});





document.getElementById('previewImageUpload').addEventListener('click', previewImage)

// scripts/add-recipe.js (replace your DOMContentLoaded block with this)
function attachIngredientListeners() {
  ['keydown', 'blur'].forEach((eventType) => {
    const qEl = document.getElementById('id-quantity');
    const uEl = document.getElementById('id-unit');
    const iEl = document.getElementById('id-ingredient');

    if (qEl) qEl.addEventListener(eventType, (e) => addIngredient(e, 'quantity'));
    if (uEl) uEl.addEventListener(eventType, (e) => addIngredient(e, 'unit'));
    if (iEl) iEl.addEventListener(eventType, (e) => addIngredient(e, 'ingredient'));
  });
  console.log('[attachIngredientListeners] attached');
}

// Run now if DOM is ready; otherwise wait.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachIngredientListeners);
} else {
  attachIngredientListeners();
}




document.getElementById('saveButton').addEventListener('click', saveRecipe)
document.getElementById('printButton').addEventListener('click', printRecipe)
document.getElementById('deleteButton').addEventListener('click', deleteRecipe)

document.getElementById('cutting-search').addEventListener('keyup', searchRecipes)

document.getElementById('ingredientQuestion').addEventListener('mouseover', () => showHelp('ingredient'));
document.getElementById('ingredientQuestion').addEventListener('mouseout', () => showHelp('ingredient'));

document.getElementById('unitQuestion').addEventListener('mouseover', () => showHelp('unit'));
document.getElementById('unitQuestion').addEventListener('mouseout', () => showHelp('unit'));

document.getElementById('quantityQuestion').addEventListener('mouseover', () => showHelp('quantity'));
document.getElementById('quantityQuestion').addEventListener('mouseout', () => showHelp('quantity'));











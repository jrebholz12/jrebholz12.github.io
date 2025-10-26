//Imports needed functions from backend and global
import { saveRecipe, printRecipe, deleteRecipe, addIngredient, populateRecipeBox, addField, previewImage, searchRecipes, showHelp } from '../backend/page-folders/backend-add-recipe.js'
import { getLastName } from '../backend/docs.js';
import { sortTabs } from "../backend/page-folders/global-js.js"
import { auth } from '../backend/firebase.js'
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js'


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

document.addEventListener('DOMContentLoaded', () => {
  ['keydown', 'blur'].forEach(eventType => {
    const quantityElement = document.getElementById('id-quantity');
    const unitElement = document.getElementById('id-unit');
    const ingredientElement = document.getElementById('id-ingredient');
  
    if (quantityElement) {
      quantityElement.addEventListener(eventType, (event) => addIngredient(event, 'quantity'));
    }
  
    if (unitElement) {
      unitElement.addEventListener(eventType, (event) => addIngredient(event, 'unit'));
    }
  
    if (ingredientElement) {
      ingredientElement.addEventListener(eventType, (event) => addIngredient(event, 'ingredient'));
    }
  });  
});



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











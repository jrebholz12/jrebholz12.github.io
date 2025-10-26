import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { transformRecipeList } from '../recipelist.js';

// Global variable for recipeList
let recipeList = [];

// Function to get the recipe list from Firestore or initialize it if it doesn't exist
export async function getRecipeList(user) {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid, 'data', 'recipeList');

    try {
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        recipeList = data.recipeList || []; // Get the recipe list or set as an empty array if it doesn't exist
        console.log('User recipes:', recipeList);

        if (recipeList.length > 0) {
          console.log('Recipes found');
        } else {
          console.log('No recipes found, initializing with an empty list.');
        }
        recipeList = transformRecipeList(recipeList)
        sortRandom()
        importCuisines()
      } else {
        console.log("No recipeList document found for this user, initializing with an empty list.");
        recipeList = [];
        await setDoc(userDocRef, { recipeList: recipeList });
        sortRandom()
        importCuisines()
      }

    } catch (error) {
      console.error("Error fetching recipeList from Firestore: ", error);
    }

  } else {
    console.log("No user is signed in.");
  }
}

// Call this function when the user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user);
    getRecipeList(user); // Fetch the user's recipes after they sign in
  } else {
    console.log("No user is signed in.");
  }
});



// Global Variables for browsing a recipe
let shoppingRecipeList = []
let searchList = []
let searchIndexList = []
let indexList = []
let ingid = 0
let searchItems = []
let finalIngredientList = []
let finalQuantityList = []
let finalUnitList = []
let finalFinalList = JSON.parse(localStorage.getItem('finalFinalList')) || []
let shoppingHTML = ''


//Export Functions

export function setShoppingListTitles(){
  let shoppingListTitles = document.getElementById('nextPage')
  localStorage.setItem('shoppingListTitles', shoppingListTitles.innerHTML);
  console.log(shoppingListTitles)
}

export function reHighlightClasses(){
  let array = document.getElementsByClassName('recipe-popup-list')
  let ids = []
  for(let i=0; i<array.length; i++){
  let stringType = array[i].outerHTML
  stringType = stringType.substring(0, stringType.indexOf('>'))
  let numbers = stringType.match(/\d/g)
  numbers = numbers.join("")
  ids.push(numbers)
  }
  //console.log(ids)
  
  for(let i=0; i<ids.length; i++){
    let id = ids[i]
    let box = document.getElementById(`box${id}`)
    let quantity = document.getElementById(`quantityContainer${id}`)
    if(box !== null){
    box.classList.add('title-and-picture-selected')
    box.classList.remove('title-and-picture')
    quantity.classList.add('display-on')
    }
  }

}





export function importCuisines(){
  let cuisineList = []
  cuisineList = []
  for(let i = 0; i<recipeList.length; i++){
    if(cuisineList.includes(recipeList[i].cuisine)){
  } else{
    cuisineList.push(recipeList[i].cuisine)
    }
  }
  cuisineList.sort()
  //console.log(cuisineList)
  let location = document.getElementById('cuisineContainer')
  location.innerHTML=''
  for(let i=0; i<cuisineList.length; i++){
    let html = `<div id="cuisinee${cuisineList[i]}" class="cuisine-list">${toTitleCase(cuisineList[i])}</div>`
    location.insertAdjacentHTML('beforeend', html)
    // Select the newly created element
    const newElement = document.getElementById(`cuisinee${cuisineList[i]}`);
    
    // Add an event listener to the new element using an arrow function
    newElement.addEventListener('click', () => sortCuisines(`${cuisineList[i]}`));
  }
}


export function findTitle() {
  let gridContainer = document.getElementById('recipeGrid');
  gridContainer.innerHTML = '';  // Clear any existing content
  
  for (let i = 0; i < recipeList.length; i++) {
    let newRecipeTitle = recipeList[i].title;
    let newRecipePicture = recipeList[i].picture;

    let html = `
      <div class="recipe-box-container">
        <div id="box${i}" class="title-and-picture">
          <img id="picture${i}" src="${newRecipePicture}" class="recipe-picture">
          <div id="name${i}" class="just-name">${toTitleCase(newRecipeTitle)}</div>
        </div>
        <div id="quantityContainer${i}" class="quantity-container">
          <div id="minusButton${i}" class="minus-button">-</div><div>/</div>
          <div id="plusButton${i}" class="plus-button">+</div>
        </div>
        <div id="previewButton${i}" class="preview-button"><p>Preview</p></div>
      </div>`;

    gridContainer.insertAdjacentHTML("beforeend", html);

    // Add event listeners for each recipe card
    document.getElementById(`box${i}`).addEventListener('click', () => addToRecipeBox(`${i}`));
    document.getElementById(`minusButton${i}`).addEventListener('click', () => subtractQuantity(`${i}`));
    document.getElementById(`plusButton${i}`).addEventListener('click', () => addQuantity(`${i}`));
    document.getElementById(`previewButton${i}`).addEventListener('click', () => showPreview(`${i}`));
  }
}


function sortCuisines(cuisine){

  document.getElementById('search-bar-input').value = cuisine
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    which: 13, 
    keyCode: 13,
  });

  document.getElementById('search-bar-input').dispatchEvent(event);

}


export function ingredientSearch(event) {
  let ingredientBox = document.getElementById('ingLocation');
  const id = ingid
  if (searchList.length < 1) {
    if (event.key === "Enter" && document.getElementById('search-bar-input').value.trim() !== "") {
      let searchtext = document.getElementById('search-bar-input').value.toLowerCase();
      searchItems.push(searchtext);
      
      let html = `<div id="ingredientName${id}" class="search-ingredient"><strong>x </strong><div id="nameName${id}" class="search-ingredient-name">${searchtext}</div></div>`;
      
      ingredientBox.insertAdjacentHTML("beforeend", html);
      
      // Select the newly created element
      const newElement = document.getElementById(`ingredientName${id}`);
      
      // Add an event listener to the new element using an arrow function
      newElement.addEventListener('click', () => deleteSearch(`${id}`));
      ingid++;
      document.getElementById('search-bar-input').value = "";

      // Search through the recipe list
      loop1: for (let i = 0; i < recipeList.length; i++) {
        let ingredientsList = recipeList[i].ingredients[0];
        loop2: for (let t = 0; t < ingredientsList.length; t++) {
          if (recipeList[i].ingredients[0][t].includes(searchtext) || recipeList[i].title.includes(searchtext) || recipeList[i].cuisine.includes(searchtext)) {
            indexList.push(i);
            continue loop1;
          } else {
            continue loop2;
          }
        }
      }

      // Populate searchList and searchIndexList with the matching recipes
      for (let i = 0; i < indexList.length; i++) {
        searchList.push(recipeList[indexList[i]]);
        searchIndexList.push(indexList[i]);
      }

      // Clear the recipeGrid container
      document.getElementById('recipeGrid').innerHTML = '';

      // Populate the recipeGrid with the matching recipes
      for (let i = 0; i < indexList.length; i++) {
        let newRecipeTitle = recipeList[indexList[i]].title;
        let newRecipePicture = recipeList[indexList[i]].picture;
        let html = `
          <div class="recipe-box-container">
            <div id="box${indexList[i]}" class="title-and-picture">
              <img id="picture${indexList[i]}" src="${newRecipePicture}" class="recipe-picture">
              <div id="name${indexList[i]}" class="just-name">${toTitleCase(newRecipeTitle)}</div>
            </div>
            <div id="quantityContainer${indexList[i]}" class="quantity-container">
              <div id="quantitySub${indexList[i]}" class="minus-button">-</div>
              <div>/</div>
              <div id="quantityAdd${indexList[i]}" class="plus-button">+</div>
            </div>
            <div id="previewShow${indexList[i]}" class="preview-button"><p>Preview</p></div>
          </div>`;

        // Insert the recipe box into the recipeGrid
        document.getElementById('recipeGrid').insertAdjacentHTML("beforeend", html);

        // Add event listeners to the newly created elements
        document.getElementById(`box${indexList[i]}`).addEventListener('click', () => addToRecipeBox(indexList[i]));
        document.getElementById(`quantitySub${indexList[i]}`).addEventListener('click', () => subtractQuantity(indexList[i]));
        document.getElementById(`quantityAdd${indexList[i]}`).addEventListener('click', () => addQuantity(indexList[i]));
        document.getElementById(`previewShow${indexList[i]}`).addEventListener('click', () => showPreview(indexList[i]));
      }
      reHighlightClasses();
    }
  } else {
    // Logic for when there are multiple search items already present
    if (event.key === "Enter" && document.getElementById('search-bar-input').value.trim() !== "") {
      let searchtext = document.getElementById('search-bar-input').value;
      let html = `<div id="ingredientName${ingid}" class="search-ingredient"><strong>x </strong><div id="nameName${id}" class="search-ingredient-name">${searchtext}</div></div>`;
      
      searchItems.push(searchtext);
      ingredientBox.insertAdjacentHTML("beforeend", html);

      // Select the newly created element
      const newElement1 = document.getElementById(`ingredientName${id}`);
      
      // Add an event listener to the new element using an arrow function
      newElement1.addEventListener('click', () => deleteSearch(`${id}`));
      ingid++;

      document.getElementById('search-bar-input').value = "";
      let intermediateIng = [];
      let intermediateIndex = [];

      loop1: for (let i = 0; i < searchList.length; i++) {
        let ingredientsList = searchList[i].ingredients[0];
        loop2: for (let t = 0; t < ingredientsList.length; t++) {
          if (searchList[i].ingredients[0][t].includes(searchtext) || searchList[i].title.includes(searchtext) || searchList[i].cuisine.includes(searchtext)) {
            intermediateIndex.push(searchIndexList[i]);
            intermediateIng.push(searchList[i]);
            continue loop1;
          } else {
            continue loop2;
          }
        }
      }

      searchIndexList = intermediateIndex;
      searchList = intermediateIng;

      // Clear the recipeGrid container
      document.getElementById('recipeGrid').innerHTML = '';

      // Repopulate the recipeGrid with updated search results
      for (let i = 0; i < searchIndexList.length; i++) {
        let newRecipeTitle = recipeList[searchIndexList[i]].title;
        let newRecipePicture = recipeList[searchIndexList[i]].picture;
        let html = `
          <div class="recipe-box-container">
            <div id="box${searchIndexList[i]}" class="title-and-picture">
              <img id="picture${searchIndexList[i]}" src="${newRecipePicture}" class="recipe-picture">
              <div id="name${searchIndexList[i]}" class="just-name">${toTitleCase(newRecipeTitle)}</div>
            </div>
            <div id="quantityContainer${searchIndexList[i]}" class="quantity-container">
              <div id="quantitySubtract${searchIndexList[i]}" class="minus-button">-</div>
              <div>/</div>
              <div id="quantityAddition${searchIndexList[i]}" class="plus-button">+</div>
            </div>
            <div id="previewShowing${searchIndexList[i]}" class="preview-button"><p>Preview</p></div>
          </div>`;

        document.getElementById('recipeGrid').insertAdjacentHTML("beforeend", html);

        document.getElementById(`box${searchIndexList[i]}`).addEventListener('click', () => addToRecipeBox(searchIndexList[i]));
        document.getElementById(`quantitySubtract${searchIndexList[i]}`).addEventListener('click', () => subtractQuantity(searchIndexList[i]));
        document.getElementById(`quantityAddition${searchIndexList[i]}`).addEventListener('click', () => addQuantity(searchIndexList[i]));
        document.getElementById(`previewShowing${searchIndexList[i]}`).addEventListener('click', () => showPreview(searchIndexList[i]));
      }
      reHighlightClasses();
    }
  }
}



function deleteSearch(id) {
  console.log(id)
  let search = document.getElementById(`nameName${id}`).innerHTML;
  document.getElementById(`ingredientName${id}`).remove();
  console.log(search + "$$");

  if (searchItems.length === 1) {
    searchList = [];
    searchIndexList = [];
    indexList = [];
    searchItems = [];
    sortRandom();
    return;
  }

  for (let i = 0; i < searchItems.length; i++) {
    if (search === searchItems[i]) {
      searchItems.splice(i, 1);
      i--;
      console.log(searchItems);
    }

    searchList = [];
    indexList = [];
    searchIndexList = [];

    for (let i = 0; i < searchItems.length; i++) {
      let name = searchItems[i];

      if (searchList.length < 1) {
        let searchtext = name;
        loop1: for (let i = 0; i < recipeList.length; i++) {
          let ingredientsList = recipeList[i].ingredients[0];
          loop2: for (let t = 0; t < ingredientsList.length; t++) {
            if (recipeList[i].ingredients[0][t].includes(searchtext) || recipeList[i].title.includes(searchtext) || recipeList[i].cuisine.includes(searchtext)) {
              indexList.push(i);
              continue loop1;
            } else continue loop2;
          }
        }

        for (let i = 0; i < indexList.length; i++) {
          searchList.push(recipeList[indexList[i]]);
          searchIndexList.push(indexList[i]);
        }

        // Clear the recipe grid
        document.getElementById('recipeGrid').innerHTML = '';

        for (let i = 0; i < indexList.length; i++) {
          let newRecipeTitle = recipeList[indexList[i]].title;
          let newRecipePicture = recipeList[indexList[i]].picture;
          let html = `
          <div class="recipe-box-container">
              <div onclick="addToRecipeBox(${indexList[i]})" id="box${indexList[i]}" class="title-and-picture">
                <img id="picture${indexList[i]}" src="${newRecipePicture}" class="recipe-picture">
                <div id="name${indexList[i]}" class="just-name">${toTitleCase(newRecipeTitle)}</div>
              </div>
              <div id="quantityContainer${indexList[i]}" class="quantity-container">
                <div onclick="subtractQuantity(${indexList[i]})" class="minus-button">-</div>
                <div>/</div>
                <div onclick="addQuantity(${indexList[i]})" class="plus-button">+</div>
              </div>
              <div onclick="showPreview(${indexList[i]})" class="preview-button"><p>Preview</p></div>
          </div>
          `;

          // Insert into recipeGrid
          document.getElementById('recipeGrid').insertAdjacentHTML("beforeend", html);
        }

        reHighlightClasses();
      } else {
        let searchtext = name;
        let intermediateIng = [];
        let intermediateIndex = [];

        loop1: for (let i = 0; i < searchList.length; i++) {
          let ingredientsList = searchList[i].ingredients[0];
          loop2: for (let t = 0; t < ingredientsList.length; t++) {
            if (searchList[i].ingredients[0][t].includes(searchtext) || searchList[i].title.includes(searchtext) || searchList[i].cuisine.includes(searchtext)) {
              intermediateIndex.push(searchIndexList[i]);
              intermediateIng.push(searchList[i]);
              continue loop1;
            } else continue loop2;
          }
        }

        searchIndexList = intermediateIndex;
        searchList = intermediateIng;

        indexList = searchIndexList;

        // Clear the recipe grid
        document.getElementById('recipeGrid').innerHTML = '';

        for (let i = 0; i < indexList.length; i++) {
          let newRecipeTitle = recipeList[indexList[i]].title;
          let newRecipePicture = recipeList[indexList[i]].picture;
          let html = `
          <div class="recipe-box-container">
              <div onclick="addToRecipeBox(${indexList[i]})" id="box${indexList[i]}" class="title-and-picture">
                <img id="picture${indexList[i]}" src="${newRecipePicture}" class="recipe-picture">
                <div id="name${indexList[i]}" class="just-name">${toTitleCase(newRecipeTitle)}</div>
              </div>
              <div id="quantityContainer${indexList[i]}" class="quantity-container">
                <div onclick="subtractQuantity(${indexList[i]})" class="minus-button">-</div>
                <div>/</div>
                <div onclick="addQuantity(${indexList[i]})" class="plus-button">+</div>
              </div>
              <div onclick="showPreview(${indexList[i]})" class="preview-button"><p>Preview</p></div>
          </div>
          `;

          // Insert into recipeGrid
          document.getElementById('recipeGrid').insertAdjacentHTML("beforeend", html);
        }

        reHighlightClasses();
      }
    }
  }
  console.log(searchList);
  console.log(indexList);
  console.log(searchItems);
}






export function clearSearch(){
  document.getElementById("ingLocation").innerHTML = ""
  searchList = []
  searchIndexList = []
  indexList = []
  searchItems = []
}

export function sortAZ() {
  clearSearch();  // Clear any previous search filters
  
  let gridContainer = document.getElementById('recipeGrid');
  gridContainer.innerHTML = '';  // Clear the grid
  
  // Sort the recipes alphabetically, but keep the original index for consistent IDs
  let sortedRecipes = [...recipeList].sort((a, b) => a.title.localeCompare(b.title));

  sortedRecipes.forEach((recipe) => {
    const originalIndex = recipeList.indexOf(recipe);  // Get the original index of the recipe

    let html = `
      <div class="recipe-box-container">
        <div id="box${originalIndex}" class="title-and-picture">
          <img id="picture${originalIndex}" src="${recipe.picture}" class="recipe-picture">
          <div id="name${originalIndex}" class="just-name">${toTitleCase(recipe.title)}</div>
        </div>
        <div id="quantityContainer${originalIndex}" class="quantity-container">
          <div id="minusButton${originalIndex}" class="minus-button">-</div><div>/</div>
          <div id="plusButton${originalIndex}" class="plus-button">+</div>
        </div>
        <div id="previewButton${originalIndex}" class="preview-button"><p>Preview</p></div>
      </div>`;

    gridContainer.insertAdjacentHTML("beforeend", html);

    // Add event listeners using the original index
    document.getElementById(`box${originalIndex}`).addEventListener('click', () => addToRecipeBox(`${originalIndex}`));
    document.getElementById(`minusButton${originalIndex}`).addEventListener('click', () => subtractQuantity(`${originalIndex}`));
    document.getElementById(`plusButton${originalIndex}`).addEventListener('click', () => addQuantity(`${originalIndex}`));
    document.getElementById(`previewButton${originalIndex}`).addEventListener('click', () => showPreview(`${originalIndex}`));
  });
    reHighlightClasses();

}



export function sortOldToNew() {
  clearSearch();  // Clear any previous search filters

  let gridContainer = document.getElementById('recipeGrid');
  gridContainer.innerHTML = '';  // Clear the grid

  // Recipes are already in the order from old to new, so we just display them
  recipeList.forEach((recipe) => {
    const originalIndex = recipeList.indexOf(recipe);  // Get the original index of the recipe

    let html = `
      <div class="recipe-box-container">
        <div id="box${originalIndex}" class="title-and-picture">
          <img id="picture${originalIndex}" src="${recipe.picture}" class="recipe-picture">
          <div id="name${originalIndex}" class="just-name">${toTitleCase(recipe.title)}</div>
        </div>
        <div id="quantityContainer${originalIndex}" class="quantity-container">
          <div id="minusButton${originalIndex}" class="minus-button">-</div><div>/</div>
          <div id="plusButton${originalIndex}" class="plus-button">+</div>
        </div>
        <div id="previewButton${originalIndex}" class="preview-button"><p>Preview</p></div>
      </div>`;

    gridContainer.insertAdjacentHTML("beforeend", html);

    // Add event listeners using the original index
    document.getElementById(`box${originalIndex}`).addEventListener('click', () => addToRecipeBox(`${originalIndex}`));
    document.getElementById(`minusButton${originalIndex}`).addEventListener('click', () => subtractQuantity(`${originalIndex}`));
    document.getElementById(`plusButton${originalIndex}`).addEventListener('click', () => addQuantity(`${originalIndex}`));
    document.getElementById(`previewButton${originalIndex}`).addEventListener('click', () => showPreview(`${originalIndex}`));
  });

  // Delay the reHighlightClasses to ensure the DOM has fully updated
  setTimeout(() => {
    reHighlightClasses();
  }, 0);  // Minimal delay to ensure reHighlightClasses runs after DOM updates
}



export function randomSort(array){
  let currentIndex = array.length
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  console.log(array)
  console.log(recipeList)
  return array
}

export function sortRandom() {
  clearSearch();  // Clear any previous search filters

  let gridContainer = document.getElementById('recipeGrid');
  gridContainer.innerHTML = '';  // Clear the grid

  // Shuffle the recipes but keep track of their original indices
  let randomOrder = randomSort([...recipeList]);  // Shuffle the recipes
  
  randomOrder.forEach((recipe) => {
    const originalIndex = recipeList.indexOf(recipe);  // Get the original index of the recipe

    let html = `
      <div class="recipe-box-container">
        <div id="box${originalIndex}" class="title-and-picture">
          <img id="picture${originalIndex}" src="${recipe.picture}" class="recipe-picture">
          <div id="name${originalIndex}" class="just-name">${toTitleCase(recipe.title)}</div>
        </div>
        <div id="quantityContainer${originalIndex}" class="quantity-container">
          <div id="minusButton${originalIndex}" class="minus-button">-</div><div>/</div>
          <div id="plusButton${originalIndex}" class="plus-button">+</div>
        </div>
        <div id="previewButton${originalIndex}" class="preview-button"><p>Preview</p></div>
      </div>`;

    gridContainer.insertAdjacentHTML("beforeend", html);

    // Add event listeners using the original index
    document.getElementById(`box${originalIndex}`).addEventListener('click', () => addToRecipeBox(`${originalIndex}`));
    document.getElementById(`minusButton${originalIndex}`).addEventListener('click', () => subtractQuantity(`${originalIndex}`));
    document.getElementById(`plusButton${originalIndex}`).addEventListener('click', () => addQuantity(`${originalIndex}`));
    document.getElementById(`previewButton${originalIndex}`).addEventListener('click', () => showPreview(`${originalIndex}`));
  });
    reHighlightClasses();
}





export function sortNewToOld() {
  clearSearch();  // Clear any previous search filters

  let gridContainer = document.getElementById('recipeGrid');
  gridContainer.innerHTML = '';  // Clear the grid

  let reversedRecipes = [...recipeList].reverse();  // Reverse the recipe list for new to old

  reversedRecipes.forEach((recipe) => {
    const originalIndex = recipeList.indexOf(recipe);  // Get the original index of the recipe

    let html = `
      <div class="recipe-box-container">
        <div id="box${originalIndex}" class="title-and-picture">
          <img id="picture${originalIndex}" src="${recipe.picture}" class="recipe-picture">
          <div id="name${originalIndex}" class="just-name">${toTitleCase(recipe.title)}</div>
        </div>
        <div id="quantityContainer${originalIndex}" class="quantity-container">
          <div id="minusButton${originalIndex}" class="minus-button">-</div><div>/</div>
          <div id="plusButton${originalIndex}" class="plus-button">+</div>
        </div>
        <div id="previewButton${originalIndex}" class="preview-button"><p>Preview</p></div>
      </div>`;

    gridContainer.insertAdjacentHTML("beforeend", html);

    // Add event listeners using the original index
    document.getElementById(`box${originalIndex}`).addEventListener('click', () => addToRecipeBox(`${originalIndex}`));
    document.getElementById(`minusButton${originalIndex}`).addEventListener('click', () => subtractQuantity(`${originalIndex}`));
    document.getElementById(`plusButton${originalIndex}`).addEventListener('click', () => addQuantity(`${originalIndex}`));
    document.getElementById(`previewButton${originalIndex}`).addEventListener('click', () => showPreview(`${originalIndex}`));
  });

  // Delay the reHighlightClasses to ensure the DOM has fully updated
  setTimeout(() => {
    reHighlightClasses();
  }, 0);  // Minimal delay to ensure reHighlightClasses runs after DOM updates
}





export function addToRecipeBox(indexNumber){
  let recipeName = document.getElementById(`name${indexNumber}`)
  let boxClass = document.getElementById(`box${indexNumber}`)
  let nextPage = document.getElementById('nextPage')
  let quantityBox = document.getElementById(`quantityContainer${indexNumber}`)
  let html = `<div id="${indexNumber}popup" class="recipe-popup-list">${recipeName.innerText}</div>`
  if(boxClass.classList.contains('title-and-picture-selected')){
    boxClass.classList.remove('title-and-picture-selected')
    boxClass.classList.add('title-and-picture')
    quantityBox.classList.remove('display-on')
    recipeName.classList.add('recipe-hover')
    document.getElementById(`${indexNumber}popup`).innerHTML = ''
    document.getElementById(`${indexNumber}popup`).outerHTML = ''
    loop1: for(let i=0; i<shoppingRecipeList.length; i++){
      if(shoppingRecipeList[i].title === recipeName.innerText.toLowerCase()){
        shoppingRecipeList.splice(i,1)
        i= i-1
        continue loop1;
      } else {continue loop1}
    }   


  } else{
    boxClass.classList.add('title-and-picture-selected')
    boxClass.classList.remove('title-and-picture')
    quantityBox.classList.add('display-on')
    nextPage.insertAdjacentHTML("beforeend", html)
    for(let i=0; i<recipeList.length; i++){
      if(recipeList[i].title === recipeName.innerText.toLowerCase()){
        shoppingRecipeList.push(recipeList[i])
      } else {}
    }
  
  }
  showGetIngredients()
  localStorage.setItem('shoppingRecipeList', JSON.stringify(shoppingRecipeList))
  setShoppingListTitles()
}

export function addQuantity(index){
  shoppingRecipeList.push(recipeList[index])
  let location = document.getElementById(`${index}quantity`)
  let newLocation = document.getElementById(`${index}popup`)
  let html = `<div id="${index}x" class="x-quantity">x</div><div class="recipes-quantity" id="${index}quantity">2</div>`
  if(location === null){
    newLocation.insertAdjacentHTML("beforeend", html)
  } else {
    let newHTML = Number(location.innerHTML) + 1
    location.innerHTML = `${newHTML}`
  }
  setShoppingListTitles()
}

export function subtractQuantity(index){
  let boxClass = document.getElementById(`box${index}`)
  let quantityBox = document.getElementById(`quantityContainer${index}`)
  let recipeName = document.getElementById(`name${index}`)
  let quant = 0
  for(let i = 0; i<shoppingRecipeList.length; i++){
    if(shoppingRecipeList[i].title === recipeName.innerText.toLowerCase()){
      quant++}}
    for(let i = 0; i<shoppingRecipeList.length; i++){
      if(shoppingRecipeList[i].title === recipeName.innerText.toLowerCase()){
        shoppingRecipeList.splice(i,1)
        quant = quant - 1
        //groceryTitles.splice(index, 1)
        showGetIngredients()
        //localStorage.setItem('groceryTitles', JSON.stringify(groceryTitles))
        break;
      }
    }
  let location = document.getElementById(`${index}quantity`)
  if(location !== null){
  let newHTML = Number(location.innerHTML) - 1
  location.innerHTML = `${newHTML}`
  if(location.innerHTML === '1'){
    document.getElementById(`${index}x`).innerHTML = ''
    document.getElementById(`${index}quantity`).innerHTML = ''
  } else{}
} 

  if(quant === 0){
    boxClass.classList.remove('title-and-picture-selected')
    boxClass.classList.add('title-and-picture')
    quantityBox.classList.remove('display-on')
    recipeName.classList.add('recipe-hover')
    document.getElementById(`${index}popup`).innerHTML = ''
    document.getElementById(`${index}popup`).outerHTML = ''
  } else{}
showGetIngredients() 
setShoppingListTitles()
}

export function showPreview(index) {
  let recipeName = recipeList[index].title;
  let recipeWebsite = recipeList[index].website;
  let recipeCuisine = recipeList[index].cuisine;
  let recipePicture = recipeList[index].picture;
  let recipeServings = recipeList[index].servings;
  let recipeNotes = recipeList[index].notes;
  let insertArea = document.getElementById('recipePreview');
  let checkArea = document.getElementById('previewContainer');

  console.log(recipeList[index]);
  console.log(recipeNotes);
  console.log(recipePicture);
  console.log(index);

  if (checkArea !== null) {
    checkArea.innerHTML = '';
  }

  insertArea.classList.add('display-on');

  let html = `<div id="previewContainer" class="preview-contents">
    <div class="preview-title">${toTitleCase(recipeName)}</div>
    <div class="preview-website">${toTitleCase(recipeWebsite)}</div>
    <div class="preview-servings">${toTitleCase(recipeServings)} servings</div>
    <div class="preview-cuisine">${toTitleCase(recipeCuisine)}</div>
    <div id="ingredientPreviewContainer" class="ingredient-preview-container"></div>
  </div>`;

  insertArea.insertAdjacentHTML("afterbegin", html);

  // Add ingredients to the preview
  let ingredientInputArea = document.getElementById('ingredientPreviewContainer');
  for (let v = 0; v < recipeList[index].ingredients[0].length; v++) {
    let line = ` ${String(recipeList[index].ingredients[0][v])}, ${String(recipeList[index].ingredients[1][v])} ${String(recipeList[index].ingredients[2][v])}`;
    let uppercaseLine = toTitleCase(line);
    let ingredientHTML = `<div class="preview-ingredient">${uppercaseLine}</div>`;
    ingredientInputArea.insertAdjacentHTML("beforeend", ingredientHTML);
  }

  // Add Notes link if notes exist
  if (recipeNotes && recipeNotes.trim() !== "") {
    let notesLinkHTML = `<div class="preview-notes-link" style="text-align: center;"><a href="#" id="showNotes" style="text-decoration: underline; color: blue; cursor: pointer;">Notes</a></div>`;
    document.getElementById('previewContainer').insertAdjacentHTML("beforeend", notesLinkHTML);

    // Add click listener for the Notes link
    document.getElementById('showNotes').addEventListener('click', function (e) {
      e.preventDefault();
      showNotes(recipeNotes);
    });
  }
}

function showNotes(notes) {
  let previewContainer = document.getElementById('previewContainer');
  if (previewContainer) {
    previewContainer.innerHTML = `<div class="preview-notes">${notes}</div>
      <div class="preview-notes-link" style="text-align: center;"><a href="#" id="showIngredients" style="text-decoration: underline; color: blue; cursor: pointer;">Ingredients</a></div>`;

    // Add click listener for the Ingredients link
    document.getElementById('showIngredients').addEventListener('click', function () {
      const currentIndex = recipeList.findIndex(recipe => recipe.notes === notes);
      showPreview(currentIndex);
    });
  }
}

export function hidePreview() {
  let insertArea = document.getElementById('recipePreview');
  insertArea.classList.remove('display-on');
}



export function showGetIngredients(){
  let recipeList = document.querySelector('.recipe-popup-list')
  let button = document.getElementById('getIngredients')
  if(recipeList !== null){
    button.classList.add('display-on')
  } else{
    button.classList.remove('display-on')
  }
}

export function populateRecipeShoppingList(){
  console.log('hello world')
  let clearList = localStorage.getItem('fullHTML')
  clearList = ""
  localStorage.setItem('fullHTML', clearList)


  finalIngredientList = []
  finalQuantityList = []
  finalUnitList = []
  finalFinalList = []
  let addButton = document.getElementById('getIngredients')
  addButton.classList.remove('display-on')
  console.log(shoppingRecipeList)

  for (let v=0; v<shoppingRecipeList.length; v++){
    let ingredientsList = shoppingRecipeList[v].ingredients[0]
    let quantityList = shoppingRecipeList[v].ingredients[1]
    let unitsList = shoppingRecipeList[v].ingredients[2]
     loop1: for(let i=0; i<ingredientsList.length; i++){
      let separateIngredient = ingredientsList[i]
      let separateUnit = unitsList[i]
      let separateQuantity = quantityList[i]
      loop2: for(let t=0; t<finalIngredientList.length; t++){
        if(finalIngredientList[t] === separateIngredient || finalIngredientList[t] === (separateIngredient + 's') || finalIngredientList[t] === (separateIngredient.substring(0, separateIngredient.length-1))){
          if(finalUnitList[t] === separateUnit){
            finalQuantityList[t] = Number(finalQuantityList[t]) + Number(separateQuantity)
            continue loop1;
          } else {
            continue loop2;
          }}
        }
        finalIngredientList.push(separateIngredient)
        finalUnitList.push(separateUnit)
        finalQuantityList.push(separateQuantity)
        }
      }

  finalList()

}

export function finalList(){
  console.log('hello World')
  for (let i=0; i<finalIngredientList.length; i++){
  let listItem = String(finalIngredientList[i]) +', ' + String(finalQuantityList[i]) + ' ' + String(finalUnitList[i])
  finalFinalList.push(listItem)
  }
localStorage.setItem('finalFinalList', JSON.stringify(finalFinalList))
console.log(JSON.parse(localStorage.getItem('finalFinalList')))

}

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

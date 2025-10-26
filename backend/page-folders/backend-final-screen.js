import { doc, getDoc, updateDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { formatForFirestore, revertFormattedCategoryList } from '../recipelist.js';

let finalFinalList = JSON.parse(localStorage.getItem('finalFinalList')) || [];
let ingredientCategoryList = [];
let produceList, pantryList, dairyList, meatList, bakingList, otherList; // Declare globally
let otherItemsId = 1

// Function to get the recipe list from Firestore or initialize it if it doesn't exist
export async function getCategoryList(user) {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid, 'data', 'ingredientCategoryList');
    try {
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        let element = data.ingredientCategoryList;
        ingredientCategoryList = revertFormattedCategoryList(element);
        [produceList, pantryList, dairyList, meatList, bakingList, otherList] = ingredientCategoryList;
        console.log('Category List:', ingredientCategoryList);
      } else {
        // Initialize with default values if no document found
        produceList = ["butternut", "poblano", "asparagus", "cauliflower", "fresh cilantro", "fresh parsley", "avocado", "basil", "bay leaf", "bell pepper", "butternut squash", "carrot", "celery", "cilantro", "cucumber", "tomato", "parsley", "jalapeno", "kale", "lemon", "lemon juice", "lime", "lime juice", "onion", "mint", "green onion", "red bell pepper", "rosemary", "red onion", "yellow onion", "white onion", "red potatoes", "red potato", "shallot", "spinach", "broccolini", "sweet potato", "rhubarb", "sage", "tofu", "fresh rosemary", "vegetable broth", "garlic", "baby spinach", "carrots", "extra-firm tofu", "fresh basil", "fresh mint", "fresh sage", "green onions", "lemongrass paste", "poblano pepper", "brussel sprout", "eggplant", "fresh ginger", "fresh thyme", "gold potato", "green beans", "jalapeno", "green bell pepper", "romaine lettuce", "yellow bell pepper", "broccoli", "mushroom", "russet potato", "thyme", "yukon gold potato", "italian parsley", "zucchini", "sweet potatoes", "avocados", "broccoli", "cherry tomato"]; // No `let` or `const` here, just assign the global variable
        pantryList = ["can", "lentils", "farro", "diced tomatoes", "rice", "salsa", "tortilla", "pepita", "mayonnaise", "sriracha", "spaghetti", "linguine", "pasta", "noodle", "vegetable broth", "cannellini beans", "arborio rice", "black beans", "brown basmati rice", "coconut milk", "diced green chilis", "green lentils", "mild salsa verde", "pinto beans", "red salsa", "brown rice", "cream of celery", "crushed tomatoes", "ditalini pasta", "marinara sauce", "orecchiette", "rigatoni", "tomato sauce", "basmati brown rice", "canned coconut milk", "chickpeas", "olive garden italian dressing", "roasted red peppers", "rotini", "salsa verde", "tomato paste", "black bean", "beef broth", "worcestershire sauce", "corn", "corn tortilla", "chicken stock", "fettuccine", "sun-dried tomato", "green chile", "chickpea", "crouton", "diced tomato", "dijon mustard", "lasagna noodles", "maple syrup", "mild honey", "undiluted vegetable broth", "rao's marinara", "jumbo shells", "corn tortillas", "sliced canned jalapenos", "cream of celery soup", "jelly", "peanut butter", "quinoa"];
        dairyList = ["milk", "greek yogurt", "cheese", "parmesan", "butter", "half n half", "creamer", "sour cream", "cream cheese", "egg", "heavy cream", "parmesan cheese", "cheddar cheese", "feta cheese", "monterey jack cheese", "monterey jack cheese", "plain greek yogurt", "cottage cheese", "mozzarella cheese", "plain yogurt", "jack cheese", "half and half", "unsalted butter", "mozzarella", "muenster cheese", "mexican cheese", "white american cheese", "eggs", "fresh squeezed orange juice", "low fat cottage cheese", "low moisture skim mozzarella cheese", "stick of butter", "biscuit can", "parmesean"];
        meatList = ["steak", "chicken", "ground beef", "ground sausage", "turkey", "meat", "fish", "90% lean ground beef", "chicken thigh"];
        bakingList = ["flour", "vinegar", "garlic powder", "cinnamon", "sugar", "seasoning", "worcestershire", "salt", "dried parsley", "baking powder", "corn starch", "nuts", "chili powder", "cumin", "olive oil", "paprika", "sherry vinegar", "oregano", "pepper", "apple cider vinegar", "chili-garlic sauce", "pepitas", "pine nuts", "red wine vinegar", "sliced almonds", "smoked paprika", "cardamom pods", "coriander", "cornstarch", "dried parsley flakes", "garam masala", "honey", "italian seasoning", "rice vinegar", "sesame seeds", "soy sauce", "toasted sesame oil", "turmeric", "vegetable bullion", "worcestershire sauce", "cardamom", "salad sprinkle", "chili garlic sauce", "dried rosemary", "dried thyme", "taco packet", "canola oil", "cashew", "garlic salt", "cayenne pepper", "almond", "baking soda", "black pepper", "chile powder", "coconut oil or olive oil", "dried oregano", "extra-virgin olive oil", "ground cinnamon", "minced onion seasoning", "sea salt", "vanilla extract", "whole wheat pastry flour", "nutmeg", "ground pepper", "red pepper flakes", "taco seasoning packet", "better than bullion", "cayenne"];
        otherList = ['wine'];
        
        ingredientCategoryList = [produceList, pantryList, dairyList, meatList, bakingList, otherList];
        
        const formattedIngredientCategoryList = formatForFirestore(ingredientCategoryList);
        await setDoc(userDocRef, { ingredientCategoryList: formattedIngredientCategoryList });
      }
    } catch (error) {
      console.error("Error fetching ingredientCategoryList from Firestore:", error);
    }
  } else {
    console.log("No user is signed in.");
  }
}


// Function to initialize category lists and insert list into the DOM
async function initializeCategoryListsAndInsert(user) {
  await getCategoryList(user);  // Ensure getCategoryList completes before moving on
  
  // Step 1: Now you can safely use the category lists (produceList, etc.)
  console.log('Initialized Category Lists:', { produceList, pantryList, dairyList, meatList, bakingList, otherList });

  // Step 2: Insert the list into the DOM
  await insertList();  // Insert the list
}

// Insert List into DOM
export async function insertList() {
  console.log("Inserting list...");
  console.log(ingredientCategoryList);

  if (!Array.isArray(finalFinalList) || finalFinalList.length === 0) {
    console.error('finalFinalList is not an array or is empty.');
    return;
  }

  const sortedFinalList = Array.isArray(finalFinalList[0]) ? finalFinalList[0].sort() : finalFinalList.sort();

  let location = '';

  // Function to find the category for an ingredient by checking if it contains any keyword
  function findCategory(ingredient) {
    const lowerCaseIngredient = ingredient.toLowerCase();

    if (ingredientCategoryList[0].some(item => lowerCaseIngredient.includes(item.toLowerCase()))) {
      return document.getElementById("plusContainer-produce");
    } else if (ingredientCategoryList[1].some(item => lowerCaseIngredient.includes(item.toLowerCase()))) {
      return document.getElementById("plusContainer-pantry");
    } else if (ingredientCategoryList[2].some(item => lowerCaseIngredient.includes(item.toLowerCase()))) {
      return document.getElementById("plusContainer-dairy");
    } else if (ingredientCategoryList[3].some(item => lowerCaseIngredient.includes(item.toLowerCase()))) {
      return document.getElementById("plusContainer-meat");
    } else if (ingredientCategoryList[4].some(item => lowerCaseIngredient.includes(item.toLowerCase()))) {
      return document.getElementById("plusContainer-baking");
    } else {
      return document.getElementById("plusContainer-other");
    }
  }

  // Loop through the sortedFinalList and insert ingredients into DOM
  sortedFinalList.forEach((ingredient, v) => {
    const html = `
      <div id="ing${v}" class="shopping-list-ingredient">${ingredient}
        <div id="actionBar${v}" class="action-bar">
          <img src="icons/edit.png" id="editIcon${v}" class="button-bar">
          <div id="moveBar${v}">
            <img src="icons/move.png" class="button-bar">
            <div id="${v}moveList" class="move-list-container">
              ${[...Array(5).keys()].map(i => `<div id="${v}moveList${i + 1}" class="move-list-category"></div>`).join('')}
            </div>
          </div>
          <img id="trashButton${v}" src="icons/trash.png" class="button-bar">
        </div>
      </div>`;

    location = findCategory(ingredient);
    location.insertAdjacentHTML("beforebegin", html);
    attachEventListeners(v);  // Add event listeners dynamically for each action 
    otherItemsId++
  });
}

// Attach event listeners to elements
function attachEventListeners(id) {
  const hoverElement = document.getElementById(`ing${id}`);
  hoverElement.addEventListener('mouseover', () => displayActionBar(id));
  hoverElement.addEventListener('mouseout', () => displayActionBarOff(id));

  const moveBar = document.getElementById(`moveBar${id}`);
  moveBar.addEventListener('mouseover', () => displayMoveBar(id));
  moveBar.addEventListener('mouseout', () => displayMoveBarOff(id));

  document.getElementById(`editIcon${id}`).addEventListener('click', () => editIngredient(id));
  [...Array(5).keys()].forEach(i => {
    document.getElementById(`${id}moveList${i + 1}`).addEventListener('click', () => makeTheMove(`${id}moveList${i + 1}`));
  });

  document.getElementById(`trashButton${id}`).addEventListener('click', () => deleteIngredient(id));
}

// Firebase auth state listener that waits for user to sign in, then runs necessary functions
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User is signed in.");
    try {
      // Step 1: Fetch category list and initialize it
      await initializeCategoryListsAndInsert(user);
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  } else {
    console.log("No user is signed in.");
  }
});




// Export Functions
export function getLength() {
  const lengthArray = [produceList.length, pantryList.length, dairyList.length, meatList.length, bakingList.length];
  maxLength = Math.max(...lengthArray);
}

export function saveList() {
  const saveCount = document.getElementById('numberSaved').childElementCount;
  const saveContent = document.getElementById('fullPage').innerHTML;
  localStorage.setItem(`savedList${saveCount + 1}`, JSON.stringify(saveContent));
  const showSaved = document.getElementById('numberSaved');
  showSaved.insertAdjacentHTML('beforeend', new Date().toString());
}

export function showShoppingListTitles() {
  const location = document.getElementById('shoppingListTitles');
  location.insertAdjacentHTML('beforeend', localStorage.getItem('shoppingListTitles'));
}

export function deselectAll() {
  const checkArea = document.getElementsByClassName('shopping-list-ingredient');
  Array.from(checkArea).forEach((el) => {
    el.classList.toggle('display-on');
    el.classList.toggle('display-off');
  });
}

export function displayOtherItems(paragraph) {
  toggleDisplayState(paragraph, true);
}

export function displayOffOtherItems(paragraph) {
  toggleDisplayState(paragraph, false);
}

export function toggleDisplayState(paragraph, state) {
  const plusButton = document.getElementById(`otherPlusButton-${paragraph}`);
  const minusButton = document.getElementById(`otherMinusButton-${paragraph}`);
  const inputButton = document.getElementById(`otherInputBar-${paragraph}`);

  if (state) {
    plusButton.classList.add('display-off');
    minusButton.classList.add('display-on');
    inputButton.classList.add('display-on');
    inputButton.focus();
  } else {
    plusButton.classList.remove('display-off');
    minusButton.classList.remove('display-on');
    inputButton.classList.remove('display-on');
  }
}

export function addOtherItem(event, paragraph) {
  if (event.key === "Enter") {
    const location = document.getElementById(`plusContainer-${paragraph}`);
    const item = document.getElementById(`otherInputBar-${paragraph}`).value;
    const html = `
      <div id="ing${otherItemsId}" class="shopping-list-ingredient">${item}
        <div id="actionBar${otherItemsId}" class="action-bar">
          <img src="icons/edit.png" id="editIcon${otherItemsId}" class="button-bar">
          <div id="moveBar${otherItemsId}">
            <img src="icons/move.png" class="button-bar">
            <div id="${otherItemsId}moveList" class="move-list-container">
              ${[...Array(5).keys()].map(i => `<div id="${otherItemsId}moveList${i + 1}" class="move-list-category"></div>`).join('')}
            </div>
          </div>
          <img id="trashButton${otherItemsId}" src="icons/trash.png" class="button-bar">
        </div>
      </div>`;

    location.insertAdjacentHTML("beforebegin", html);

    // Add event listeners dynamically
    attachEventListeners(otherItemsId);
    otherItemsId++;
    document.getElementById(`otherInputBar-${paragraph}`).value = '';
    displayOffOtherItems(paragraph);
  }
}

export function editIngredient(index) {
  const location = document.getElementById(`ing${index}`);
  const originalText = location.innerText;
  location.innerHTML = `<input id="editInput${index}" class="edit-input-bar" value="${originalText}">`;
  document.getElementById(`editInput${index}`).focus();
  document.getElementById(`editInput${index}`).addEventListener('keydown', (event) => saveEdit(event, index));
}

export function saveEdit(event, index) {
  if (event.key === "Enter") {
    const editLocation = document.getElementById(`editInput${index}`).value;

    // Rebuild the original structure with the new value from the input
    const updatedHtml = `
      ${editLocation} 
      <div id="actionBar${index}" class="action-bar">
        <img src="icons/edit.png" id="editIcon${index}" class="button-bar">
        <div id="moveBar${index}">
          <img src="icons/move.png" class="button-bar">
          <div id="${index}moveList" class="move-list-container">
            ${[...Array(5).keys()].map(i => `<div id="${index}moveList${i + 1}" class="move-list-category"></div>`).join('')}
          </div>
        </div>
        <img id="trashButton${index}" src="icons/trash.png" class="button-bar">
      </div>
    `;

    const permLocation = document.getElementById(`ing${index}`);
    permLocation.innerHTML = updatedHtml;

    attachEventListeners(index); // Reattach event listeners after updating the HTML
  }
}


// Function to move an item between categories and update Firestore
export async function makeTheMove(index) {
  const location = document.getElementById(index);

  if (!location) {
    console.error(`Element with index ${index} not found.`);
    return;
  }

  const moveLocation = location.innerText.toLowerCase().replace(' ', '') + 'List'; // Ensure correct moveLocation format
  const fullItem = location.closest('.shopping-list-ingredient');

  if (!fullItem) {
    console.error('Full item not found for ingredient');
    return;
  }

  const nameOfItem = fullItem.innerText.split(",")[0]; // Extract the item name before the comma
  const originalCategory = fullItem.closest('.category-list')?.id || ''; // Find the original category

  // Remove the item from the original category list
  if (originalCategory !== 'other') {
    moveCategories(nameOfItem, originalCategory); // Remove the item from the original list
  }

  // Add the item to the new category list based on moveLocation
  let newList;
  switch (moveLocation) {
    case 'produceList':
      newList = produceList;
      break;
    case 'pantryList':
      newList = pantryList;
      break;
    case 'dairyList':
      newList = dairyList;
      break;
    case 'meatList':
      newList = meatList;
      break;
    case 'bakingList':
      newList = bakingList;
      break;
    case 'otherList':
      newList = otherList;
      break;
    default:
      console.error(`Invalid category list: ${moveLocation}`);
      return;
  }

  // Add the item to the new list
  if (newList) {
    newList.push(nameOfItem);
    newList.sort(); // Optionally sort the list alphabetically
  } else {
    console.error(`New list for ${moveLocation} not found.`);
  }

  // Update the DOM by moving the full item to the new category section
  const insertLocation = document.getElementById(`${moveLocation}Title`);
  if (insertLocation) {
    insertLocation.insertAdjacentElement('afterend', fullItem);
  } else {
    console.error(`Insert location for ${moveLocation}Title not found.`);
  }

  // Save the updated lists to Firestore
  await updateIngredientCategoryList();
}


// Function to remove the item from the original list
function moveCategories(name, originalCategory) {
  let originalList;
  switch (originalCategory.toLowerCase()) {
    case 'producelist':
      originalList = produceList;
      break;
    case 'pantrylist':
      originalList = pantryList;
      break;
    case 'dairylist':
      originalList = dairyList;
      break;
    case 'meatlist':
      originalList = meatList;
      break;
    case 'bakinglist':
      originalList = bakingList;
      break;
    case 'otherlist':
      originalList = otherList;
      break;
    default:
      console.error(`Invalid category list: ${originalCategory}`);
      return;
  }

  if (!Array.isArray(originalList)) {
    console.error(`Original list for category ${originalCategory} is not an array or not found.`);
    return;
  }

  // Find and remove the item from the original category list
  const index = originalList.indexOf(name);
  if (index > -1) {
    originalList.splice(index, 1);
  }
}


async function updateIngredientCategoryList() {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, 'users', user.uid, 'data', 'ingredientCategoryList');
    try {
      const formattedIngredientCategoryList = formatForFirestore([produceList, pantryList, dairyList, meatList, bakingList, otherList]);
      await updateDoc(userDocRef, { ingredientCategoryList: formattedIngredientCategoryList });
      console.log('Ingredient category list updated in Firestore.');
    } catch (error) {
      console.error('Error updating ingredientCategoryList in Firestore:', error);
    }
  } else {
    console.log('No user is signed in. Cannot update Firestore.');
  }
}






export function deleteIngredient(index) {
  document.getElementById(`ing${index}`).remove();
}

export function recipeNames() {
  const location = document.getElementById('recipeNames');
  const quantMatrix = [];
  groceryTitles.forEach((title, i) => {
    let quantity = 1;
    for (let t = i + 1; t < groceryTitles.length; t++) {
      if (title === groceryTitles[t]) {
        quantity++;
        groceryTitles.splice(t, 1);
        t--;
      }
    }
    quantMatrix.push(quantity);
  });

  groceryTitles.forEach((title, i) => {
    if (quantMatrix[i] > 1) {
      groceryTitles[i] = `${title} x${quantMatrix[i]}`;
    }
  });

  groceryTitles.forEach(title => {
    location.insertAdjacentHTML("beforeend", `<div class="recipe-name">${title}</div>`);
  });
}

export function displayActionBar(index) {
  const bar = document.getElementById(`actionBar${index}`);
  if (bar) {
    bar.classList.add('display-on');
  }
}

export function displayActionBarOff(index) {
  const bar = document.getElementById(`actionBar${index}`);
  const moveBar = document.getElementById(`${index}moveList`);
  if (bar) {
    bar.classList.remove('display-on');
  }
  if (moveBar && moveBar.classList.contains('display-on')) {
    moveBar.classList.remove('display-on');
  }
}



export function displayMoveBar(index) {
  const bar = document.getElementById(`${index}moveList`);
  const ingredientElement = document.getElementById(`ing${index}`);

  // Check if the elements exist
  if (!bar || !ingredientElement) {
    console.error(`Elements for move bar or ingredient not found for index ${index}`);
    return;
  }

  // Use the closest category container and ensure it exists
  const parentCategory = ingredientElement.closest('.category-list');

  

  if (!parentCategory) {
    console.error(`Parent category not found for ingredient element with index ${index}`);
    return;
  }

  const parentLocation = parentCategory.id;

  const categoryMap = {
    produceList: ['Meat', 'Pantry', 'Baking', 'Dairy', 'Other'],
    meatList: ['Produce', 'Pantry', 'Baking', 'Dairy', 'Other'],
    pantryList: ['Produce', 'Meat', 'Baking', 'Dairy', 'Other'],
    bakingList: ['Produce', 'Meat', 'Pantry', 'Dairy', 'Other'],
    dairyList: ['Produce', 'Meat', 'Pantry', 'Baking', 'Other'],
    otherList: ['Produce', 'Meat', 'Pantry', 'Baking', 'Dairy']
  };

  console.log(produceList)

  // Check if the parent location is valid and update the move list categories
  if (categoryMap[parentLocation]) {
    bar.classList.add('display-on');
    categoryMap[parentLocation].forEach((category, i) => {
      const categoryElement = document.getElementById(`${index}moveList${i + 1}`);
      if (categoryElement) {
        categoryElement.innerText = category;
      } else {
        console.error(`Move list category element not found for ${index}moveList${i + 1}`);
      }
    });
  } else {
    console.error(`Invalid parent location: ${parentLocation}`);
  }
}

export function displayMoveBarOff(index) {
  const bar = document.getElementById(`${index}moveList`);

  if (bar) {
    bar.classList.remove('display-on');

    // Clear the inner text of each move list category
    [...Array(5).keys()].forEach(i => {
      const categoryElement = document.getElementById(`${index}moveList${i + 1}`);
      if (categoryElement) {
        categoryElement.innerText = ''; // Clear the text content of each category
      } else {
        console.error(`Move list category element not found for ${index}moveList${i + 1}`);
      }
    });
  } else {
    console.error(`Move list bar not found for index ${index}`);
  }
}





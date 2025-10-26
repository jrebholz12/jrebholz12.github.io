// backend/recipelist.js
// 🚫 No Firebase imports here. Keep this file pure utils.

export function transformRecipeList(recipeList) {
  return recipeList.map(recipe => {
    const ingredientNames = recipe.ingredients.map(i => i.ingredient);
    const ingredientQuantities = recipe.ingredients.map(i => i.quantity);
    const ingredientUnits = recipe.ingredients.map(i => i.unit);

    return {
      title: recipe.title,
      website: recipe.website,
      cuisine: recipe.cuisine,
      servings: recipe.servings,
      picture: recipe.picture,
      notes: recipe.notes,
      ingredients: [ingredientNames, ingredientQuantities, ingredientUnits]
    };
  });
}

export function formatForFirestore(ingredientCategoryList) {
  return ingredientCategoryList.map((categoryList, i) => ({
    category: `category${i + 1}`,
    ingredients: categoryList
  }));
}

export function revertFormattedCategoryList(formattedCategoryList) {
  return formattedCategoryList.map(item => item.ingredients);
}

// Optional localStorage helpers below (unchanged)
export function savePageToLocalStorage() {
  const pageHtml = document.body.innerHTML;
  localStorage.setItem('savedPageHtml', pageHtml);
  alert('Page content saved to local storage!');
}

export function showPageFromLocalStorage() {
  const savedHtml = localStorage.getItem('savedPageHtml');
  if (savedHtml) {
    document.body.innerHTML = savedHtml;
    alert('Page content loaded from local storage!');
  }
}

export function clearPageFromLocalStorage() {
  const savedHtml = localStorage.getItem('savedPageHtml');
  if (savedHtml) {
    localStorage.removeItem('savedPageHtml');
    alert('Saved page content cleared from local storage!');
  }
}

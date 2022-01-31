import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultView from './views/resultView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'
import paginationView from './views/paginationView.js'
import { MODAL_CLOSE_SEC } from './config.js'
import 'core-js/stable' 
import 'regenerator-runtime/runtime'
import {async} from 'regenerator-runtime'
if(module.hot){
  module.hot.accept();
}
const controlRecipes = async function(){
  try{
    const id = window.location.hash.slice(1)
    
    if (!id) return;
    recipeView.renderSpinner();
    //Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
    // Update results view to mark selected search result
    resultView.update(model.getSearchResultsPage())
    //Loading recipe 
    await model.loadRecipe(id) ;   
   

    //Rendering recipe

    recipeView.render(model.state.recipe);
    

    }catch(err){
    recipeView.renderError()
  }
}
const controlSerachResult = async function(){
  try{
    resultView.renderSpinner()
    //1 Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2 Load Search result
    await model.loadSearchResult(query)
    //3 Render result
    resultView.render(model.getSearchResultsPage())
    //4 Render initial pagination buttons 
    paginationView.render(model.state.search);

  }catch(err){
    console.log(err);
    }
  };

const controlPagination = function(goToPage){
    //Render new result
    resultView.render(model.getSearchResultsPage(goToPage));
    //Render new pagination buttons
    paginationView.render(model.state.search);
}
const controlServings = function(newServings){
//Update the recipe servings (in state)
model.updateServings(newServings)
//Update the recipe viewm
// recipeView.render(model.state.recipe);
recipeView.update(model.state.recipe);
};

const controlAddBookmark = function(){
  //Add or remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //Update recipe view
  recipeView.update(model.state.recipe)
  //Render Bookmarks
  bookmarksView.render(model.state.bookmarks)

}
const controlBookmarks = function (){
  bookmarksView.render(model.state.bookmarks);
}
const controlAddRecipe = async function (newRecipe) {
  try {
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
  //Render recipe
  recipeView.render(model.state.recipe);
  //Success message 
  addRecipeView.renderMessage(); 

  //REnder Bookmark view
  bookmarksView.render(model.state.bookmarks);

  //Change ID in URL
window.history.pushState(null, '', `#${model.state.recipe.id}`);
 

  //Close form window
  setTimeout(function () {
    addRecipeView.toggleWindow()
  }, MODAL_CLOSE_SEC * 1000);
  }catch(err){
    console.error('!', err);
    addRecipeView.renderError(err.message);
  }
  
}
const init = function(){
bookmarksView.addHandlerRender(controlBookmarks)
recipeView.addHandlerRender(controlRecipes);
recipeView.addHandlerUpdateServings(controlServings);
recipeView.addHandlerAddBookmark(controlAddBookmark)
searchView.addHandlerSearch(controlSerachResult);
paginationView.addHandleClick(controlPagination); 
addRecipeView.addHandlerUpload(controlAddRecipe);
};
init()
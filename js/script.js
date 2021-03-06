$(function () { // Same as document.addEventListener("DOMContentLoaded"...

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur((event) => {
      var screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        $("#collapsable-nav").collapse('hide');
      }
    });
});

(function (global) {

var dc = {};

var homeHtmlUrl = "snippets/home-snippet.html";
// var allCategoriesUrl =
//   "https://davids-restaurant.herokuapp.com/categories.json";
var allCategoriesUrl =
  "snippets/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
// var menuItemsUrl =
//   "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsUrl =
  "snippets/category-";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

var allLocationsUrl = "snippets/locations.json";
var locationsTitleHtml = "snippets/locations-title-snippet.html";
var locationsHtml = "snippets/locations-snippet.html";

var infoHtml = "snippets/info-snippet.html";

// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

// Remove the class 'active' from home and switch to Menu button
var switchMenuToActive = () => {
  // Remove 'active' from home button
  var classes = document.querySelector("#aHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#aHomeButton").className = classes;
  // Remove 'active' from Location button
  var classes = document.querySelector("#aLocationButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#aLocationButton").className = classes;
  removeActive("aInfoButton");

  // Add 'active' to menu button if not already there
  classes = document.querySelector("#aMenuButton").className;
  if (classes.indexOf("active") === -1) {
    classes += " active";
    document.querySelector("#aMenuButton").className = classes;
  }
};

// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {

// On first load, show home view
showLoading("#main-content");
$ajaxUtils.sendGetRequest(
  allCategoriesUrl,
  buildAndShowHomeHTML, 
  true); // Explicitly setting the flag to get JSON from server processed into an object literal
});
// *** finish **


// Builds HTML for the home page based on categories array
// returned from the server.
function buildAndShowHomeHTML (categories) {

  // Load home snippet page
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {

      var chosenCategoryShortName = chooseRandomCategory(categories).short_name;

      chosenCategoryShortName = "'" + chosenCategoryShortName + "'";
      var homeHtmlToInsertIntoMainPage = 
              insertProperty(homeHtml, "randomCategoryShortName", chosenCategoryShortName);
      insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
    },
    false); // False here because we are getting just regular HTML from the server, so no need to process JSON.
}


// Given array of category objects, returns a random category object.
function chooseRandomCategory (categories) {
  // Choose a random index into the array (from 0 inclusively until array length (exclusively))
  var randomArrayIndex = Math.floor(Math.random() * categories.length);

  // return category object with that randomArrayIndex
  return categories[randomArrayIndex];
}


// Load the menu categories view
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML);
}; 


// Load the menu items view
// 'categoryShort' is a short_name for a category
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    `${menuItemsUrl + categoryShort}.json`,
    buildAndShowMenuItemsHTML);
};


// Builds HTML for the categories page based on the data
// from the server
function buildAndShowCategoriesHTML (categories) {
  // Load title snippet of categories page
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    (categoriesTitleHtml) => {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        (categoryHtml) => {
          // Switch CSS class active to menu button
          switchMenuToActive();

          var categoriesViewHtml = buildCategoriesViewHtml(categories,
            categoriesTitleHtml,
            categoryHtml);
          insertHtml("#main-content", categoriesViewHtml);
        },
        false);
    },
    false);
}


// Using categories data and snippets html
// build categories view HTML to be inserted into page
function buildCategoriesViewHtml(categories,
                                 categoriesTitleHtml,
                                 categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over categories
  for (var i = 0; i < categories.length; i++) {
    // Insert category values
    var html = categoryHtml;
    var name = "" + categories[i].name;
    var short_name = categories[i].short_name;
    html =
      insertProperty(html, "name", name);
    html =
      insertProperty(html,
                     "short_name",
                     short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}



// Builds HTML for the single category page based on the data
// from the server
function buildAndShowMenuItemsHTML (categoryMenuItems) {
  // Load title snippet of menu items page
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      // Retrieve single menu item snippet
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          // Switch CSS class active to menu button
          switchMenuToActive();

          var menuItemsViewHtml =
            buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleHtml,
                                   menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
        false);
    },
    false);
}


// Using category and menu items data and snippets html
// build menu items view HTML to be inserted into page
function buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml) {

  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "name",
                   categoryMenuItems.category.name);
  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "special_instructions",
                   categoryMenuItems.category.special_instructions);

  var finalHtml = menuItemsTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over menu items
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    // Insert menu item values
    var html = menuItemHtml;
    html =
      insertProperty(html, "short_name", menuItems[i].short_name);
    html =
      insertProperty(html,
                     "catShortName",
                     catShortName);
    html =
      insertItemPrice(html,
                      "price_small",
                      menuItems[i].price_small);
    html =
      insertItemPortionName(html,
                            "small_portion_name",
                            menuItems[i].small_portion_name);
    html =
      insertItemPrice(html,
                      "price_large",
                      menuItems[i].price_large);
    html =
      insertItemPortionName(html,
                            "large_portion_name",
                            menuItems[i].large_portion_name);
    html =
      insertProperty(html,
                     "name",
                     menuItems[i].name);
    html =
      insertProperty(html,
                     "description",
                     menuItems[i].description);

    // Add clearfix after every second menu item
    if (i % 2 !== 0) {
      html +=
        "<div class='clearfix d-none d-lg-block'></div>";
    }

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}


// Appends price with '$' if price exists
function insertItemPrice(html,
                         pricePropName,
                         priceValue) {
  // If not specified, replace with empty string
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }

  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}


// Appends portion name in parens if it exists
function insertItemPortionName(html,
                               portionPropName,
                               portionValue) {
  // If not specified, return original string
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }

  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}


// Load the locations view
dc.loadMenuLocations = function (posId) {
  dc.posId = posId;
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allLocationsUrl,
    buildAndShowLocationsHTML);
}; 


// Builds HTML for the locations page based on the data
// from the server
function buildAndShowLocationsHTML (locations) {
  // Load title snippet of categories page
  $ajaxUtils.sendGetRequest(
    locationsTitleHtml,
    (locationsTitleHtml) => {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(
        locationsHtml,
        (locationsHtml) => {
          // Switch CSS class active to location button
          switchLocationToActive();

          var locationsViewHtml = buildLocationsViewHtml(locations,
            locationsTitleHtml,
            locationsHtml);
          insertHtml("#main-content", locationsViewHtml);
          dc.posId ? document.getElementById(dc.posId).scrollIntoView() : null;
        },
        false);
    },
    false);
}

// Using locations data and snippets html
// build locations view HTML to be inserted into page
function buildLocationsViewHtml(locations,
  locationsTitleHtml,
  locationsHtml) {

var finalHtml = locationsTitleHtml;
finalHtml += "<section class='row'>";

// Loop over locations
for (var i = 0; i < locations.length; i++) {
// Insert locations values
  var html = locationsHtml;
  html = insertProperty(html, "location", locations[i].location);
  html = insertProperty(html, "address", locations[i].address);
  html = insertProperty(html, "phone_btn", locations[i].phone_btn);
  html = insertProperty(html, "phone", locations[i].phone);
  html = insertProperty(html, "url", locations[i].url);
  html = insertProperty(html, "map", locations[i].map);
  finalHtml += html;
}

finalHtml += "</section>";
return finalHtml;
}

// Remove the class 'active' from home and switch to Location button
var switchLocationToActive = () => {
  // Remove 'active' from home button
  var classes = document.querySelector("#aHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#aHomeButton").className = classes;
  // Remove 'active' from menu button
  var classes = document.querySelector("#aMenuButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#aMenuButton").className = classes;
  removeActive("aInfoButton");

  // Add 'active' to location button if not already there
  classes = document.querySelector("#aLocationButton").className;
  if (classes.indexOf("active") === -1) {
    classes += " active";
    document.querySelector("#aLocationButton").className = classes;
  }
};

var removeActiveAll = () => {
  removeActive("aHomeButton");
  removeActive("aMenuButton");
  removeActive("aLocationButton");
  removeActive("aInfoButton");
}

var removeActive = (buttonName) => {
  // Remove 'active' from home button
  var classes = document.querySelector(`#${buttonName}`).className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector(`#${buttonName}`).className = classes;
}

var switchToActive = (buttonName) => {
  // Switch to Active a Button
  classes = document.querySelector(`#${buttonName}`).className;
  if (classes.indexOf("active") === -1) {
    classes += " active";
    document.querySelector(`#${buttonName}`).className = classes;
  }
}

// Load the locations view
dc.loadMenuInfo = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    infoHtml,
   (infoHtml) => {
      removeActiveAll();
      switchToActive("aInfoButton");
      insertHtml("#main-content", infoHtml);
    },
    false);
}; 

global.$dc = dc;

})(window);

// initial brand
let brand = "nyx";
// array of checked product types
let checkedProducts = [];
// price slider
let inputLeft, inputRight, thumbLeft, thumbRight, range;

$(document).ready(function () {
  getPriceSlider();
  setMinPrice();
  setMaxPrice();

  // mark intitial brand as checked
  $(`#${brand}`).attr("checked", true);
  // get data from API
  getData();

  /* Event listeners */

  // left slider(minimum price)
  inputLeft.on({
    // fired on each alteration to an element's value
    input: function () {
      setMinPrice();
    },
    // fired when user stops thumb dragging
    change: function () {
      getData();
    },
  });

  // right slider(maximum price)
  inputRight.on({
    input: function () {
      setMaxPrice();
    },
    change: function () {
      getData();
    },
  });

  // change brand
  $("input[type=radio][name=brand]").on("change", (event) => {
    // set new brand
    brand = event.target.value;
    getData();
  });

  // change product type
  $("input[type=checkbox][name=product-type]").on("change", () => {
    setCheckedProducts();
    getData();
  });

  // click "clear product type"
  $(".clear-product-type").on("click", () => {
    clearCheckedProducts();
    getData();
  });

  // click "clear price"
  $(".clear-price").on("click", () => {
    clearMinPrice();
    clearMaxPrice();
    getData();
  });

  // click "clear all"
  $(".clear-all").on("click", () => {
    clearCheckedProducts();
    clearMinPrice();
    clearMaxPrice();
    getData();
  });

  // click close in sidebar
  $(".close-btn").on("click", () => {
    $(".sidebar").css("left", "-100%");
  });

  // click close in sidebar
  $(".filter-btn").on("click", () => {
    $(".sidebar").css("left", "0");
  });
});

/* Functions */

// set minimum price
function setMinPrice() {
  // get min & max of left slider (slider for minimum price)
  const min = parseInt(inputLeft.attr("min"));
  const max = parseInt(inputLeft.attr("max"));

  // determine left slider value
  const value = Math.min(
    parseInt(inputLeft.prop("value")),
    parseInt(inputRight.prop("value")) - 1
  );

  // set left slider value
  inputLeft.prop("value", value);

  // determine left slider percentage
  const percent = ((inputLeft.prop("value") - min) / (max - min)) * 100;

  // move left thumb
  thumbLeft.css("left", `${percent}%`);
  // move range's start point
  range.css("left", `${percent}%`);

  // display minimum price
  $(".min-price").text(`$ ${inputLeft.prop("value")}`);
}

// set maximum price
function setMaxPrice() {
  // get min & max of right slider (slider for maximum price)
  const min = parseInt(inputRight.attr("min"));
  const max = parseInt(inputRight.attr("max"));

  // determine right slider value
  const value = Math.max(
    parseInt(inputRight.prop("value")),
    parseInt(inputLeft.prop("value")) + 1
  );

  // set right slider value
  inputRight.prop("value", value);

  // determine right slider percentage
  const percent = ((inputRight.prop("value") - min) / (max - min)) * 100;

  //  move right thumb
  thumbRight.css("right", `${100 - percent}%`);
  //  move range's end point
  range.css("right", `${100 - percent}%`);

  // display maximum price
  $(".max-price").text(`$ ${inputRight.prop("value")}`);
}

// get data from API
function getData() {
  // show loading state
  $(".loading-container").css("display", "flex");

  // API url
  const makeupApiUrl = `https://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`;

  // get data from API with AJAX
  $.ajax({
    // url
    url: makeupApiUrl,
    // request type
    type: "GET",
    // expected data
    dataType: "json",
    // on success
    success: function (responseArray) {
      // ouput inserted to DOM
      let output = "";
      // filtered products
      let filteredArray = [];
      // minimum price
      const minPrice = parseInt(inputLeft.prop("value"));
      // maximum price
      const maxPrice = parseInt(inputRight.prop("value"));

      // no checked product types
      if (checkedProducts.length === 0) {
        $.each(responseArray, (index, product) => {
          // parse string price to float
          const productPrice = parseFloat(product.price);
          // check product price
          if (productPrice <= maxPrice && productPrice >= minPrice) {
            filteredArray.push(product);
          }
        });
      } else {
        $.each(responseArray, (index, product) => {
          // check product against each chechecked type
          $.each(checkedProducts, (index, checkedProductType) => {
            const productPrice = parseFloat(product.price);
            // check product type & price
            if (
              checkedProductType.value === product.product_type &&
              productPrice <= maxPrice &&
              productPrice >= minPrice
            ) {
              filteredArray.push(product);
            }
          });
        });
      }

      console.log(filteredArray);

      // set output
      output = buildOutput(filteredArray);

      // insert output to DOM
      $(".products").html(output);
    },
    // on failure
    error: function (error) {
      console.log("error: " + error);
    },
    // on complete regardless if it's a success or fialure
    complete: function () {
      // hide loading state
      $(".loading-container").css("display", "none");
    },
  });
}

// set checked product types
function setCheckedProducts() {
  // get all product types
  const productCheckboxes = $("input[type=checkbox][name=product-type]");

  // reset checked types
  checkedProducts = [];

  $.each(productCheckboxes, (index, product) => {
    // get checked types
    if (product.checked) {
      checkedProducts.push(product);
    }
  });
}

// clear checked product types
function clearCheckedProducts() {
  $.each(checkedProducts, (index, checkedProductType) => {
    // uncheck
    checkedProductType.checked = false;
  });
  // reset checked types
  checkedProducts = [];
}

// clear minimum price
function clearMinPrice() {
  inputLeft.prop("value", 0);
  thumbLeft.css("left", "0");
  range.css("left", "0");
  $(".min-price").text(`$ ${inputLeft.prop("value")}`);
}

// clear maximum price
function clearMaxPrice() {
  inputRight.prop("value", 60);
  thumbRight.css("right", "0");
  range.css("right", "0");
  $(".max-price").text(`$ ${inputRight.prop("value")}`);
}

// get price slider elements
function getPriceSlider() {
  // left & right range inputs
  inputLeft = $("#input-left");
  inputRight = $("#input-right");
  // left & right slider thumbs
  thumbLeft = $(".slider > .thumb.left");
  thumbRight = $(".slider > .thumb.right");
  // price range
  range = $(".slider > .range");
}

// build final output
function buildOutput(filteredArray) {
  // output
  let output = "";
  // if final array has products
  if (filteredArray.length > 0) {
    $.each(filteredArray, (index, product) => {
      const productHtml = `
      <div class="card">
        <img src="${product.api_featured_image}">
        <h3 class="price"><span class="dollar-sign">&dollar;</span> ${product.price}</h4>
        <h2 class="name">${product.name}</h2>
        <div class="type-wrapper">
          <h4 class="product-type">${product.product_type}</h4>
        </div>
      </div>
    `;
      output += productHtml;
    });
  } else {
    output = `
    <div class="expandable-container">
      <h4>No products match the filters, try others & <br /> don't leave us. 
        <i>We LOVE ya!</i>
      </h4>
      <div class="face">
        <div class="eye eye-left">
          <div class="white-dot"></div>
        </div>
        <div class="eye eye-right">
          <div class="white-dot"></div>
        </div>
        <div class="mouth"></div>
      </div>
    </div>
    `;
  }
  return output;
}

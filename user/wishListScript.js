// Home API integration functions
let listOfFav = [];
let sectionId = "Favourits";
let userWishListId;
// Fetch home data from API
async function fetchfavouritsData() {
  const url = `${apiUrl}collections/wish_list_items/records?page=1&perPage=30&skipTotal=false&expand=user%2C%20products%2C%20products.category%2C%20products.category.sub_categries`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log("Home data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching home data:", error);
    return null;
  }
}

// Render Section from API data
function renderSection(sectionData, sectionId, userWishListId) {
  const container = document.getElementById("container");
  const productsGrid = document.getElementById(sectionId);
  productsGrid.innerHTML = ""; // Clear existing content
  if (sectionData.length === 0) {
    // Show placeholder
    container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 300px; width: 100%;">
      <i class="fas fa-heart" style="font-size: 48px; color: #ccc;"></i>
      <h3>Your Favourites is empty</h3>
      <p>Add some products to your Favourites!</p>
      <a href="../home/home.html" class="btn">Browse Products</a>
    </div>
  `;
    return;
  }

  // Create product cards properly
  sectionData.forEach((product, index) => {
    const imageUrl =
      product.image && product.image.length > 0
        ? generateImageUrl(apiUrl, "product", product.id, product.image[0])
        : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

    const hasDiscount = false; //product.original_price && product.original_price > product.price;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) *
            100
        )
      : 0;

    const productCard = document.createElement("div");
    productCard.className = "product-card";
    console.log(product.is_wishlist);
    // Set FULL card HTML (including container div)
    productCard.innerHTML = `
   <div class="product-badge">your 💝</div>
    <div class="product-image" style="background-image: url('${imageUrl}');">
    <button class="wishlist-btn ${"active"}">
            <i class="fas fa-heart"></i>
        </button>
  
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.title_en}</h3>
      <div class="product-price">
        $${product.price.toFixed(2)}
        ${
          hasDiscount
            ? `<span class="original-price">$${product.original_price.toFixed(
                2
              )}</span>`
            : ""
        }
        ${
          hasDiscount
            ? `<span class="discount">(${discountPercentage}% off)</span>`
            : ""
        }
      </div>
 
      <div class="stock">In Stock: ${product.stock}</div>
      <div class="btn-container">
        <button class="btn btn-cart" onclick="addToCart('${
          product.id
        }')">Add to Cart</button>
        <button class="btn" onclick="window.location.href='../products/productDetails.html?id=${
          product.id
        }'">Details</button>
      </div>
    </div>
  `;

    // Add wishlist functionality
    const wishlistBtn = productCard.querySelector(".wishlist-btn");
    wishlistBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const isActive = wishlistBtn.classList.contains("active");
      const icon = wishlistBtn.querySelector("i");
      const originalClass = icon.className;
      icon.className = "fas fa-spinner fa-spin";
      wishlistBtn.disabled = true;
      console.log(userWishListId, product.id, !isActive, userId);
      wishlistFunctionality(userWishListId, product.id, !isActive, userId)
        .then(() => {
          if (isActive) {
            wishlistBtn.classList.remove("active");
            //
            listOfFav.splice(index, 1);
            renderSection(listOfFav, sectionId, userWishListId);
          } else {
            wishlistBtn.classList.add("active");
          }
        })
        .finally(() => {
          // Remove loading effect
          wishlistBtn.disabled = false;
          icon.className = originalClass;
        });

      console.log("Toggle wishlist for product:", product.id);
    });

    productsGrid.appendChild(productCard);
  });
}
async function initializeHomePage() {
  try {
    const favouritsData = await fetchfavouritsData();

    if (favouritsData && favouritsData.items) {
      listOfFav = favouritsData.items[0].expand.products || [];
      userWishListId = favouritsData.items[0].id || "";
      console.log(listOfFav, "Favourits", userWishListId);
      renderSection(listOfFav, "Favourits", userWishListId);
    }
  } catch (error) {
    console.error("Error initializing Favourits page:", error);
  }
}

// Initialize Favourits page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeHomePage();
});

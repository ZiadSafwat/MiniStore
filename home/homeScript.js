// Home API integration functions

// Fetch home data from API
async function fetchHomeData() {
  const url = `${apiUrl}new/home`;
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

// Render banners from API data
function renderBanners(banners) {
  const bannerContainer = document.querySelector(".banner-container");
  if (
    !bannerContainer ||
    !banners ||
    !Array.isArray(banners) ||
    banners.length === 0
  ) {
    console.error("Banners container not found or invalid banners data");
    return;
  }

  const bannerElement = bannerContainer.querySelector(".banner");
  const bannerIndicators = bannerContainer.querySelector(".banner-indicators");

  if (!bannerElement || !bannerIndicators) {
    console.error("Banner elements not found");
    return;
  }

  // Clear existing indicators
  bannerIndicators.innerHTML = "";

  // Create indicators for each banner
  banners.forEach((banner, index) => {
    const indicator = document.createElement("div");
    indicator.className = "indicator";
    indicator.dataset.index = index;
    bannerIndicators.appendChild(indicator);
  });

  // Set first banner as active
  bannerIndicators.firstChild?.classList.add("active");

  // Function to display a specific banner
  const showBanner = (index) => {
    const banner = banners[index];
    if (!banner) return;

    const imageUrl = generateImageUrl(
      apiUrl,
      "banner",
      banner.id,
      banner.image
    );

    bannerElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${imageUrl}')`;
    bannerElement.querySelector("h2").textContent = banner.title;
    bannerElement.querySelector("p").textContent = banner.subtitle;

    // Update banner link
    const bannerBtn = bannerElement.querySelector(".banner-btn");
    if (bannerBtn && banner.link) {
      bannerBtn.onclick = () => window.open(banner.link, "_blank");
    }

    // Update active indicator
    document
      .querySelectorAll(".banner-indicators .indicator")
      .forEach((ind, i) => {
        ind.classList.toggle("active", i === index);
      });
  };

  // Set up indicator click events
  bannerIndicators
    .querySelectorAll(".indicator")
    .forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        currentBannerIndex = index;
        showBanner(index);
        resetBannerTimer();
      });
    });

  // Banner rotation functionality
  let currentBannerIndex = 0;
  let bannerInterval;

  const rotateBanners = () => {
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    showBanner(currentBannerIndex);
  };

  const resetBannerTimer = () => {
    clearInterval(bannerInterval);
    bannerInterval = setInterval(rotateBanners, 5000);
  };

  // Initialize first banner and start rotation
  showBanner(0);
  resetBannerTimer();
}



// Render categories from API data
function renderCategories(categories) {
  const categoriesGrid = document.querySelector(".categories-grid");
  if (!categoriesGrid || !categories) return;

  categoriesGrid.innerHTML = "";

  categories.forEach((category) => {
    const imageUrl =
      category.image && category.image.length > 0
        ? generateImageUrl(apiUrl, "categories", category.id, category.image[0])
        :noImageUrl;

    const categoryCard = document.createElement("div");
    categoryCard.className = "category-card";
    categoryCard.innerHTML = `
      <div class="category-image" style="background-image: url('${imageUrl}');"></div>
      <div class="category-content">
        <h3>${category.title.en}</h3>
        <p>${category.totalItemsNumber} items</p>
      </div>
    `;

    // Add click handler for category navigation
    categoryCard.addEventListener("click", () => {
      // You can implement category navigation here
      console.log("Navigate to category:", category.id);
    });

    categoriesGrid.appendChild(categoryCard);
  });
}


function flattenCategories(data) {
  const result = [];

  function recurse(items) {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    }
  }

  recurse(data);
  return result;
}





// Render Section from API data
function renderSection(sectionData, sectionId, userWishListId) {
  const productsGrid = document.getElementById(sectionId);

  if (!productsGrid || !sectionData || sectionData.length === 0) {
    console.log("No grid or new arrivals data");
    return;
  }
  productsGrid.innerHTML = ""; // Clear existing content
  // Create product cards properly
  sectionData.forEach((product) => {
    const imageUrl =
      product.image && product.image.length > 0
        ? generateImageUrl(
            apiUrl,
            "product",
            product.productId,
            product.image[0]
          )
        : noImageUrl;

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
  ${
    sectionId === "newArrivalsGrid"
      ? '<div class="product-badge">New</div>'
      : sectionId === "trendingProductsGrid"
      ? '<div class="product-badge">Trend</div>'
      : '<div class="product-badge">For you 💝</div>'
  }
  <div class="product-image" style="background-image: url('${imageUrl}');">
  <button class="wishlist-btn ${product.is_wishlist ? "active" : ""}">
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
    <div class="product-rating">
      <div class="stars">
        ${generateRatingStars(product.rating)}
      </div>
      <span>(${product.review_count} reviews)</span>
    </div>
    <div class="stock">In Stock: ${product.stock}</div>
    <div class="btn-container">
      <button class="btn btn-cart" onclick="addToCart('${
        product.productId
      }')">Add to Cart</button>
      <button class="btn" onclick="window.location.href='../products/productDetails.html?id=${
        product.productId
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
      console.log(userWishListId, product.productId, !isActive, userId);
      wishlistFunctionality(
        userWishListId,
        product.productId,
        !isActive,
        userId
      )
        .then(() =>
          isActive
            ? wishlistBtn.classList.remove("active")
            : wishlistBtn.classList.add("active")
        )
        .finally(() => {
          // Remove loading effect
          wishlistBtn.disabled = false;
          icon.className = originalClass;
        });

      console.log("Toggle wishlist for product:", product.productId);
    });

    productsGrid.appendChild(productCard);
  });
}
 
async function initializeHomePage() {
  try {
    const homeData = await fetchHomeData();
    if (homeData && homeData.data) {
      renderBanners(homeData.data.banners);
      renderCategories(flattenCategories(homeData.data.categories));
      renderSection(
        homeData.data.new_arrivals,
        "newArrivalsGrid",
        homeData.data.userWishListId
      );
      renderSection(
        homeData.data.recommendations,
        "recommendationsProductsGrid",
        homeData.data.userWishListId
      );
      renderSection(
        homeData.data.trending_products,
        "trendingProductsGrid",
        homeData.data.userWishListId
      );
    }
  } catch (error) {
    console.error("Error initializing home page:", error);
  }
}

// Initialize home page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeHomePage();
});

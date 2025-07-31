// Cart functionality

let currentProduct = null;
let currentSlide = 0;

// Product detail functionality
const productDetailContainer = document.getElementById(
  "product-detail-container"
);
const reviewsContainer = document.getElementById("reviews-container");
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Slider functions
function initSlider(images) {
  if (!images || images.length === 0) return;

  // Create slider elements
  const sliderMain = document.querySelector(".slider-main");
  const thumbnailsContainer = document.querySelector(".slider-thumbnails");

  // Clear existing content
  sliderMain.innerHTML = "";
  thumbnailsContainer.innerHTML = "";

  // Add slides
  images.forEach((img, index) => {
    const slide = document.createElement("div");
    slide.className = "slider-item";
    slide.innerHTML = `<img src="${generateImageUrl(
      apiUrl,
      "product",
      currentProduct.productId,
      img
    )}" alt="${currentProduct.title_en}">`;
    sliderMain.appendChild(slide);

    const thumbnail = document.createElement("img");
    thumbnail.className = "thumbnail";
    if (index === 0) thumbnail.classList.add("active");
    thumbnail.src = generateImageUrl(
      apiUrl,
      "product",
      currentProduct.productId,
      img
    );
    thumbnail.alt = `Thumbnail ${index + 1}`;
    thumbnail.dataset.index = index;
    thumbnail.addEventListener("click", () => {
      goToSlide(index);
      updateThumbnail(index);
    });
    thumbnailsContainer.appendChild(thumbnail);
  });

  // Add event listeners for arrows
  document.querySelector(".prev-arrow").addEventListener("click", () => {
    prevSlide();
  });

  document.querySelector(".next-arrow").addEventListener("click", () => {
    nextSlide();
  });
}

function goToSlide(index) {
  const slider = document.querySelector(".slider-main");
  slider.style.transform = `translateX(-${index * 100}%)`;
  currentSlide = index;
  updateThumbnail(index);
}

function prevSlide() {
  const totalSlides = document.querySelectorAll(".slider-item").length;
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  goToSlide(currentSlide);
}

// Wishlist functionality
function toggleWishlist(wishListId, productId, userId) {
  const wishlistBtn = document.querySelector(".wishlist-btn");
  const isActive = wishlistBtn.classList.contains("active");
  const icon = wishlistBtn.querySelector("i");
  const originalClass = icon.className;
  icon.className = "fas fa-spinner fa-spin";
  wishlistBtn.disabled = true;

  wishlistFunctionality(wishListId, productId, !isActive, userId)
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
}

function nextSlide() {
  const totalSlides = document.querySelectorAll(".slider-item").length;
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
}

function updateThumbnail(index) {
  document.querySelectorAll(".thumbnail").forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add("active");
    } else {
      thumb.classList.remove("active");
    }
  });
}

async function showProductDetail() {
  if (!productId) {
    productDetailContainer.innerHTML = `
                    <div class="error">
                        <p>No product specified. Please select a product.</p>
                        <a href="../home/home.html" class="btn btn-back">Back to Products</a>
                    </div>
                `;
    return;
  }

  try {
    const url = `${apiUrl}/new/search?q=${productId}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();
    currentProduct = data.data[0];

    if (!currentProduct) throw new Error("Product not found");

    // Display the product
    productDetailContainer.innerHTML = `
                    <div class="product-detail">
                        <div class="detail-image-container">
                            <div class="slider-container">
                                <div class="slider-main">
                                    <!-- Slider items will be added dynamically -->
                                </div>
                                <div class="slider-controls">
                                    <button class="slider-btn prev-arrow">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="slider-btn next-arrow">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="slider-thumbnails">
                                <!-- Thumbnails will be added dynamically -->
                            </div>
                        </div>
                        <div class="detail-info">
                            <span class="product-category">${
                              currentProduct.category_name_ar || "Uncategorized"
                            }</span>
                            <h2 class="detail-title">${currentProduct.title_en}
                            <button class="wishlist-btn ${
                              currentProduct.is_wishlist ? "active" : ""
                            }">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </h2>
                            ${
                              currentProduct.rating
                                ? `
                            <div class="detail-rating">
                                ${generateRatingStars(currentProduct.rating)}
                                <span>${currentProduct.rating.toFixed(1)} (${
                                    currentProduct.review_count || 0
                                  } reviews)</span>
                            </div>`
                                : ""
                            }
                            <p class="detail-price">$${currentProduct.price.toFixed(
                              2
                            )}</p>
                            <p class="detail-description">${
                              currentProduct.description_en
                            }</p>
                            <div class="detail-meta">
                                <div class="meta-item">
                                    <span class="meta-label">Availability</span>
                                    <span class="meta-value">${
                                      currentProduct.stock > 0
                                        ? "In Stock"
                                        : "Out of Stock"
                                    }</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">SKU</span>
                                    <span class="meta-value">PRD-${
                                      currentProduct.productId
                                    }</span>
                                </div>
                                ${
                                  currentProduct.stock
                                    ? `
                                <div class="meta-item">
                                    <span class="meta-label">Stock</span>
                                    <span class="meta-value">${currentProduct.stock} available</span>
                                </div>`
                                    : ""
                                }
                            </div>
                            <div class="product-actions">
                                <button class="btn btn-cart" onclick="addToCart('${
                                  currentProduct.productId
                                }')" 
                                    ${
                                      currentProduct.stock <= 0
                                        ? "disabled"
                                        : ""
                                    }>
                                    ${
                                      currentProduct.stock > 0
                                        ? "Add to Cart"
                                        : "Out of Stock"
                                    }
                                </button>
                                <a href="../home/home.html" class="btn btn-back">Back to Products</a>
                            </div>
                        </div>
                    </div>
                `;

    // Initialize slider with product images
    if (currentProduct.image && currentProduct.image.length > 0) {
      initSlider(currentProduct.image);
    } else {
      const sliderContainer = document.querySelector(".slider-container");
      sliderContainer.innerHTML =
        '<div class="no-image">No Image Available</div>';
      document.querySelector(".slider-thumbnails").style.display = "none";
    }
    console.log(currentProduct);
    // Add event listener to wishlist button
    document
      .querySelector(".wishlist-btn")
      .addEventListener("click", () =>
        toggleWishlist(
          currentProduct.userWishListId,
          currentProduct.productId,
          currentProduct.userId
        )
      );
    // Load reviews for this product
    await showReviews(currentProduct.productId);
  } catch (error) {
    console.error("Error loading product details:", error);
    productDetailContainer.innerHTML = `
                    <div class="error">
                        <p>Failed to load product details. Please try again later.</p>
                        <a href="../home/home.html" class="btn btn-back">Back to Products</a>
                    </div>
                `;
  }
}

async function showReviews(productId) {
  try {
    const url = `${apiUrl}collections/reviews/records?filter=product='${productId}'&expand=user,product`;
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();
console.log(data);
    if (data.items && data.items.length > 0) {
      reviewsContainer.innerHTML = data.items
        .map(
          (review) => `
                        <div class="review-card">
                            <div class="review-avatar">
                                ${
                                  review.expand?.user?.avatar
                                    ? `<img src="${generateImageUrl(
                                        apiUrl,
                                        "users",
                                        review.expand.user.id,
                                        review.expand.user.avatar
                                      )}" alt="${review.expand.user.name}">`
                                    : `<i class="fas fa-user"></i>`
                                }
                            </div>
                            <div class="review-content">
                                <div class="review-header">
                                    <span class="review-user">${
                                      review.expand?.user?.name || "Anonymous"
                                    }</span>
                                    <span class="review-date">${new Date(
                                      review.created
                                    ).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-rating">
                                    ${generateRatingStars(review.rating)}
                                </div>
                                <p class="review-comment">${review.comment}</p>
                            </div>
                        </div>
                    `
        )
        .join("");
    } else {
      reviewsContainer.innerHTML = `
                        <div class="no-reviews">
                            <p>No reviews yet for this product.</p>
                            <p>Be the first to review!</p>
                        </div>
                    `;
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsContainer.innerHTML = `
                    <div class="no-reviews">
                        <p>Failed to load reviews. Please try again later.</p>
                    </div>
                `;
  }
}

// Add review button handler
document.getElementById("add-review-btn")?.addEventListener("click", () => {
  alert(
    "Add review functionality would be implemented here. You would typically open a modal or navigate to a review form."
  );
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  showProductDetail();
});

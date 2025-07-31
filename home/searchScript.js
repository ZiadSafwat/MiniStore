// Search API integration functions

// Search API integration
async function searchProducts(query, options = {}) {
  const {
    categories = '',
    minPrice = '',
    maxPrice = '',
    orderBy = 'title_en',
    orderDirection = 'ASC',
    limit = 10,
    offset = 0
  } = options;

  const params = new URLSearchParams({
    q: query,
    orderBy,
    orderDirection,
    limit: limit.toString(),
    offset: offset.toString()
  });

  if (categories) params.append('category', categories);
  if (minPrice) params.append('minPrice', minPrice.toString());
  if (maxPrice) params.append('maxPrice', maxPrice.toString());

  const url = `${apiUrl}new/search?${params.toString()}`;
  const requestOptions = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json'
    }
  };

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    return null;
  }
}

// Render search results
function renderSearchResults(searchData, query) {
  const searchResults = document.getElementById('searchResults');
  const searchQuery = document.getElementById('searchQuery');
  const resultsGrid = document.getElementById('resultsGrid');

  if (!searchResults || !resultsGrid) return;

  // Show search results section
  searchResults.style.display = 'block';
  
  // Update search query display
  if (searchQuery) {
    searchQuery.textContent = query;
  }

  // Clear previous results
  resultsGrid.innerHTML = '';

  if (!searchData || !searchData.data || !searchData.data.length) {
    resultsGrid.innerHTML = '<div class="no-results">No products found for your search.</div>';
    return;
  }

  // Render each product
  searchData.data.forEach(product => {
    const imageUrl = product.image && product.image.length > 0 
      ? generateImageUrl(apiUrl, 'products', product.productId, product.image[0])
      : noImageUrl;

    const hasDiscount = false;//product.original_price && product.original_price > product.price;
    const discountPercentage = hasDiscount 
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image" style="background-image: url('${imageUrl}');">
       
        <button class="wishlist-btn ${product.is_wishlist ? "active" : ""}">
        <i class="fas fa-heart"></i>
    </button>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.title_en}</h3>
        <div class="product-price">
          $${product.price.toFixed(2)}
          ${hasDiscount ? `<span class="original-price">$${product.original_price.toFixed(2)}</span>` : ''}
          ${hasDiscount ? `<span class="discount">(${discountPercentage}% off)</span>` : ''}
        </div>
        <div class="product-rating">
          <div class="stars">
            ${generateRatingStars(product.rating)}
          </div>
          <span>(${product.review_count} reviews)</span>
        </div>
        <div class="stock">In Stock: ${product.stock}</div>
        <div class="btn-container">
          <button class="btn btn-cart" onclick="addToCart('${product.productId}')">Add to Cart</button>
          <button class="btn">Details</button>
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
      console.log(product.userWishListId, product.productId, !isActive, userId);
      wishlistFunctionality(
        product.userWishListId,
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

    resultsGrid.appendChild(productCard);
  });
}

// Handle search form submission
function handleSearchForm() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (!searchForm || !searchInput) return;

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;

    // Show loading state
    const resultsGrid = document.getElementById('resultsGrid');
    if (resultsGrid) {
      resultsGrid.innerHTML = '<div class="loading">Searching...</div>';
    }

    // Get filter values
    const sortSelect = document.getElementById('sortSelect');
    const categorySelect = document.getElementById('categorySelect');
    
    const searchOptions = {};
    
    if (sortSelect && sortSelect.value) {
      switch (sortSelect.value) {
        case 'price_asc':
          searchOptions.orderBy = 'price';
          searchOptions.orderDirection = 'ASC';
          break;
        case 'price_desc':
          searchOptions.orderBy = 'price';
          searchOptions.orderDirection = 'DESC';
          break;
        case 'rating':
          searchOptions.orderBy = 'rating';
          searchOptions.orderDirection = 'DESC';
          break;
        case 'newest':
          searchOptions.orderBy = 'created';
          searchOptions.orderDirection = 'DESC';
          break;
        default:
          searchOptions.orderBy = 'title_en';
          searchOptions.orderDirection = 'ASC';
      }
    }

    if (categorySelect && categorySelect.value) {
      searchOptions.categories = categorySelect.value;
    }

    // Perform search
    const searchResults = await searchProducts(query, searchOptions);
    renderSearchResults(searchResults, query);
  });
}

// Handle filter changes
function handleFilterChanges() {
  const sortSelect = document.getElementById('sortSelect');
  const categorySelect = document.getElementById('categorySelect');
  const searchInput = document.getElementById('searchInput');

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const query = searchInput?.value?.trim();
      if (query) {
        // Re-trigger search with new filters
        document.getElementById('searchForm')?.dispatchEvent(new Event('submit'));
      }
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      const query = searchInput?.value?.trim();
      if (query) {
        // Re-trigger search with new filters
        document.getElementById('searchForm')?.dispatchEvent(new Event('submit'));
      }
    });
  }
}

// Hide search results and show home content
function hideSearchResults() {
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.style.display = 'none';
  }
}

// Initialize search functionality
function initializeSearch() {
  handleSearchForm();
  handleFilterChanges();
  
  // Hide search results initially
  hideSearchResults();
}

// Add CSS styles for search functionality
const searchStyles = document.createElement("style");
searchStyles.textContent = `
  .search-results {
    display: none;
    margin-top: 2rem;
  }
  
  .loading, .no-results {
    text-align: center;
    padding: 3rem;
    font-size: 1.2rem;
    color: #666;
    grid-column: 1 / -1;
  }
  
  .loading::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .results-count {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 0.9rem;
  }
  
  .filter-select:focus {
    outline: none;
    border-color: #007bff;
  }
`;
document.head.appendChild(searchStyles);

// Initialize search functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeSearch();
});


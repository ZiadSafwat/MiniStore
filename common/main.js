let cart = JSON.parse(localStorage.getItem("cart")) || [];
const userId="8wkwi8rc8a8qbpi"
const apiUrl = "https://codesquad.pockethost.io/api/";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJfcGJfdXNlcnNfYXV0aF8iLCJleHAiOjE3NTUwMTc1MjcsImlkIjoiOHdrd2k4cmM4YThxYnBpIiwidHlwZSI6ImF1dGhSZWNvcmQifQ.1811imz_CcHiXg9t8Iwa_HbVELwTIBHd6VQgAQlwe4o";
const noImageUrl='https://codesquad.pockethost.io/api/files/d307x3zqff91y9v/mmf3off8f3r9frx/box_2071537_640_iA7kzWD6ej.png?token=';
// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart count indicator
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElements = document.querySelectorAll(".cart-count");
  cartCountElements.forEach((el) => (el.textContent = count));
}

// Add product to cart
function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1,
    });
  }

  saveCart();
  updateCartCount();

  // Show feedback to user
  const notification = document.createElement("div");
  notification.textContent = "Product added to cart!";
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#4CAF50";
  notification.style.color = "white";
  notification.style.padding = "15px 25px";
  notification.style.borderRadius = "5px";
  notification.style.zIndex = "1000";
  notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  notification.style.animation = "slideIn 0.5s, fadeOut 0.5s 2.5s";

  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Add CSS for notification animation
const style = document.createElement("style");
style.textContent = `
        @keyframes slideIn {
            from { right: -300px; opacity: 0; }
            to { right: 20px; opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
document.head.appendChild(style);
// Generate image url
function generateImageUrl(baseUrl, collectionName, recordId, fileName) {
  return `${baseUrl}files/${collectionName}/${recordId}/${fileName}`;
}
// Generate star rating HTML
function generateRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i === fullStars + 1 && halfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }

  return stars;
}
// impelement wishlistLogic
async function wishlistFunctionality(
  wishListId,
  productId,
  addOrRemove,
  userId
) {
  const url = `${apiUrl}collections/wish_list_items/records/${wishListId}`;
  // user already have record
  if (wishListId) {
    let appendOrRemove = addOrRemove ? "products+" : "products-";
    const options = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: `{"${appendOrRemove}":["${productId}"]}`,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
  // if user dont have wishlist record in the wishlist
  else {
    if (addOrRemove) {
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: `{"products":["${productId}"],"user":"${userId}"}`,
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});

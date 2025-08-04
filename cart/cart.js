const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

async function displayCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart!</p>
                <a href="../home/home.html" class="btn">Browse Products</a>
            </div>
        `;
        cartTotalPrice.textContent = '0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    for (const item of cart) {
        try {
            const url = `${apiUrl}new/search?q=${item.id}`;
            const options = {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                accept: "application/json",
              },
            };
  
            const response = await fetch(url, options);
            const data = await response.json();
            product = data.data[0];



             
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <img src="${generateImageUrl(
                        apiUrl,
                        "product",
                        product.productId,
                        product.image[0]
                      )}" alt="${product.title_ar}" class="cart-item-img">
                    <div>
                        <h4 class="cart-item-title">${product.title_ar}</h4>
                        <p>${product.category_name_ar}</p>
                    </div>
                </div>
                <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                <div class="cart-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <input type="number" min="1" value="${item.quantity}" class="quantity-input" onchange="updateQuantity('${item.id}', parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                <div class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash-alt"></i>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }
    
    cartTotalPrice.textContent = total.toFixed(2);
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        displayCartItems();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCartItems();
}

document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    
    checkoutBtn.addEventListener('click', () => {
        alert('Thank you for your order! Total: $' + cartTotalPrice.textContent);
        cart = [];
        saveCart();
        updateCartCount();
        displayCartItems();
    });
});

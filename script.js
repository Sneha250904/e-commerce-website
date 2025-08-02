// Shopping Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartDisplay();
        this.initializeEventListeners();
    }

    // Add item to cart
    addToCart(productId, name, price, image) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: productId,
                name: name,
                price: parseFloat(price),
                image: image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddToCartNotification(name);
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    // Calculate total
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Clear all items from cart
    clearCart() {
        console.log('clearCart called, items before:', this.items.length); // Debug log
        this.items = [];
        // Also update the global cart variable
        cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.showClearCartNotification();
        console.log('clearCart completed, items after:', this.items.length); // Debug log
    }

    // Update cart display
    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
        
        this.updateCartDropdown();
    }

    // Update cart dropdown
    updateCartDropdown() {
        const cartItemsDropdown = document.getElementById('cart-items-dropdown');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItemsDropdown || !cartTotal) return;
        
        if (this.items.length === 0) {
            cartItemsDropdown.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = 'Total: $0.00';
        } else {
            cartItemsDropdown.innerHTML = this.items.map(item => `
                <div class="cart-item-dropdown">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="cart-item-remove" onclick="cart.removeFromCart('${item.id}')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            `).join('');
            
            cartTotal.textContent = `Total: $${this.getTotal().toFixed(2)}`;
        }
    }

    // Show notification when item added to cart
    showAddToCartNotification(itemName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fa-solid fa-check-circle"></i>
                <span>${itemName} added to cart!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Smooth entrance animation
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0) scale(1)';
            notification.style.opacity = '1';
        });
        
        // Smooth exit animation
        setTimeout(() => {
            notification.style.transform = 'translateX(100%) scale(0.8)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Show notification when cart is cleared
    showClearCartNotification() {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fa-solid fa-trash"></i>
                <span>Cart cleared successfully!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Smooth entrance animation
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0) scale(1)';
            notification.style.opacity = '1';
        });
        
        // Smooth exit animation
        setTimeout(() => {
            notification.style.transform = 'translateX(100%) scale(0.8)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart, .buy-now')) {
                const productCard = e.target.closest('.product-card, .product');
                if (productCard) {
                    const id = productCard.dataset.productId || Math.random().toString(36).substr(2, 9);
                    const name = productCard.querySelector('.product-name')?.textContent || 'Product';
                    const priceElement = productCard.querySelector('.price, .current-price');
                    const price = priceElement ? priceElement.textContent.replace(/[$,]/g, '') : '0';
                    const image = productCard.querySelector('img')?.src || '';
                    
                    this.addToCart(id, name, price, image);
                    
                    if (e.target.matches('.buy-now')) {
                        this.showCheckout();
                    }
                }
            }
        });

        // Cart dropdown functionality
        const cartToggle = document.getElementById('cart-toggle');
        const cartDropdown = document.getElementById('cart-dropdown');
        const clearCartBtn = document.getElementById('clear-cart-btn');
        
        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdown.classList.toggle('show');
            });
            
            // Hide cart dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.cart-dropdown')) {
                    cartDropdown.classList.remove('show');
                }
            });
            
            if (clearCartBtn) {
                clearCartBtn.addEventListener('click', () => {
                    console.log('Clear cart button clicked', this.items.length); // Debug log
                    if (this.items.length > 0) {
                        // Show confirmation dialog
                        if (confirm('Are you sure you want to remove all items from your cart?')) {
                            this.clearCart();
                            cartDropdown.classList.remove('show');
                        }
                    } else {
                        // Even if cart is empty, show feedback
                        this.showClearCartNotification();
                    }
                });
            }
        }
    }

    // Show checkout modal
    showCheckout() {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.style.opacity = '0';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Checkout</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="cart-items">
                        ${this.items.map(item => `
                            <div class="checkout-item">
                                <img src="${item.image}" alt="${item.name}" width="50">
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p>Quantity: ${item.quantity}</p>
                                    <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="checkout-total">
                        <h3>Total: $${this.getTotal().toFixed(2)}</h3>
                    </div>
                    <button class="checkout-btn">Proceed to Payment</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Smooth entrance animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'scale(1) translateY(0)';
        });
        
        // Close modal functionality with smooth animation
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.querySelector('.modal-content').style.transform = 'scale(0.8) translateY(-50px)';
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        };
        
        modal.querySelector('.close').addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Product filtering and search
class ProductFilter {
    constructor() {
        this.products = document.querySelectorAll('.product-card, .product');
        this.initializeFilters();
    }

    // Filter products by category
    filterByCategory(category) {
        this.products.forEach(product => {
            const productCategory = product.dataset.category || '';
            if (category === 'all' || productCategory.toLowerCase().includes(category.toLowerCase())) {
                product.style.display = 'flex';
                product.style.opacity = '1';
                product.style.transform = 'scale(1)';
            } else {
                product.style.display = 'none';
            }
        });
    }

    // Filter products by price range
    filterByPrice(minPrice, maxPrice) {
        this.products.forEach(product => {
            const priceElement = product.querySelector('.price, .current-price');
            if (priceElement) {
                const price = parseFloat(priceElement.textContent.replace(/[$,]/g, ''));
                if (price >= minPrice && price <= maxPrice) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            }
        });
    }

    // Search products
    searchProducts(query) {
        const searchResults = document.getElementById('search-results');
        
        if (!query.trim()) {
            searchResults.classList.remove('show');
            // Reset all products to visible
            this.products.forEach(product => {
                product.style.display = 'flex';
            });
            return;
        }

        const matchingProducts = [];
        this.products.forEach(product => {
            const name = product.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const category = product.dataset.category?.toLowerCase() || '';
            
            if (name.includes(query.toLowerCase()) || category.includes(query.toLowerCase())) {
                product.style.display = 'flex';
                matchingProducts.push({
                    element: product,
                    name: product.querySelector('.product-name')?.textContent || 'Product',
                    price: product.querySelector('.current-price, .price')?.textContent || '$0',
                    image: product.querySelector('img')?.src || '',
                    category: product.dataset.category || 'uncategorized'
                });
            } else {
                product.style.display = 'none';
            }
        });
        
        this.showSearchResults(matchingProducts, query);
    }

    // Show search results dropdown
    showSearchResults(products, query) {
        const searchResults = document.getElementById('search-results');
        
        if (products.length === 0) {
            searchResults.innerHTML = `<div class="no-results">No results found for "${query}"</div>`;
        } else {
            searchResults.innerHTML = products.slice(0, 5).map(product => `
                <div class="search-result-item" onclick="productFilter.scrollToProduct('${product.element.dataset.productId}')">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="search-result-info">
                        <h4>${product.name}</h4>
                        <p>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                    </div>
                    <div class="search-result-price">${product.price}</div>
                </div>
            `).join('');
            
            if (products.length > 5) {
                searchResults.innerHTML += `<div class="search-result-item" style="justify-content: center; color: #666; font-style: italic;">... and ${products.length - 5} more results</div>`;
            }
        }
        
        searchResults.classList.add('show');
    }

    // Scroll to specific product
    scrollToProduct(productId) {
        const product = document.querySelector(`[data-product-id="${productId}"]`);
        if (product) {
            product.scrollIntoView({ behavior: 'smooth', block: 'center' });
            product.style.animation = 'highlight 2s ease';
            
            // Remove highlight animation after it completes
            setTimeout(() => {
                product.style.animation = '';
            }, 2000);
        }
        
        // Hide search results
        document.getElementById('search-results').classList.remove('show');
        document.getElementById('search-input').blur();
    }

    // Initialize filter controls
    initializeFilters() {
        // Category filter
        const categoryButtons = document.querySelectorAll('.category-filter');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                this.filterByCategory(category);
                
                // Update active state
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Price filter
        const priceFilter = document.querySelector('#price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                const [min, max] = priceFilter.value.split('-').map(Number);
                this.filterByPrice(min, max);
            });
        }

        // Search functionality
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchProducts(e.target.value);
                }, 300); // Debounce search
            });
            
            // Hide search results when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    document.getElementById('search-results').classList.remove('show');
                }
            });
            
            // Handle keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                const searchResults = document.getElementById('search-results');
                const resultItems = searchResults.querySelectorAll('.search-result-item');
                
                if (e.key === 'Escape') {
                    searchResults.classList.remove('show');
                    searchInput.blur();
                }
            });
        }
    }
}

// Smooth scrolling and navigation
function initializeNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (mobileMenuToggle && navigation) {
        mobileMenuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
        });
    }
}

// Image lazy loading and optimization
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Newsletter subscription
function initializeNewsletter() {
    const newsletterForm = document.querySelector('#newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate API call
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            this.reset();
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// Product image gallery/carousel
function initializeProductGallery() {
    const galleries = document.querySelectorAll('.product-gallery');
    
    galleries.forEach(gallery => {
        const images = gallery.querySelectorAll('img');
        const prevButton = gallery.querySelector('.gallery-prev');
        const nextButton = gallery.querySelector('.gallery-next');
        let currentIndex = 0;
        
        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            });
        }
        
        // Initialize first image as active
        if (images.length > 0) {
            showImage(0);
        }
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Stagger animation for child elements
                const children = entry.target.querySelectorAll('.product, .category, .review');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe sections
    const sections = document.querySelectorAll('.categories, .products, .reviews, .newsletter');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });

    // Observe individual items
    const items = document.querySelectorAll('.product, .category, .review');
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Fade in page
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Initialize shopping cart (make it global for HTML access)
    window.cart = new ShoppingCart();
    
    // Initialize product filtering (make it global for HTML access)
    window.productFilter = new ProductFilter();
    
    // Initialize other features
    initializeNavigation();
    initializeLazyLoading();
    initializeNewsletter();
    initializeProductGallery();
    initializeScrollAnimations();
    
    // Add some CSS for notifications and modals
    const style = document.createElement('style');
    style.textContent = `
        .cart-notification, .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            transform: translateX(100%) scale(0.8);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            z-index: 1000;
            opacity: 0;
            box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }
        
        .cart-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .cart-notification .notification-content i {
            font-size: 16px;
        }
        
        .notification.error {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            box-shadow: 0 10px 30px rgba(244, 67, 54, 0.3);
        }
        
        .notification.info {
            background: linear-gradient(135deg, #2196F3, #1976D2);
            box-shadow: 0 10px 30px rgba(33, 150, 243, 0.3);
        }
        
        .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8) translateY(-50px);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #333;
        }
        
        .close {
            font-size: 28px;
            cursor: pointer;
            color: #999;
            transition: all 0.3s ease;
            padding: 5px;
            border-radius: 50%;
        }
        
        .close:hover {
            color: #ff4757;
            background: rgba(255, 71, 87, 0.1);
            transform: rotate(90deg);
        }
        
        .checkout-item {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            padding: 15px;
            border-bottom: 1px solid #eee;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .checkout-item:hover {
            background: #f8f9fa;
            transform: translateX(5px);
        }
        
        .checkout-item img {
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .checkout-total {
            text-align: center;
            padding: 20px 0;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .checkout-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            margin-top: 20px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .checkout-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .checkout-btn:hover::before {
            left: 100%;
        }
        
        .checkout-btn:hover {
            background: linear-gradient(135deg, #0056b3, #007bff);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 123, 255, 0.3);
        }
        
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: linear-gradient(135deg, #ff4757, #ff3742);
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            animation: pulse 2s infinite;
            box-shadow: 0 3px 10px rgba(255, 71, 87, 0.4);
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Smooth scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #007bff, #0056b3);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #0056b3, #007bff);
        }
    `;
    document.head.appendChild(style);
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ShoppingCart,
        ProductFilter,
        initializeNavigation,
        initializeLazyLoading,
        initializeNewsletter,
        showNotification
    };
}

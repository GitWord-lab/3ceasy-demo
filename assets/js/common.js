/**
 * 通用交互逻辑与全局配置
 */

// 全局 Tailwind CSS 配置注入
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    brand: {
                        DEFAULT: '#ff6700', 
                        dark: '#e05a00',
                        light: '#ff8f40',
                        50: '#fff5f0'
                    },
                    text: {
                        main: '#1f2937',    /* Gray 800 - 主要文本 */
                        secondary: '#4b5563', /* Gray 600 - 辅助文本/副标题 */
                        muted: '#9ca3af',    /* Gray 400 - 弱化文本/占位符 */
                        light: '#f9fafb'     /* Gray 50 - 亮色文本 */
                    }
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                },
                fontSize: {
                    'xs-muted': ['0.75rem', { lineHeight: '1rem' }],      /* 12px 辅助说明 */
                    'sm-sec': ['0.875rem', { lineHeight: '1.25rem' }],    /* 14px 二级信息/小标签 */
                    'base-main': ['1rem', { lineHeight: '1.5rem' }],      /* 16px 正文主要字体 */
                    'lg-sub': ['1.125rem', { lineHeight: '1.75rem' }],    /* 18px 小标题/强调 */
                    'xl-title': ['1.25rem', { lineHeight: '1.75rem' }],   /* 20px 卡片标题 */
                    '2xl-title': ['1.5rem', { lineHeight: '2rem' }],      /* 24px 区块标题 */
                    '3xl-hero': ['1.875rem', { lineHeight: '2.25rem' }],  /* 30px Hero副标 */
                    '5xl-hero': ['3rem', { lineHeight: '1.1' }],          /* 48px Hero主标 */
                }
            }
        }
    }
}

// 购物车状态管理 (localStorage)
const CartManager = {
    getCart() {
        return JSON.parse(localStorage.getItem('3c_easy_cart')) || [];
    },
    saveCart(cart) {
        localStorage.setItem('3c_easy_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
    },
    addItem(item) {
        const cart = this.getCart();
        // Check if item with same id and variant exists
        const existingItem = cart.find(i => i.id === item.id && i.variant === item.variant);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        this.saveCart(cart);
    },
    updateQuantity(id, variant, quantity) {
        const cart = this.getCart();
        const item = cart.find(i => i.id === id && i.variant === variant);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(id, variant);
                return;
            }
            this.saveCart(cart);
        }
    },
    updateVariant(id, oldVariant, newVariant, newPrice) {
        const cart = this.getCart();
        const itemIndex = cart.findIndex(i => i.id === id && i.variant === oldVariant);
        if (itemIndex > -1) {
            // Check if new variant already exists
            const existingNewVariant = cart.find((i, idx) => i.id === id && i.variant === newVariant && idx !== itemIndex);
            if (existingNewVariant) {
                existingNewVariant.quantity += cart[itemIndex].quantity;
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].variant = newVariant;
                cart[itemIndex].price = newPrice;
            }
            this.saveCart(cart);
        }
    },
    removeItem(id, variant) {
        let cart = this.getCart();
        cart = cart.filter(i => !(i.id === id && i.variant === variant));
        this.saveCart(cart);
    },
    clearCart() {
        this.saveCart([]);
    },
    getTotalItems() {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },
    getSubtotal() {
        return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};

// Toast 提示功能
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('未找到 toast-container 容器');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'bg-white text-gray-800 px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 toast-enter border-l-4 border-brand';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check text-green-500"></i>
        <span class="font-medium">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-leave');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 购物车点击效果
function addToCartBtn(button, itemData) {
    if (!button) return;
    
    // Add to state
    if (itemData) {
        CartManager.addItem(itemData);
    }
    
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check"></i><span>Added</span>';
    
    // 尝试处理多种样式的按钮
    const hasOrangeBg = button.classList.contains('bg-orange-50');
    if (hasOrangeBg) {
        button.classList.replace('bg-orange-50', 'bg-green-500');
        button.classList.replace('text-brand', 'text-white');
    } else {
        button.classList.add('bg-green-500', 'text-white');
    }
    
    button.classList.remove('hover:bg-brand');
    
    setTimeout(() => {
        button.innerHTML = originalHtml;
        if (hasOrangeBg) {
            button.classList.replace('bg-green-500', 'bg-orange-50');
            button.classList.replace('text-white', 'text-brand');
        } else {
            button.classList.remove('bg-green-500', 'text-white');
        }
        button.classList.add('hover:bg-brand');
    }, 2000);

    showToast('Item successfully added to cart!');
}

// 渲染购物车抽屉
window.renderCartDrawer = function() {
    const container = document.getElementById('drawer-cart-items');
    if (!container) return;

    const cart = CartManager.getCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-text-muted">
                <i class="fa-solid fa-cart-arrow-down text-4xl mb-4"></i>
                <p>Your cart is empty.</p>
                <button onclick="toggleCart()" class="mt-4 text-brand font-bold hover:underline">Continue Shopping</button>
            </div>
        `;
        document.getElementById('drawer-cart-subtotal').textContent = '$0.00';
        updateCartBadges();
        return;
    }

    let html = '';
    cart.forEach(item => {
        html += `
            <!-- Cart Item -->
            <div class="flex gap-4 mb-6 pb-6 border-b border-gray-100 relative group cart-item">
                <button onclick="CartManager.removeItem('${item.id}', '${item.variant}')" class="absolute top-0 right-0 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><i class="fa-solid fa-trash"></i></button>
                <div class="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg">
                </div>
                <div class="flex-1 flex flex-col">
                    <h4 class="text-sm font-bold text-text-main leading-snug mb-1 pr-6">${item.name}</h4>
                    
                    <div class="text-[10px] text-text-muted mb-2 font-medium bg-gray-50 border border-gray-100 rounded px-2 py-0.5 inline-block w-fit">${item.variant}</div>

                    <div class="flex items-end justify-between mt-auto">
                        <span class="font-extrabold text-text-main item-price-display">$${item.price.toFixed(2)}</span>
                        
                        <!-- Quantity Selector -->
                        <div class="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden h-7 w-[88px] flex-shrink-0 hover:border-gray-300 transition-colors">
                            <button type="button" class="w-7 h-full flex-shrink-0 flex items-center justify-center text-text-secondary hover:bg-gray-50 hover:text-brand transition text-[10px]" onclick="CartManager.updateQuantity('${item.id}', '${item.variant}', ${item.quantity - 1})">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <input type="number" value="${item.quantity}" min="1" step="1" class="w-8 h-full flex-1 text-center font-bold text-text-main focus:outline-none border-x border-gray-200 text-xs bg-transparent p-0 m-0 item-qty" onchange="CartManager.updateQuantity('${item.id}', '${item.variant}', parseInt(this.value))">
                            <button type="button" class="w-7 h-full flex-shrink-0 flex items-center justify-center text-text-secondary hover:bg-gray-50 hover:text-brand transition text-[10px]" onclick="CartManager.updateQuantity('${item.id}', '${item.variant}', ${item.quantity + 1})">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Update Subtotal
    const subtotal = CartManager.getSubtotal();
    const formattedTotal = '$' + subtotal.toFixed(2);
    
    const drawerSubtotal = document.getElementById('drawer-cart-subtotal');
    if (drawerSubtotal) drawerSubtotal.textContent = formattedTotal;

    updateCartBadges();
};

function updateCartBadges() {
    const totalItems = CartManager.getTotalItems();
    const subtotal = CartManager.getSubtotal().toFixed(2);
    
    // Desktop & Mobile Badges
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('hidden');
        }
    });

    // Header Total Price
    const headerTotal = document.querySelector('.header-cart-total');
    if (headerTotal) headerTotal.textContent = '$' + subtotal;
}

// Event Listener for state changes
window.addEventListener('cartUpdated', () => {
    if (typeof window.renderCartDrawer === 'function') window.renderCartDrawer();
    if (typeof window.renderCartPage === 'function') window.renderCartPage();
    if (typeof window.renderCheckoutPage === 'function') window.renderCheckoutPage();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges();
    // setTimeout to ensure elements are loaded from include.js
    setTimeout(() => {
        if (typeof window.renderCartDrawer === 'function') window.renderCartDrawer();
    }, 500);
});

// 购物车价格计算 (Legacy fallback, mostly handled by state now)
window.calculateCartTotal = function() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;

    cartItems.forEach(item => {
        // Find select element to get current selected variant price
        const variantSelect = item.querySelector('select');
        const qtyInput = item.querySelector('.item-qty');
        const priceDisplay = item.querySelector('.item-price-display');
        
        if (variantSelect && qtyInput) {
            const price = parseFloat(variantSelect.value || 0);
            const qty = parseInt(qtyInput.value || 1);
            
            // Update individual item display price
            if (priceDisplay) {
                priceDisplay.textContent = '$' + price.toFixed(2);
            }
            
            total += price * qty;
        }
    });

    // Format total
    const formattedTotal = '$' + total.toFixed(2);

    // Update UI
    const drawerSubtotal = document.getElementById('drawer-cart-subtotal');
    if (drawerSubtotal) drawerSubtotal.textContent = formattedTotal;

    const headerTotal = document.querySelector('.header-cart-total');
    if (headerTotal) headerTotal.textContent = formattedTotal;
};

// 购物车抽屉切换
window.toggleCart = function() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    
    if (!drawer || !overlay) return;

    if (drawer.classList.contains('translate-x-full')) {
        // Open
        // Prevent layout shift by adding padding-right equal to scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        // Small delay for transition
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        document.body.style.overflow = 'hidden';
    } else {
        // Close
        drawer.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '0px';
        }, 300);
    }
};

// 快速查看模态框切换
window.openQuickView = function(id, imageSrc, title, price, oldPrice) {
    const modal = document.getElementById('quickview-modal');
    if (!modal) return;
    
    // Store id
    modal.dataset.productId = id;
    
    // 填充数据
    document.getElementById('qv-img').src = imageSrc;
    document.getElementById('qv-title').textContent = title;
    
    // Parse price string to number for storage
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    modal.dataset.productPrice = numericPrice;
    
    document.getElementById('qv-price').textContent = price;
    if (oldPrice) {
        document.getElementById('qv-old-price').textContent = oldPrice;
        document.getElementById('qv-old-price').style.display = 'inline-block';
    } else {
        document.getElementById('qv-old-price').style.display = 'none';
    }
    
    // Reset quantity
    const qtyInput = modal.querySelector('input[type="number"]');
    if(qtyInput) qtyInput.value = 1;
    
    // 显示
    // Prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('.backdrop').classList.remove('opacity-0');
        const content = modal.querySelector('.modal-content');
        content.classList.remove('opacity-0', 'scale-95', 'translate-y-4');
        content.classList.add('opacity-100', 'scale-100', 'translate-y-0');
    }, 10);
    document.body.style.overflow = 'hidden';
};

window.addQuickViewToCart = function(btn) {
    const modal = document.getElementById('quickview-modal');
    if (!modal) return;
    
    const id = modal.dataset.productId;
    const name = document.getElementById('qv-title').textContent;
    const price = parseFloat(modal.dataset.productPrice);
    const image = document.getElementById('qv-img').src;
    
    const variantSelect = modal.querySelector('#qv-variant');
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text : 'Default';
    
    const qtyInput = modal.querySelector('input[type="number"]');
    const quantity = parseInt(qtyInput ? qtyInput.value : 1);
    
    addToCartBtn(btn, { id, name, price, image, variant, quantity });
    
    setTimeout(() => {
        closeQuickView();
        setTimeout(toggleCart, 500);
    }, 500);
};

window.closeQuickView = function() {
    const modal = document.getElementById('quickview-modal');
    if (!modal) return;
    
    modal.querySelector('.backdrop').classList.add('opacity-0');
    const content = modal.querySelector('.modal-content');
    content.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
    content.classList.add('opacity-0', 'scale-95', 'translate-y-4');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
    }, 300);
};

// 收藏按钮切换
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('fa-heart')) {
        const icon = e.target;
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
        icon.classList.toggle('text-red-500');
        
        const isAdded = icon.classList.contains('fa-solid');
        showToast(isAdded ? 'Added to favorites' : 'Removed from favorites');
    }
});
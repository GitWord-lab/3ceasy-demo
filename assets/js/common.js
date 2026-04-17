/**
 * 通用交互逻辑
 */

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
function addToCart(button) {
    if (!button) return;
    
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
    
    // 更新购物车角标
    const cartBadge = document.querySelector('.fa-cart-shopping')?.nextElementSibling || 
                      document.querySelector('.fa-shopping-bag')?.nextElementSibling;
    if (cartBadge) {
        let currentNum = parseInt(cartBadge.innerText) || 0;
        cartBadge.innerText = currentNum + 1;
        cartBadge.classList.add('scale-125');
        setTimeout(() => cartBadge.classList.remove('scale-125'), 300);
    }
}

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
/**
 * 通用组件加载器
 * 用于在静态 HTML 页面中引用 header.html 和 footer.html
 */
document.addEventListener('DOMContentLoaded', function() {
    const includes = document.querySelectorAll('[data-include]');
    
    const loadComponent = async (el) => {
        let file = el.getAttribute('data-include');
        
        // 智能处理路径：如果路径不是以 / 开头，且当前页面在 pages/ 目录下
        // 则自动向上寻找一级目录。这让各页面引用组件更加统一。
        const isSubPage = window.location.pathname.includes('/pages/');
        if (isSubPage && !file.startsWith('/') && !file.startsWith('http') && !file.startsWith('../')) {
            file = '../' + file;
        }
        
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`无法加载组件: ${file}`);
            
            const html = await response.text();
            el.outerHTML = html; // 使用 outerHTML 替换占位符，保持 DOM 结构整洁
            
            // 如果加载的是 header，处理激活状态
            if (file.includes('header')) {
                highlightActiveNav();
            }
        } catch (error) {
            console.error('加载组件失败:', error);
        }
    };

    const highlightActiveNav = () => {
        const bodyPage = document.body.getAttribute('data-page');
        if (!bodyPage) return;

        // 延迟一小会儿确保 DOM 已渲染
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const isMobile = link.closest('#mobile-menu-drawer') !== null;
                
                if (link.getAttribute('data-page') === bodyPage) {
                    // 通用高亮样式
                    link.classList.add('bg-brand-50', 'text-brand');
                    
                    if (isMobile) {
                        // 移动端菜单特定逻辑：让图标也变色
                        const iconContainer = link.querySelector('div > div');
                        if (iconContainer) {
                            iconContainer.classList.remove('bg-gray-100', 'text-text-muted');
                            iconContainer.classList.add('bg-brand', 'text-white');
                        }
                    } else {
                        // 桌面端特定逻辑
                        link.classList.add('font-bold');
                    }
                } else {
                    link.classList.remove('bg-brand-50', 'text-brand', 'font-bold');
                    
                    if (isMobile) {
                        const iconContainer = link.querySelector('div > div');
                        if (iconContainer) {
                            iconContainer.classList.add('bg-gray-100', 'text-text-muted');
                            iconContainer.classList.remove('bg-brand', 'text-white');
                        }
                    }
                }
            });
        }, 100);
    };

    // 执行所有包含 data-include 的元素
    includes.forEach(loadComponent);
});
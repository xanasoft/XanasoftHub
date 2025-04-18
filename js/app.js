// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // 侧边栏切换功能
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
    
    // 当窗口大小改变时调整UI
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
      }
    });
    
    // 初始检查窗口大小
    if (window.innerWidth <= 768) {
      sidebar.classList.add('collapsed');
    }
    
    // 接收菜单数据
    window.api.onMenuData((menuData) => {
      renderMenu(menuData);
    });
    
    // 接收页面内容
    window.api.onPageContent((pageData) => {
      renderPageContent(pageData);
    });
    
    // 默认加载主页
    window.api.requestPageContent('home');
  });
  
  // 渲染菜单函数
  function renderMenu(menuData) {
    const menuContainer = document.getElementById('main-menu');
    menuContainer.innerHTML = '';
    
    menuData.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      menuItem.dataset.pageId = item.id;
      
      // 使用 i18n 翻译菜单项
      const translatedTitle = window.i18n.translate(item.titleKey, item.title);
      
      menuItem.innerHTML = `
        <span class="icon">${item.icon || '📄'}</span>
        <span class="menu-item-text" data-i18n>${translatedTitle}</span>
      `;
      
      menuItem.addEventListener('click', () => {
        // 移除所有菜单项的active类
        document.querySelectorAll('.menu-item').forEach(el => {
          el.classList.remove('active');
        });
        
        // 添加active类到当前项
        menuItem.classList.add('active');
        
        // 请求页面内容
        window.api.requestPageContent(item.id);
        
        // 在小屏幕上点击菜单后自动折叠
        if (window.innerWidth <= 768) {
          document.querySelector('.sidebar').classList.add('collapsed');
        }
      });
      
      menuContainer.appendChild(menuItem);
    });
    
    // 默认选中第一个菜单项
    if (menuData.length > 0) {
      const firstItem = menuContainer.querySelector('.menu-item');
      firstItem.classList.add('active');
    }
  }
  
  // 渲染页面内容函数
  function renderPageContent(pageData) {
    const pageTitle = document.getElementById('page-title');
    const contentBody = document.getElementById('content-body');
    
    if (pageData.error) {
      pageTitle.textContent = 'Error';
      contentBody.innerHTML = `<p>Failed to load content: ${pageData.message}</p>`;
      return;
    }
    
    // 设置页面标题的data-i18n属性，便于语言切换时自动更新
    pageTitle.dataset.i18n = pageData.titleKey || '';
    
    // 使用 i18n 翻译页面标题
    pageTitle.textContent = window.i18n.translate(pageData.titleKey, pageData.title);
    
    // 清空内容区域
    contentBody.innerHTML = '';
    
    // 渲染内容
    if (pageData.htmlContent) {
      contentBody.innerHTML = pageData.htmlContent;
    } else if (pageData.sections) {
      pageData.sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'content-section';
        
        // 创建部分标题并添加data-i18n属性
        const sectionTitle = document.createElement('h2');
        sectionTitle.dataset.i18n = section.titleKey || '';
        sectionTitle.textContent = window.i18n.translate(section.titleKey, section.title);
        sectionElement.appendChild(sectionTitle);
        
        // 翻译部分内容并添加data-i18n属性
        if (section.contentKey || section.content) {
          const contentPara = document.createElement('p');
          if (section.contentKey) {
            contentPara.dataset.i18n = section.contentKey;
          }
          contentPara.textContent = window.i18n.translate(section.contentKey, section.content);
          sectionElement.appendChild(contentPara);
        }
        
        contentBody.appendChild(sectionElement);
      });
    }
    
    // 翻译页面上的所有具有data-i18n属性的元素
    contentBody.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key && window.i18n.translations[key]) {
        element.textContent = window.i18n.translate(key);
      }
    });
  }
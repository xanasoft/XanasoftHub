// js/i18n.js
class I18nManager {
    constructor() {
      this.translations = {};
      this.currentLanguage = 'en';
      this.init();
    }
  
    async init() {
      // 获取系统语言
      const systemLanguage = window.api && window.api.getSystemLanguage 
        ? window.api.getSystemLanguage().split('-')[0] 
        : 'en';
      
      // 从本地存储中获取用户之前选择的语言
      const savedLanguage = localStorage.getItem('preferred-language');
      
      // 设置当前语言
      this.currentLanguage = savedLanguage || systemLanguage || 'en';
      
      // 加载翻译
      await this.loadTranslations(this.currentLanguage);
      
      // 设置语言选择器的值
      document.getElementById('language-selector').value = this.currentLanguage;
      
      // 监听语言选择变化
      document.getElementById('language-selector').addEventListener('change', async (e) => {
        const newLang = e.target.value;
        await this.changeLanguage(newLang);
      });
    }
  
    async loadTranslations(lang) {
      try {
        // 加载语言文件
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) {
          // 如果请求的语言不存在，回退到英语
          console.warn(`Language ${lang} not found, falling back to English`);
          if (lang !== 'en') {
            return this.loadTranslations('en');
          }
          throw new Error('Failed to load translations');
        }
        
        this.translations = await response.json();
        this.updatePageContent();
      } catch (error) {
        console.error('Error loading translations:', error);
        // 如果出错，使用内置的默认翻译
        this.translations = this.getDefaultTranslations();
        this.updatePageContent();
      }
    }
  
    getDefaultTranslations() {
      // 默认内置的翻译，作为加载失败时的备选
      return {
        'en': {
          'app_title': 'XanasoftHub',
          'welcome': 'Welcome',
          'home': 'Home',
          'settings': 'Settings',
          'about': 'About'
          // 更多默认翻译...
        }
      }[this.currentLanguage] || {
        'app_title': 'XanasoftHub',
        'welcome': 'Welcome',
        'home': 'Home',
        'settings': 'Settings',
        'about': 'About'
      };
    }
  
    async changeLanguage(lang) {
      this.currentLanguage = lang;
      localStorage.setItem('preferred-language', lang);
      await this.loadTranslations(lang);
    }
  
    updatePageContent() {
      // 更新所有带有data-i18n属性的元素
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && this.translations[key]) {
          element.textContent = this.translations[key];
        }
      });
      
      // 如果页面标题有当前的key，也进行更新
      const pageTitle = document.getElementById('page-title');
      if (pageTitle && pageTitle.dataset.i18n) {
        const key = pageTitle.dataset.i18n;
        if (this.translations[key]) {
          pageTitle.textContent = this.translations[key];
        }
      }
    }
  
    translate(key, defaultText = '') {
      return this.translations[key] || defaultText || key;
    }
  }
  
  // 创建全局I18n实例
  window.i18n = new I18nManager();
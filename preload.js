// preload.js
const { contextBridge, ipcRenderer } = require('electron')

// 在window对象上暴露API给渲染进程使用
contextBridge.exposeInMainWorld('api', {
  // 获取当前系统语言
  getSystemLanguage: () => {
    return navigator.language || 'en'
  },
  // 接收菜单数据
  onMenuData: (callback) => {
    ipcRenderer.on('menu-data', (_, data) => callback(data))
  },
  // 请求页面内容
  requestPageContent: (pageId) => {
    ipcRenderer.send('request-page-content', pageId)
  },
  // 接收页面内容
  onPageContent: (callback) => {
    ipcRenderer.on('page-content', (_, data) => callback(data))
  }
})
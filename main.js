import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { dirname } from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 存储主窗口的引用
let mainWindow

// 创建窗口的函数
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js')
    },
    // 设置背景色为深色，避免白屏闪烁
    backgroundColor: '#121212'
  })

  // 加载index.html
  mainWindow.loadFile('index.html')
  
  // 加载菜单数据并发送到渲染进程
  loadMenuData()
}

// 加载菜单数据的函数
function loadMenuData() {
  // 这里可以从本地文件、数据库或API获取菜单数据
  // 这里我们使用一个模拟的JSON文件
  try {
    const menuData = JSON.parse(readFileSync(join(__dirname, 'data', 'menu.json'), 'utf8'))
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('menu-data', menuData)
    })
  } catch (error) {
    console.error('加载菜单数据失败:', error)
  }
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都被关闭时退出应用，除了在macOS上
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 处理从渲染进程发来的消息
ipcMain.on('request-page-content', (event, pageId) => {
  // 这里可以根据pageId加载不同的内容
  try {
    const pageContent = JSON.parse(readFileSync(join(__dirname, 'data', `${pageId}.json`), 'utf8'))
    event.reply('page-content', pageContent)
  } catch (error) {
    console.error(`加载页面内容失败 (${pageId}):`, error)
    event.reply('page-content', { error: true, message: 'Content not found' })
  }
})
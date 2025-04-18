import { dirname, join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, Notification, Tray, app, ipcMain, nativeImage, shell } from 'electron'
import icon from '../../resources/icon.png?asset'
import icon64 from '../../resources/icon32Template.png?asset'

import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let tray: Tray

function createTray(mainWindow: BrowserWindow) {
	const trayIcon = nativeImage.createFromPath(process.platform === 'darwin' ? icon64 : icon)
	trayIcon.setTemplateImage(true) // importante para o modo escuro no macOS

	tray = new Tray(trayIcon)

	updateTrayMenu(mainWindow, tray)

	// store.onDidChange('proxyEnabled', () => {
	// 	console.log('proxyEnabled kkkkk')
	// 	updateTrayMenu(mainWindow, tray)
	// })

	tray.setToolTip('Stealth Proxy')
	tray.on('double-click', () => {
		mainWindow?.show()
	})
}

function updateTrayMenu(mainWindow: BrowserWindow, tray: Tray) {
	if (!tray) return

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Ver',
			click: () => mainWindow?.show(),
		},
		// {
		// 	label: proxyEnabled ? 'Desconectar' : 'Conectar',
		// 	click: () => {
		// 		store.set('proxyEnabled', !proxyEnabled)
		// 	},
		// },
		{
			label: 'Sair',
			click: () => {
				app.quit()
			},
		},
	])

	tray.setContextMenu(contextMenu)
}

function createWindow(): void {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 450,
		height: 700,
		resizable: false,
		roundedCorners: true,
		show: false,
		autoHideMenuBar: true,
		icon: nativeImage.createFromPath(icon),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
			nodeIntegration: false,
			contextIsolation: true,
		},
	})

	mainWindow.on('close', (event) => {
		event.preventDefault()
		if (process.platform === 'darwin') {
			app?.dock?.hide()
		}
		mainWindow?.hide()
	})

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}

	createTray(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId('Stealth')
	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindow()

	app.on('activate', () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('before-quit', () => {
	tray?.destroy()
})

ipcMain.on('show-notification', (_event, { title, body }) => {
	new Notification({ title, body }).show()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

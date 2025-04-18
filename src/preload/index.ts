import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { proxy } from './proxy'
import * as ssh from './ssh'
import * as store from './store'

function notify(title: string, body: string) {
	return ipcRenderer.send('show-notification', { title, body })
}

// Custom APIs for renderer
const api = {
	proxy,
	store,
	ssh,
	notify,
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI)
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI
	// @ts-ignore (define in dts)
	window.api = api
}

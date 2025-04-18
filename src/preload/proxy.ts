const isMac = process.platform === 'darwin'

import * as macos from './mac-proxy'
import * as windows from './windows-proxy'

export const proxy = {
	checkManualProxyStatus: async (): Promise<boolean> => {
		console.log('esta aqui')
		if (isMac) {
			return await macos.isProxyEnabled()
		}
		return await windows.checkManualProxyStatus()
	},
	getPortAndIp: async (): Promise<{ port: number; ip: string } | null> => {
		if (isMac) {
			return (await macos.getProxyConfig()) as any
		}
		return await windows.getPortAndIp()
	},
	enableWindowsProxy: async (port: number, ip: string) => {
		if (isMac) {
			return await macos.enableProxy(port, ip)
		}
		return await windows.enableWindowsProxy(port, ip)
	},
	disableWindowsProxy: async (): Promise<boolean> => {
		if (isMac) {
			return await macos.disableProxy()
		}
		return windows.disableWindowsProxy()
	},
	setProxySettings: windows.setProxySettings,
	loadSettings: windows.loadSettings,
}

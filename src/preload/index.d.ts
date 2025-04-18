import type { ElectronAPI } from '@electron-toolkit/preload'
import type { proxy } from './proxy'
import type * as ssh from './ssh'
import type * as store from './store'
import type * as windowsProxy from './windows-proxy'

type StoreType = Omit<typeof store, 'store' | 'Store'>
type OSProxy = typeof proxy
type SSHType = typeof ssh

declare global {
	interface Window {
		electron: ElectronAPI
		api: {
			ssh: SSHType
			store: StoreType
			proxy: OSProxy
			notify: (title: string, body: string) => void
		}
	}
}

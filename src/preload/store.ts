import { EventEmitter } from 'node:events'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

const macUserDataPath = `/Users/${os.userInfo().username}/Library/Application Support`

export class Store extends EventEmitter {
	private readonly filePath: string
	readonly events: EventTarget

	constructor({ fileName = 'store.json', defaults = {} }: { defaults?: any; fileName?: string }) {
		super()
		this.events = new EventTarget()
		const userDataPath = process.platform === 'darwin' ? macUserDataPath : path.resolve('.') // ou app.getPath('userData') no Electron
		this.filePath = path.join(userDataPath, fileName)

		if (!fs.existsSync(this.filePath)) {
			fs.writeFileSync(this.filePath, JSON.stringify(defaults, null, 2), 'utf-8')
		} else {
			const raw = fs.readFileSync(this.filePath, 'utf-8')
			try {
				const current = JSON.parse(raw)
				const merged = this.deepMerge(defaults, current)
				fs.writeFileSync(this.filePath, JSON.stringify(merged, null, 2), 'utf-8')
			} catch {
				fs.writeFileSync(this.filePath, JSON.stringify(defaults, null, 2), 'utf-8')
			}
		}
	}

	private deepMerge(source: any, target: any): any {
		for (const key in source) {
			if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
				target[key] = this.deepMerge(source[key], target[key] || {})
			} else if (!(key in target)) {
				target[key] = source[key]
			}
		}
		return target
	}

	private readData(): Record<string, any> {
		try {
			const raw = fs.readFileSync(this.filePath, 'utf-8')
			return JSON.parse(raw)
		} catch (err) {
			console.error('Failed to read store:', err)
			return {}
		}
	}

	private writeData(data: Record<string, any>): void {
		try {
			fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
		} catch (err) {
			console.error('Failed to write store:', err)
		}
	}

	get<T>(key: string): T {
		const data = this.readData()
		return data[key] as T
	}

	set(key: string, value: any): void {
		const data = this.readData()

		const oldValue = data[key]

		const newData = { ...data, [key]: value }

		this.writeData(newData)

		this.emit(btoa(key), { oldValue, newValue: value })
	}

	delete(key: string): void {
		const data = this.readData()

		const oldValue = data[key]

		delete data[key]

		this.writeData(data)

		this.emit(key, { oldValue, newValue: undefined })
	}

	onDidChange(key: string, callback: (oldValue: any, newValue: any) => void): void {
		this._handleChange(() => this.get(key), callback)
	}

	private _handleChange(getter: () => any, callback: any): any {
		let currentValue = getter()

		const onChange = (): void => {
			const oldValue = currentValue
			const newValue = getter()

			if (newValue === oldValue) {
				return
			}

			currentValue = newValue
			callback.call(this, newValue, oldValue)
		}

		this.events.addEventListener('change', onChange)

		return () => {
			this.events.removeEventListener('change', onChange)
		}
	}
}

type AppTheme = 'light' | 'dark' | 'system'

export const store = new Store({
	defaults: {
		host: '',
		port: null,
		autoStart: false,
		autoConnect: false,
		proxyEnabled: false,
		theme: 'dark',
	},
})

export const setTheme = (theme: AppTheme) => {
	store.set('theme', theme)
}

export const getTheme = (): AppTheme => {
	return store.get<AppTheme>('theme')
}

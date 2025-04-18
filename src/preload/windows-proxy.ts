import { exec } from 'node:child_process'
import { store } from './store'

export type ProxySettings = {
	host?: string
	port?: number
	autoStart?: boolean
	autoConnect?: boolean
	proxyEnabled?: boolean
}

export const checkManualProxyStatus = async (): Promise<boolean> => {
	const comandoStatus = `REG QUERY "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable`

	return new Promise((resolve, reject) => {
		exec(comandoStatus, (erro, stdout) => {
			if (erro) {
				return reject(`Erro ao obter o status do proxy: ${erro.message}`)
			}
			const ativado = stdout.includes('0x1')
			return resolve(ativado)
		})
	})
}

export const getPortAndIp = async (): Promise<{ port: number; ip: string } | null> => {
	const comando = `REG QUERY "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer`

	return new Promise((resolve) => {
		exec(comando, (erro, stdout) => {
			if (erro) {
				return resolve(null)
			}

			const linhas = stdout.trim().split('\n')
			const linhaProxy = linhas.find((linha) => linha.includes('ProxyServer'))

			if (!linhaProxy) {
				resolve(null)
				return
			}

			const partes = linhaProxy.trim().split(/\s+/)
			const valor = partes[partes.length - 1]
			const [ip, porta] = valor.split(':')

			resolve({ ip, port: Number(porta) })
		})
	})
}

export const enableWindowsProxy = async (port: number, ip: string) => {
	const comandoEnable = `REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f`
	const comandoServer = `REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d "${ip}:${port}" /f`

	return new Promise((resolve) => {
		exec(comandoEnable, (erro) => {
			if (erro) {
				console.log('Erro ao ativar o proxy:', erro)
				return resolve(false)
			}
			exec(comandoServer, (erro) => {
				if (erro) {
					console.log('Erro ao definir o servidor proxy:', erro)
					return resolve(false)
				}
				resolve(true)
			})
		})
	})
}

export const disableWindowsProxy = async (): Promise<boolean> => {
	const comandoDisable = `REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f`

	return new Promise((resolve) => {
		exec(comandoDisable, (erro) => {
			if (erro) {
				return resolve(false)
			}
			return resolve(true)
		})
	})
}

export const setProxySettings = (params: ProxySettings) => {
	params?.host !== undefined && store.set('host', params.host)
	params?.port !== undefined && store.set('port', params.port)
	params?.autoStart !== undefined && store.set('autoStart', params.autoStart)
	params?.autoConnect !== undefined && store.set('autoConnect', params.autoConnect)
	params?.proxyEnabled !== undefined && store.set('proxyEnabled', params.proxyEnabled)
}

export const loadSettings = (): ProxySettings => {
	return {
		host: store.get('proxy.host'),
		port: store.get('proxy.port'),
		autoStart: store.get('autoStart'),
		autoConnect: store.get('autoConnect'),
		proxyEnabled: store.get('proxyEnabled'),
	}
}

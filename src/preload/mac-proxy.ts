import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const interfaceName = 'Wi-Fi' // Altere se necessário

export async function isProxyEnabled() {
	try {
		const { stdout } = await execAsync(`networksetup -getwebproxy ${interfaceName}`)
		return stdout.includes('Enabled: Yes')
	} catch (error) {
		console.error('Erro ao verificar o status do proxy:', error)
		return false
	}
}

export async function getProxyConfig() {
	try {
		const { stdout } = await execAsync(`networksetup -getwebproxy "${interfaceName}"`)

		const ipMatch = stdout.match(/Server: (.+)/)
		const portMatch = stdout.match(/Port: (\d+)/)

		return {
			ip: ipMatch?.[1] || null,
			port: portMatch?.[1] || null,
		}
	} catch (error) {
		console.error('Erro ao obter a configuração do proxy:', error)
		return {
			ip: null,
			port: null,
		}
	}
}

export async function disableProxy() {
	try {
		await execAsync(`networksetup -setwebproxystate "${interfaceName}" off`)
		await execAsync(`networksetup -setsecurewebproxystate "${interfaceName}" off`)
		return true
	} catch (error) {
		console.error('Erro ao desativar o proxy:', error)
		return false
	}
}

export async function enableProxy(port: number, ip: string) {
	try {
		await execAsync(`networksetup -setwebproxy "${interfaceName}" ${ip} ${port}`)
		await execAsync(`networksetup -setsecurewebproxy "${interfaceName}" ${ip} ${port}`)
		return true
	} catch (error) {
		console.error('Erro ao ativar o proxy:', error)
		return false
	}
}

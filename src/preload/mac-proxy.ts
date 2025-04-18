import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const interfaceName = 'Wi-Fi' // Altere se necessário

export async function isProxyEnabled() {
	try {
		const { stdout } = await execAsync(`networksetup -getwebproxy ${interfaceName}`)
		console.log('eh aquiiiii', stdout)
		return stdout.includes('Enabled')
	} catch (error) {
		console.error('Erro ao verificar o status do proxy:', error)
		return false
	}
}

export async function getProxyConfig() {
	const { stdout } = await execAsync(`networksetup -getwebproxy "${interfaceName}"`)

	const ipMatch = stdout.match(/Server: (.+)/)
	const portMatch = stdout.match(/Port: (\d+)/)

	return {
		ip: ipMatch?.[1] || null,
		port: portMatch?.[1] || null,
	}
}

export async function disableProxy() {
	await execAsync(`networksetup -setwebproxystate "${interfaceName}" off`)
	await execAsync(`networksetup -setsecurewebproxystate "${interfaceName}" off`)

	return true
}

export async function enableProxy(port: number, ip: string) {
	await execAsync(`networksetup -setwebproxy "${interfaceName}" ${ip} ${port}`)

	await execAsync(`networksetup -setsecurewebproxy "${interfaceName}" ${ip} ${port}`)

	return true
}

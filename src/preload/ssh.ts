import { NodeSSH, type SSHExecCommandOptions } from 'node-ssh'

export class SSHConnector {
	#ssh: NodeSSH = new NodeSSH()

	constructor(
		private readonly host: string,
		private readonly username: string,
		private readonly password: string,
		private readonly port: number = 22,
	) {
		this.connect()
	}

	async createConnection(): Promise<NodeSSH> {
		const ssh = new NodeSSH()
		return await ssh.connect({
			host: this.host,
			username: this.username,
			password: this.password,
			port: this.port,
		})
	}

	async connect(): Promise<this> {
		this.#ssh = await this.createConnection()

		this.#ssh.connection?.on('timeout', async () => {
			this.#ssh = await this.createConnection()
		})
		this.#ssh.connection?.on('error', async () => {
			this.#ssh = await this.createConnection()
		})
		this.#ssh.connection?.on('close', async () => {
			this.#ssh = await this.createConnection()
		})
		this.#ssh.connection?.on('end', async () => {
			this.#ssh = await this.createConnection()
		})

		return this
	}

	async exec(command: string, options?: SSHExecCommandOptions): Promise<Awaited<ReturnType<NodeSSH['execCommand']>>> {
		return await this.#ssh.execCommand(command, options)
	}
}

export const createSSHConnector = () => {
	const env = import.meta.env as any
	return new SSHConnector(
		env.VITE_SSH_REMOTE_HOST,
		env.VITE_SSH_REMOTE_USER,
		env.VITE_SSH_REMOTE_PASSWORD,
		env.VITE_SSH_REMOTE_PORT ?? 22,
	)
}

const ssh = createSSHConnector()

const checkVPNStatus = async () => {
	const response = await ssh.exec('/opt/forticlient/fortivpn status')

	if (!response.stdout || response.stderr) {
		return {
			connected: false,
			duration: '',
		}
	}

	return {
		connected: /Status:\s*Connected/.test(response.stdout),
		duration: response.stdout?.match(/Duration:\s*(\d{2}:\d{2}:\d{2})/)?.[1],
	}
}

const checkTCPProxyStatus = async () => {
	const response = await ssh.exec('ss -tuln | grep ":1080"')

	return {
		connected: response?.stdout?.trim() !== '',
		duration: '',
	}
}

const checkSquidProxyStatus = async () => {
	const response = await ssh.exec('ss -tuln | grep ":3128"')

	return {
		connected: response?.stdout?.trim() !== '',
		duration: '',
	}
}

export const sshActions = {
	checkVPNStatus,
	checkTCPProxyStatus,
	checkSquidProxyStatus,
}

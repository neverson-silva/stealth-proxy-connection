import { StatusChecker } from './status-checker'

export default function ProxySquidStatus() {
	const {
		notify,
		ssh: { sshActions },
	} = window.api

	return (
		<StatusChecker
			description="Squid Proxy"
			checkStatus={sshActions.checkSquidProxyStatus}
			onStatusChange={(connected) =>
				notify(
					connected ? 'Squid Proxy conectado' : 'Squid Proxy desconectado',
					connected ? 'Conexão com squid foi estabelecida com sucesso.' : 'A conexão com o squid foi encerrada.',
				)
			}
		/>
	)
}

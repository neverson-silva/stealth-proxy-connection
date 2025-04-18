import { StatusChecker } from './status-checker'

export const ProxyTCPStatus = () => {
	const {
		notify,
		ssh: { sshActions },
	} = window.api
	return (
		<StatusChecker
			description="Proxy TCP"
			checkStatus={sshActions.checkTCPProxyStatus}
			onStatusChange={(connected) =>
				notify(
					connected ? 'Proxy TCP conectado' : 'Proxy TCP desconectado',
					connected
						? 'Conexão com proxy tcp foi estabelecida com sucesso.'
						: 'A conexão com o proxy tcp foi encerrada.',
				)
			}
		/>
	)
}

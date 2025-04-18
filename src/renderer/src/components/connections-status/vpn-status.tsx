import { StatusChecker } from './status-checker'
export const VPNStatus = () => {
	const {
		notify,
		ssh: { sshActions },
	} = window.api

	return (
		<StatusChecker
			description="Forticlient VPN"
			checkStatus={sshActions.checkVPNStatus}
			onStatusChange={(isAlive) =>
				notify(
					isAlive ? 'Forticlient VPN conectado' : 'Forticlient VPN desconectado',
					isAlive ? 'A conexão VPN foi estabelecida com sucesso.' : 'A conexão VPN foi encerrada.',
				)
			}
		/>
	)
}

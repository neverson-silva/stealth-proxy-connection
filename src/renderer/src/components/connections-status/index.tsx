import ProxySquidStatus from './proxy-squid-status'
import { ProxyTCPStatus } from './proxy-tcp-status'
import { VPNStatus } from './vpn-status'

export const ConnectionStatus = () => {
	return (
		<div>
			<h2 className="font-montserrat font-bold text-lg mb-3">Status dos Serviços</h2>

			<ul className="text-sm flex gap-2 flex-col">
				<li className="text-sm flex flex-row gap-2">
					<ProxySquidStatus />
				</li>
				<li className="text-sm flex flex-row gap-2">
					<ProxyTCPStatus />
				</li>
				<li className="text-sm flex flex-row gap-2">
					<VPNStatus />
				</li>
			</ul>
		</div>
	)
}

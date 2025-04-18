import { useEffect } from 'react'
import { ThemeProvider } from './components/theme-provider'

import { ConnectionStatus } from './components/connections-status'
import { Logo } from './components/logo'
import { ProxyConnectionForm } from './components/proxy-connection-form'
import { Divider } from './components/ui/divider'

function App(): JSX.Element {
	const { checkManualProxyStatus, getPortAndIp } = window.api.proxy
	const { setProxySettings } = window.api.proxy

	const handleInicialSettings = async () => {
		const proxyEnabled = await checkManualProxyStatus()
		const portAndIp = await getPortAndIp()

		setProxySettings({ proxyEnabled, port: portAndIp?.port, host: portAndIp?.ip })
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		handleInicialSettings()
	}, [])

	return (
		<ThemeProvider defaultTheme="dark">
			<div className="h-dvh px-6 bg-zinc-100 dark:bg-background-dark overflow-y-hidden">
				<div className="mb-4">
					<Logo />
				</div>
				<ProxyConnectionForm />
				<div className="mt-6">
					<Divider />
				</div>
				<ConnectionStatus />
			</div>
		</ThemeProvider>
	)
}

export default App

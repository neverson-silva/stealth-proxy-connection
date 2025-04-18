import { useEffect } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

type UseProxyState = {
	isConnecting: boolean
	setIsConnection: (isConnecting: boolean) => void
	autoConnect?: boolean
	setAutoConnect: (autoConnect: boolean) => void
	isConnected: boolean
	setIsConnected: (isConnected: boolean) => void
	autoStart?: boolean
	setAutoStart: (autoStart: boolean) => void
	host?: string
	setHost: (host?: string) => void
	port?: number
	setPort: (port?: number) => void
}

const useProxyStateStore = create<UseProxyState>((set) => ({
	isConnecting: false,
	setIsConnection: (isConnecting) => set({ isConnecting }),
	autoConnect: false,
	setAutoConnect: (autoConnect) => set({ autoConnect }),
	isConnected: false,
	setIsConnected: (isConnected) => set({ isConnected }),
	autoStart: false,
	setAutoStart: (autoStart) => set({ autoStart }),
	host: '',
	setHost: (host?: string) => set({ host }),
	port: undefined,
	setPort: (port?: number) => set({ port }),
}))

export const useProxyState = () => {
	const {
		isConnecting,
		setIsConnecting,
		autoConnect,
		setAutoConnect,
		isConnected,
		setIsConnected,
		autoStart,
		setAutoStart,
		port,
		setPort,
		host,
		setHost,
	} = useProxyStateStore(
		useShallow((state) => ({
			isConnecting: state.isConnecting,
			setIsConnecting: state.setIsConnection,
			autoConnect: state.autoConnect,
			setAutoConnect: state.setAutoConnect,
			isConnected: state.isConnected,
			setIsConnected: state.setIsConnected,
			autoStart: state.autoStart,
			setAutoStart: state.setAutoStart,
			port: state.port,
			setPort: state.setPort,
			host: state.host,
			setHost: state.setHost,
		})),
	)

	const { checkManualProxyStatus, getPortAndIp, loadSettings, setProxySettings } = window.api.proxy

	const handleLoadDefaultData = async () => {
		const settings = loadSettings()
		const proxyEnabled = await checkManualProxyStatus()

		console.log('is os', proxyEnabled)
		const portAndIp = await getPortAndIp()

		const ip = portAndIp?.port ?? settings?.port
		const host = portAndIp?.ip ?? settings?.host

		setAutoConnect(settings.autoConnect ?? false)
		setAutoStart(settings.autoStart ?? false)

		setIsConnected(proxyEnabled)

		setPort(ip)
		setHost(host)

		setProxySettings({ proxyEnabled, port, host })
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		handleLoadDefaultData()
	}, [])

	return {
		isConnecting,
		setIsConnecting,
		autoConnect,
		setAutoConnect: (_autoConnect) => {
			setAutoConnect(_autoConnect)
			setProxySettings({ autoConnect: _autoConnect })
		},
		isConnected,
		setIsConnected: (_proxyEnabled?: boolean) => {
			setIsConnected(_proxyEnabled ?? false)
			setProxySettings({ proxyEnabled: _proxyEnabled })
		},
		autoStart,
		setAutoStart: (_autoStart) => {
			setAutoStart(_autoStart)
			setProxySettings({ autoStart: _autoStart })
		},
		port,
		setPort: (_port) => {
			setPort(_port)
			setProxySettings({ port: _port })
		},
		host,
		setHost: (_host) => {
			setHost(_host)
			setProxySettings({ host: _host })
		},
	}
}

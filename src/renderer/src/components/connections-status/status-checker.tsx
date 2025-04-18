import type React from 'react'
import { useEffect, useState } from 'react'
import { StatusShield } from './status-shield'

type Props = {
	description: string
	onStatusChange?: (isConnected: boolean) => void
	checkStatus: () => Promise<{
		connected: boolean
		duration: string | undefined
	}>
	intervalCheck?: number
}
export const StatusChecker: React.FC<Props> = ({ description, onStatusChange, checkStatus, intervalCheck = 10000 }) => {
	const [isConnected, setIsConnected] = useState(false)
	const [previousConnectionStatus, setPreviousConnectionStatus] = useState(false)

	const [duration, setDuration] = useState('')

	const getStatus = async () => {
		const response = await checkStatus()
		setIsConnected((old) => {
			setPreviousConnectionStatus(old)
			return response?.connected
		})
		setDuration(response?.duration ?? '')
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const interval = setInterval(() => {
			getStatus()
		}, intervalCheck) // 10 segundos

		// Executa imediatamente na primeira vez também, se quiser
		getStatus()

		// Cleanup para quando o componente desmontar
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (previousConnectionStatus !== isConnected && onStatusChange) {
			onStatusChange(isConnected)
		}
	}, [previousConnectionStatus, isConnected, onStatusChange])

	return (
		<>
			<StatusShield isAlive={isConnected} />
			{description} {!!duration && `há ${duration}`}
		</>
	)
}

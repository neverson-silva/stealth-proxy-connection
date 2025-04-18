import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@renderer/components/ui/button'
import { Form, FormField } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useProxyState } from '@renderer/hooks/useProxyState'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
// import { Checkbox } from '../ui/checkbox'

export const proxyConnectionSchema = z.object({
	autoConnect: z.boolean().default(false),
	autoStart: z.boolean().default(false),
	host: z.string().refine(
		(val) => {
			// Expressão para IPv4 ou IPv6
			const ipv4 = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
			const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|::1)$/
			return ipv4.test(val) || ipv6.test(val)
		},
		{
			message: 'Endereço IP inválido',
		},
	),
	port: z
		.string({ required_error: 'Não informado' })
		.transform((val) => Number(val))
		.refine((val) => Number.isInteger(val) && val >= 1 && val <= 65535, {
			message: 'Porta inválida',
		}),
})

export const ProxyConnectionForm = () => {
	const {
		isConnected,
		isConnecting,
		autoConnect,
		autoStart,
		port,
		host,
		setHost,
		// setAutoConnect,
		// setAutoStart,
		setIsConnected,
		setIsConnecting,
		setPort,
	} = useProxyState()

	const form = useForm<z.infer<typeof proxyConnectionSchema>>({
		resolver: zodResolver(proxyConnectionSchema) as any,
		defaultValues: {},
	})

	const { enableWindowsProxy, disableWindowsProxy } = window.api.proxy

	async function onConnect(values: z.infer<typeof proxyConnectionSchema>) {
		setIsConnecting(true)
		await enableWindowsProxy(values.port, values.host)
		setIsConnected(true)
		setIsConnecting(false)
	}

	async function onDisconnect() {
		const disabled = await disableWindowsProxy()
		setIsConnected(!disabled)
	}

	useEffect(() => {
		host && form.setValue('host', host ?? '')
		port && form.setValue('port', String(port) as any)
		form.setValue('autoConnect', autoConnect ?? false)
		form.setValue('autoStart', autoStart ?? false)
	}, [host, port, autoConnect, autoStart, form])

	return (
		<>
			<Form {...form} className="flex flex-row gap-4 items-center flex-wrap " onSubmit={form.handleSubmit(onConnect)}>
				<FormField
					label="Endereço IP"
					control={form.control}
					name="host"
					render={({ field }) => (
						<Input
							disabled={isConnected}
							{...field}
							onChange={(ev) => setHost(ev.target.value as any)}
							className="h-11 w-64 flex-1"
						/>
					)}
				/>
				<FormField
					label="Porta"
					control={form.control}
					name="port"
					render={({ field }) => (
						<Input
							disabled={isConnected}
							{...field}
							onChange={(ev) => setPort(ev.target.value as any)}
							className="h-11 w-20"
						/>
					)}
				/>
				{/* <FormField
					control={form.control}
					name="autoConnect"
					render={({ field }) => {
						return (
							<FormItem className="flex gap-2 ">
								<Checkbox
									{...field}
									checked={autoConnectCheck}
									onCheckedChange={(ev) => setAutoConnect(ev as boolean)}
									value={autoConnectCheck ? 'true' : 'false'}
								/>
								<FormLabel
									className=" cursor-pointer"
									onClick={() => {
										setAutoConnect(!autoConnectCheck)
									}}
								>
									Conectar automaticamente no início do sistema
								</FormLabel>
							</FormItem>
						)
					}}
				/>
				<FormField
					control={form.control}
					name="autoStart"
					render={({ field }) => {
						return (
							<FormItem className="flex gap-2 ">
								<Checkbox
									{...field}
									checked={autoStartCheck}
									onCheckedChange={(ev) => setAutoStart(ev as boolean)}
									value={autoStartCheck ? 'true' : 'false'}
								/>
								<FormLabel
									className=" cursor-pointer"
									onClick={() => {
										form.setValue('autoStart', !autoStartCheck)
										setAutoStart(!autoStartCheck)
									}}
								>
									Iniciar junto ao sistema
								</FormLabel>
							</FormItem>
						)
					}}
				/> */}
			</Form>

			<div className="flex flex-row gap-3">
				{/* {isConnecting && (
					<Button className="h-11 mt-5" variant={'outline'}>
						Cancelar
					</Button>
				)} */}
				{!isConnected && (
					<Button className="h-11 mt-5" disabled={isConnecting} onClick={form.handleSubmit(onConnect)}>
						{isConnecting ? 'Conectando' : 'Conectar'}
					</Button>
				)}
				{isConnected && (
					<Button className="h-11 mt-5" disabled={isConnecting} onClick={onDisconnect}>
						Desconectar
					</Button>
				)}
			</div>
		</>
	)
}

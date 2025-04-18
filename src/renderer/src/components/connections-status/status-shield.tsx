import { ShieldCheck, ShieldX } from 'lucide-react'

export const StatusShield = ({ isAlive }: { isAlive: boolean }) => {
	return (
		<>{isAlive ? <ShieldCheck className="text-green-400 size-5" /> : <ShieldX className="text-red-400 size-5" />}</>
	)
}

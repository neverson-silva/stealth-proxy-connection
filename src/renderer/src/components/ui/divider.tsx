import { cn } from '@renderer/lib/utils'
import type { ComponentProps } from 'react'

export const Divider = (props: ComponentProps<'div'>) => {
	return <div {...props} className={cn(props.className, 'border-t border-muted my-4')} />
}

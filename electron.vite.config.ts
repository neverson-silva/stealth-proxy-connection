import { resolve } from 'node:path'
//@ts-expect-error ok for this
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src'),
				'@preload': resolve('src/preload'),
				'@main': resolve('src/main'),
			},
		},
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src'),
				'@preload': resolve('src/preload'),
				'@main': resolve('src/main'),
			},
		},
	},
	renderer: {
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src'),
			},
		},
		plugins: [react(), tailwindcss()],
	},
})

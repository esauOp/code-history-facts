import { useState, useEffect } from 'react'
import { detectBrowser, getCloseTabShortcut } from '@/lib/browser-utils'

export function useBrowserDetection() {
	const [isClient, setIsClient] = useState(false)
	const [browserInfo, setBrowserInfo] = useState({
		isMac: false,
		isWindows: false,
		isLinux: false,
		platform: 'unknown',
		userAgent: 'unknown'
	})
	const [closeTabShortcut, setCloseTabShortcut] = useState({
		key: 'W',
		modifier: 'Ctrl',
		description: 'Ctrl+W'
	})

	useEffect(() => {
		// Solo ejecutar en el cliente después de la hidratación
		setIsClient(true)
		setBrowserInfo(detectBrowser())
		setCloseTabShortcut(getCloseTabShortcut())
	}, [])

	return {
		isClient,
		browserInfo,
		closeTabShortcut
	}
}

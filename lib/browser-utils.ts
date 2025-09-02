/**
 * Utilidades para detectar el explorador y generar comandos de teclado
 */

export interface BrowserInfo {
	isMac: boolean
	isWindows: boolean
	isLinux: boolean
	platform: string
	userAgent: string
}

export interface KeyboardShortcut {
	key: string
	modifier: string
	description: string
}



/**
 * Detecta información del explorador y sistema operativo
 */
export function detectBrowser(): BrowserInfo {
	const platform = navigator.platform.toLowerCase()
	const userAgent = navigator.userAgent

	return {
		isMac: platform.includes('mac'),
		isWindows: platform.includes('win'),
		isLinux: platform.includes('linux'),
		platform,
		userAgent
	}
}

/**
 * Genera el comando de teclado para cerrar pestaña según el sistema operativo
 */
export function getCloseTabShortcut(): KeyboardShortcut {
	const browserInfo = detectBrowser()
	
	if (browserInfo.isMac) {
		return {
			key: 'W',
			modifier: '⌘',
			description: '⌘+W'
		}
	}
	
	return {
		key: 'W',
		modifier: 'Ctrl',
		description: 'Ctrl+W'
	}
}

/**
 * Configura el event listener para cerrar pestaña con el atajo de teclado
 */
export function setupCloseTabListener(): () => void {
	const handleKeyDown = (e: KeyboardEvent) => {
		const browserInfo = detectBrowser()
		
		// Ctrl+W (Windows/Linux) o Cmd+W (macOS)
		if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
			e.preventDefault()
			
			// Cerrar la pestaña actual
			window.close()
			
			// Fallback para navegadores que no permiten window.close()
			if (!window.closed) {
				// Intentar navegar a about:blank como alternativa
				window.location.href = 'about:blank'
			}
		}
	}

	document.addEventListener('keydown', handleKeyDown)
	
	// Retorna función para limpiar el listener
	return () => {
		document.removeEventListener('keydown', handleKeyDown)
	}
}

/**
 * Obtiene el texto del atajo para mostrar en la UI
 */
export function getCloseTabDisplayText(): string {
	const shortcut = getCloseTabShortcut()
	return shortcut.description
}

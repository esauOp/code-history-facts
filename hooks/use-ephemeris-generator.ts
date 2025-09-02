import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useEphemerisGenerator() {
	const [generating, setGenerating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	/**
	 * Genera una efeméride para una fecha específica
	 */
	const generateEphemerisForDate = async (targetDate: Date) => {
		try {
			setGenerating(true)
			setError(null)
			setSuccess(null)

			const day = targetDate.getDate()
			const month = targetDate.getMonth() + 1
			const year = targetDate.getFullYear()

			// Verificar si ya existe una efeméride para esa fecha
			const { data: existingEphemeris } = await supabase
				.from('ephemeris')
				.select('id')
				.eq('day', day)
				.eq('month', month)
				.single()

			if (existingEphemeris) {
				setError(`Ya existe una efeméride para el ${day}/${month}/${year}`)
				return
			}

			// Llamar a la Edge Function para generar la efeméride
			const response = await fetch('/api/generate-ephemeris', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					targetDate: targetDate.toISOString(),
					day,
					month,
					year
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al generar la efeméride')
			}

			const result = await response.json()
			setSuccess(`✅ Efeméride generada exitosamente para el ${day}/${month}/${year}`)

			return result

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
			setError(errorMessage)
			console.error('Error generating ephemeris:', err)
		} finally {
			setGenerating(false)
		}
	}

	/**
	 * Genera una efeméride para mañana
	 */
	const generateTomorrowEphemeris = async () => {
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		return generateEphemerisForDate(tomorrow)
	}

	/**
	 * Genera una efeméride para hoy
	 */
	const generateTodayEphemeris = async () => {
		const today = new Date()
		return generateEphemerisForDate(today)
	}

	/**
	 * Limpia los mensajes de estado
	 */
	const clearMessages = () => {
		setError(null)
		setSuccess(null)
	}

	return {
		generating,
		error,
		success,
		generateEphemerisForDate,
		generateTomorrowEphemeris,
		generateTodayEphemeris,
		clearMessages
	}
}

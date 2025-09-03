import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateEphemerisContent } from '@/lib/gemini'

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

					// Generar efeméride usando Gemini
		const aiResponse = await generateEphemerisContent(day, month, year)
		
		// Parsear la respuesta de la IA
		let ephemerisData
		try {
			ephemerisData = JSON.parse(aiResponse)
		} catch (e) {
			throw new Error('Respuesta de IA en formato inválido')
		}

		// Preparar datos para insertar
		const newEphemeris = {
			day,
			month,
			year,
			event: ephemerisData.event,
			display_date: `${day}/${month}/${year}`,
			historical_day: ephemerisData.historical_day || day,
			historical_month: ephemerisData.historical_month || month,
			historical_year: ephemerisData.historical_year || year,
			description: ephemerisData.description || ephemerisData.significance
		}

		// Insertar en Supabase
		const { data, error } = await supabase
			.from('ephemeris')
			.insert([newEphemeris])
			.select()
			.single()

		if (error) {
			throw error
		}

		setSuccess(`✅ Efeméride generada exitosamente para el ${day}/${month}/${year}`)
		return { ephemeris: data }

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

import { useState, useEffect } from 'react'
import { supabase, type Ephemeris } from '@/lib/supabase'

export function useEphemeris() {
	const [ephemerides, setEphemerides] = useState<Ephemeris[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Obtener todas las efemérides
	const fetchEphemerides = async () => {
		try {
			setLoading(true)
			setError(null)

			const { data, error: fetchError } = await supabase
				.from('ephemeris')
				.select('*')
				.order('display_date', { ascending: true })

			if (fetchError) {
				throw fetchError
			}

			setEphemerides(data || [])
		} catch (err) {
			console.error('Error fetching ephemerides:', err)
			setError(err instanceof Error ? err.message : 'Error desconocido')
		} finally {
			setLoading(false)
		}
	}

	// Obtener efeméride para una fecha específica
	const getEphemerisForDate = (date: Date): Ephemeris | null => {
		const day = date.getDate()
		const month = date.getMonth() + 1 // getMonth() retorna 0-11

		return ephemerides.find(ephemeris => 
			ephemeris.day === day && ephemeris.month === month
		) || null
	}

	// Obtener efeméride para hoy
	const getTodayEphemeris = (): Ephemeris | null => {
		const today = new Date()
		return getEphemerisForDate(today)
	}

	// Obtener efeméride aleatoria si no hay una para hoy
	const getRandomEphemeris = (): Ephemeris | null => {
		if (ephemerides.length === 0) return null
		const randomIndex = Math.floor(Math.random() * ephemerides.length)
		return ephemerides[randomIndex]
	}

	useEffect(() => {
		fetchEphemerides()
	}, [])

	return {
		ephemerides,
		loading,
		error,
		fetchEphemerides,
		getEphemerisForDate,
		getTodayEphemeris,
		getRandomEphemeris
	}
}

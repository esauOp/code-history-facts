import { createClient } from '@supabase/supabase-js'

// Las credenciales deben estar en variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		'Missing Supabase environment variables. Please check your .env.local file.'
	)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la tabla ephemeris
export interface Ephemeris {
	id: number
	created_at: string
	day: number
	month: number
	year: number
	event: string
	display_date: string
	historical_day: number
	historical_month: number
	historical_year: number
}

export interface EphemerisCreate {
	day: number
	month: number
	year: number
	event: string
	display_date: string
	historical_day: number
	historical_month: number
	historical_year: number
}

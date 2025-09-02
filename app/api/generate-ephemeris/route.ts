import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { targetDate, day, month, year } = await request.json()

		// Validar los datos de entrada
		if (!day || !month || !year) {
			return NextResponse.json(
				{ error: 'Datos de fecha incompletos' },
				{ status: 400 }
			)
		}

		// Llamar a la Edge Function de Supabase
		const supabaseFunctionUrl = process.env.SUPABASE_FUNCTION_URL
		const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

		if (!supabaseFunctionUrl || !supabaseAnonKey) {
			return NextResponse.json(
				{ error: 'Configuración de Supabase incompleta' },
				{ status: 500 }
			)
		}

		const response = await fetch(supabaseFunctionUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${supabaseAnonKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				targetDate,
				day,
				month,
				year
			}),
		})

		if (!response.ok) {
			const errorData = await response.json()
			return NextResponse.json(
				{ error: errorData.error || 'Error en la Edge Function' },
				{ status: response.status }
			)
		}

		const result = await response.json()
		return NextResponse.json(result)

	} catch (error) {
		console.error('Error in generate-ephemeris API:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 }
		)
	}
}

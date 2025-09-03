import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
	// Manejar CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		// Obtener credenciales de Supabase
		const supabaseUrl = Deno.env.get('SUPABASE_URL')
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
		
		if (!supabaseUrl || !supabaseServiceKey) {
			throw new Error('Missing Supabase environment variables')
		}

		// Crear cliente de Supabase con service role
		const supabase = createClient(supabaseUrl, supabaseServiceKey)
		
		// Obtener la fecha de mañana
		const tomorrow = new Date()
		tomorrow.setDate(tomorrow.getDate() + 1)
		
		const day = tomorrow.getDate()
		const month = tomorrow.getMonth() + 1
		const year = tomorrow.getFullYear()
		
		// Verificar si ya existe una efeméride para mañana
		const { data: existingEphemeris } = await supabase
			.from('ephemeris')
			.select('id')
			.eq('day', day)
			.eq('month', month)
			.single()
		
		if (existingEphemeris) {
			return new Response(
				JSON.stringify({ 
					message: 'Ephemeris for tomorrow already exists',
					date: `${day}/${month}/${year}`
				}),
				{ 
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					status: 200 
				}
			)
		}

		// Generar efeméride usando Google Gemini
		const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
		if (!geminiApiKey) {
			throw new Error('Missing Gemini API key')
		}

		const genAI = new GoogleGenerativeAI(geminiApiKey)
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
		
		const prompt = `Genera una efeméride histórica relevante para el ${day} de ${getMonthName(month)} de ${year}. 

La efeméride debe ser:
- Históricamente precisa y verificable
- Relacionada con tecnología, programación, computación o innovación
- Interesante y significativa
- Con fecha exacta (día, mes, año)

Responde SOLO en formato JSON con esta estructura:
{
  "event": "Título del evento",
  "description": "Descripción detallada del evento histórico",
  "historical_day": ${day},
  "historical_month": ${month},
  "historical_year": ${year},
  "significance": "Por qué es importante este evento"
}`

		const result = await model.generateContent(prompt)
		const aiResponse = result.response.text()
		
		if (!aiResponse) {
			throw new Error('No response from Gemini')
		}

		// Parsear la respuesta de la IA
		let ephemerisData
		try {
			ephemerisData = JSON.parse(aiResponse)
		} catch (e) {
			throw new Error('Invalid JSON response from OpenAI')
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

		return new Response(
			JSON.stringify({
				message: 'Ephemeris generated and inserted successfully',
				ephemeris: data,
				generated_at: new Date().toISOString()
			}),
			{ 
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 200 
			}
		)

	} catch (error) {
		console.error('Error:', error)
		return new Response(
			JSON.stringify({ 
				error: error.message,
				timestamp: new Date().toISOString()
			}),
			{ 
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 500 
			}
		)
	}
})

function getMonthName(month: number): string {
	const months = [
		'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
		'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
	]
	return months[month - 1]
}

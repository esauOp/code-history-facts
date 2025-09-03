import { GoogleGenerativeAI } from '@google/generative-ai'

// Configuración de Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// if (!GEMINI_API_KEY) {
// 	throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno')
// }

// Inicializar Gemini
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Modelo recomendado para generación de texto
export const geminiModel = genAI.getGenerativeModel({ 
	model: 'gemini-1.5-flash',
	generationConfig: {
		temperature: 0.7,
		topK: 40,
		topP: 0.95,
		maxOutputTokens: 800,
	},
})

// Función helper para generar contenido
export async function generateContent(prompt: string): Promise<string> {
	try {
		const result = await geminiModel.generateContent(prompt)
		const response = result.response
		return response.text()
	} catch (error) {
		console.error('Error generando contenido con Gemini:', error)
		throw new Error(`Error de Gemini: ${error instanceof Error ? error.message : 'Error desconocido'}`)
	}
}

// Función específica para generar efemérides
export async function generateEphemerisContent(day: number, month: number, year: number): Promise<string> {
	const monthName = getMonthName(month)
	
	const prompt = `Genera una efeméride histórica relevante para el ${day} de ${monthName} de ${year}. 

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

	return generateContent(prompt)
}

// Función auxiliar para obtener nombre del mes
function getMonthName(month: number): string {
	const months = [
		'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
		'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
	]
	return months[month - 1]
}

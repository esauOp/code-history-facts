#!/usr/bin/env node

/**
 * Script para programar la generación automática de efemérides
 * Este script puede ejecutarse con cron o un servicio de programación
 */

const cron = require('node-cron')
const axios = require('axios')

// Configuración
const SUPABASE_FUNCTION_URL = process.env.SUPABASE_FUNCTION_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

/**
 * Ejecuta la generación de efemérides
 */
async function generateEphemeris() {
	try {
		console.log(`[${new Date().toISOString()}] Iniciando generación de efeméride...`)
		
		const response = await axios.post(SUPABASE_FUNCTION_URL, {}, {
			headers: {
				'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
				'Content-Type': 'application/json'
			},
			timeout: 30000 // 30 segundos de timeout
		})
		
		console.log(`[${new Date().toISOString()}] ✅ Éxito:`, response.data.message)
		return response.data
		
	} catch (error) {
		console.error(`[${new Date().toISOString()}] ❌ Error:`, error.message)
		
		if (error.response) {
			console.error('Respuesta del servidor:', error.response.data)
		}
		
		throw error
	}
}

/**
 * Programa la ejecución diaria
 */
function scheduleDailyGeneration() {
	// Ejecutar todos los días a las 00:01 (justo después de medianoche)
	cron.schedule('1 0 * * *', async () => {
		try {
			await generateEphemeris()
		} catch (error) {
			console.error('Error en la ejecución programada:', error.message)
		}
	}, {
		scheduled: true,
		timezone: 'Europe/Madrid'
	})
	
	console.log('✅ Programación configurada: generación diaria a las 00:01 (Madrid)')
}

/**
 * Ejecuta inmediatamente si se llama directamente
 */
if (require.main === module) {
	// Ejecutar inmediatamente
	generateEphemeris()
		.then(() => {
			console.log('Generación completada exitosamente')
			process.exit(0)
		})
		.catch((error) => {
			console.error('Error en la generación:', error.message)
			process.exit(1)
		})
} else {
	// Exportar para uso como módulo
	module.exports = {
		generateEphemeris,
		scheduleDailyGeneration
	}
}

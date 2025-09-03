# Migración a Google Gemini para Generación de Efemérides

Este documento describe cómo migrar el sistema de generación de efemérides de OpenAI a Google Gemini.

## 🚀 ¿Por qué Gemini?

### Ventajas de Gemini:
- **💰 Más económico**: Precios más bajos que OpenAI
- **⚡ Mejor rendimiento**: Modelo gemini-1.5-flash optimizado para velocidad
- **🌍 Mejor soporte en español**: Mejor comprensión del idioma español
- **🔒 Privacidad**: Datos procesados por Google con políticas claras
- **📊 Calidad**: Excelente para tareas de generación de texto estructurado

## 🔧 Configuración Inicial

### 1. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Ve a **Get API key** en la barra lateral
4. Crea una nueva API key
5. Copia la key (comienza con `AIza...`)

### 2. Actualizar Variables de Entorno

Actualiza tu archivo `.env.local`:

```bash
# Reemplazar OpenAI por Gemini
# OPENAI_API_KEY=tu_openai_key_aqui  # ← Eliminar esta línea
GEMINI_API_KEY=AIza...tu_gemini_key_aqui

# Mantener las demás variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Verificar Instalación

```bash
# Verificar que la dependencia esté instalada
pnpm list @google/generative-ai

# Debería mostrar algo como:
# @google/generative-ai@0.24.1
```

## 🏗️ Arquitectura Actualizada

### Componentes Migrados:

1. **`lib/gemini.ts`** - Configuración centralizada de Gemini
2. **`hooks/use-ephemeris-generator.ts`** - Generación directa con Gemini
3. **`scripts/generate-daily-ephemeris.js`** - Script de Node.js actualizado
4. **`supabase/functions/generate-ephemeris/index.ts`** - Edge Function actualizada

### Flujo de Generación:

```
Frontend → Hook → Gemini API → Parse JSON → Supabase
```

## 🧪 Pruebas de la Migración

### 1. Prueba Manual del Hook

```typescript
// En tu componente React
const { generateTomorrowEphemeris } = useEphemerisGenerator()

// Generar efeméride para mañana
await generateTomorrowEphemeris()
```

### 2. Prueba del Script de Node.js

```bash
# Configurar la variable de entorno
export GEMINI_API_KEY="tu_api_key_aqui"

# Ejecutar el script
node scripts/generate-daily-ephemeris.js

# O para una fecha específica
node scripts/generate-daily-ephemeris.js 2025-01-15
```

### 3. Prueba de la Edge Function

```bash
# Desplegar la función actualizada
supabase functions deploy generate-ephemeris

# Probar la función
curl -X POST https://your-project-ref.supabase.co/functions/v1/generate-ephemeris \
  -H "Authorization: Bearer tu_service_role_key"
```

## 📊 Comparación de Modelos

| Aspecto | OpenAI GPT-3.5 | Google Gemini 1.5 Flash |
|---------|----------------|-------------------------|
| **Velocidad** | ⚡⚡⚡ | ⚡⚡⚡⚡⚡ |
| **Calidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Precio** | 💰💰💰 | 💰💰 |
| **Español** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **JSON** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔍 Monitoreo y Debugging

### Logs de Gemini:

```typescript
// En lib/gemini.ts
export async function generateContent(prompt: string): Promise<string> {
	try {
		const result = await geminiModel.generateContent(prompt)
		const response = result.response
		console.log('Gemini response:', response.text()) // Para debugging
		return response.text()
	} catch (error) {
		console.error('Error de Gemini:', error)
		throw error
	}
}
```

### Verificar Respuestas:

```typescript
// En el hook
const aiResponse = await generateEphemerisContent(day, month, year)
console.log('Respuesta de Gemini:', aiResponse)

// Parsear y validar
const ephemerisData = JSON.parse(aiResponse)
console.log('Datos parseados:', ephemerisData)
```

## 🚨 Solución de Problemas

### Error: "GEMINI_API_KEY no está configurada"

```bash
# Verificar que la variable esté configurada
echo $GEMINI_API_KEY

# Configurar si no está
export GEMINI_API_KEY="tu_api_key_aqui"
```

### Error: "Invalid API key"

```bash
# Verificar que la key sea válida
# Debe comenzar con "AIza" y tener 39 caracteres
echo ${GEMINI_API_KEY:0:4} # Debe mostrar "AIza"
echo ${#GEMINI_API_KEY}    # Debe mostrar 39
```

### Error: "Rate limit exceeded"

```bash
# Gemini tiene límites de rate limiting
# Esperar unos minutos y reintentar
# O implementar retry logic
```

### Error: "Content blocked"

```bash
# Gemini puede bloquear contenido sensible
# Revisar el prompt y hacerlo más neutral
# Usar safety settings si es necesario
```

## 🔄 Rollback a OpenAI

Si necesitas volver a OpenAI temporalmente:

```typescript
// En lib/gemini.ts, comentar la implementación de Gemini
// y descomentar OpenAI

// import { Configuration, OpenAIApi } from 'openai'
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// })
// const openai = new OpenAIApi(configuration)
```

## 📈 Optimizaciones Recomendadas

### 1. Caching de Respuestas

```typescript
// Implementar cache para evitar regenerar efemérides
const cache = new Map()

export async function generateEphemerisContent(day: number, month: number, year: number): Promise<string> {
	const cacheKey = `${day}-${month}-${year}`
	
	if (cache.has(cacheKey)) {
		return cache.get(cacheKey)
	}
	
	const response = await generateContent(prompt)
	cache.set(cacheKey, response)
	return response
}
```

### 2. Retry Logic

```typescript
export async function generateContentWithRetry(prompt: string, maxRetries = 3): Promise<string> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await generateContent(prompt)
		} catch (error) {
			if (i === maxRetries - 1) throw error
			await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
		}
	}
	throw new Error('Máximo de reintentos alcanzado')
}
```

### 3. Batch Processing

```typescript
// Generar múltiples efemérides en paralelo
export async function generateMultipleEphemerides(dates: Date[]): Promise<any[]> {
	const promises = dates.map(date => 
		generateEphemerisContent(date.getDate(), date.getMonth() + 1, date.getFullYear())
	)
	return Promise.all(promises)
}
```

## 🎯 Próximos Pasos

1. **✅ Configurar GEMINI_API_KEY**
2. **✅ Probar generación manual**
3. **✅ Verificar inserción en Supabase**
4. **✅ Configurar automatización diaria**
5. **✅ Monitorear calidad de las efemérides**
6. **✅ Optimizar prompts si es necesario**

## 📚 Recursos Adicionales

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Modelos Disponibles](https://ai.google.dev/models)
- [Best Practices](https://ai.google.dev/docs/best_practices)

---

¿Necesitas ayuda con algún paso específico de la migración? ¡Revisa los logs y verifica la configuración!

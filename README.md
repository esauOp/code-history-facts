# Sistema Automatizado de Generación de Efemérides

Este sistema genera automáticamente efemérides históricas relacionadas con tecnología y programación usando IA, y las inserta en Supabase.

## 🏗️ Arquitectura del Sistema

### Componentes:
1. **Edge Function de Supabase** - Genera efemérides usando OpenAI
2. **Script de Cron** - Ejecuta la generación diariamente
3. **API Route de Next.js** - Interfaz para generación manual
4. **Hook de React** - Maneja la generación desde la UI
5. **Base de datos Supabase** - Almacena las efemérides

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jxwfbfjiudjbhbtadgfr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Para la generación automática
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here

# URL de la Edge Function (se genera automáticamente)
SUPABASE_FUNCTION_URL=https://jxwfbfjiudjbhbtadgfr.supabase.co/functions/v1/generate-ephemeris
```

### 2. Obtener Credenciales

#### Supabase:
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. **Settings > API** - Copia la URL y anon key
3. **Settings > API** - Copia la service role key (¡manténla segura!)

#### OpenAI:
1. Ve a [platform.openai.com](https://platform.openai.com)
2. **API Keys** - Crea una nueva API key
3. Copia la key al archivo `.env.local`

## 🔧 Despliegue de la Edge Function

### Opción 1: Usando Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref jxwfbfjiudjbhbtadgfr

# Desplegar la función
supabase functions deploy generate-ephemeris
```

### Opción 2: Desde el Dashboard de Supabase

1. Ve a **Edge Functions** en tu dashboard
2. Crea una nueva función llamada `generate-ephemeris`
3. Copia el contenido de `supabase/functions/generate-ephemeris/index.ts`
4. Despliega la función

## ⏰ Configuración de la Ejecución Automática

### Opción 1: Cron del Sistema (Recomendado)

```bash
# Editar crontab
crontab -e

# Agregar esta línea para ejecutar todos los días a las 00:01
1 0 * * * cd /ruta/a/tu/proyecto && node scripts/schedule-ephemeris.js
```

### Opción 2: Servicio del Sistema

Crea un archivo de servicio systemd:

```bash
# /etc/systemd/system/ephemeris-generator.service
[Unit]
Description=Ephemeris Generator Service
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/a/tu/proyecto
ExecStart=/usr/bin/node scripts/schedule-ephemeris.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Luego habilita el servicio:

```bash
sudo systemctl enable ephemeris-generator.service
sudo systemctl start ephemeris-generator.service
```

### Opción 3: GitHub Actions (Para proyectos en GitHub)

Crea `.github/workflows/generate-ephemeris.yml`:

```yaml
name: Generate Daily Ephemeris

on:
  schedule:
    - cron: '1 0 * * *'  # Todos los días a las 00:01 UTC
  workflow_dispatch:  # Permite ejecución manual

jobs:
  generate-ephemeris:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/schedule-ephemeris.js
        env:
          SUPABASE_FUNCTION_URL: ${{ secrets.SUPABASE_FUNCTION_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 🧪 Pruebas del Sistema

### 1. Prueba Manual

```bash
# Ejecutar el script manualmente
node scripts/schedule-ephemeris.js
```

### 2. Prueba desde la UI

1. Inicia tu aplicación Next.js
2. Ve a la sección "Generación Automática de Efemérides"
3. Haz clic en "Generar para mañana"
4. Verifica que se genere y se inserte en Supabase

### 3. Verificar en Supabase

1. Ve a tu dashboard de Supabase
2. **Table Editor > ephemeris**
3. Verifica que se haya insertado la nueva efeméride

## 🔍 Monitoreo y Logs

### Logs de la Edge Function

Los logs aparecen en:
- **Supabase Dashboard > Edge Functions > generate-ephemeris > Logs**

### Logs del Script de Cron

```bash
# Ver logs del cron
grep CRON /var/log/syslog

# Ver logs específicos
tail -f /var/log/ephemeris-generator.log
```

## 🚨 Solución de Problemas

### Error: "Missing OpenAI API key"
- Verifica que `OPENAI_API_KEY` esté en `.env.local`
- Asegúrate de que la key sea válida

### Error: "Missing Supabase environment variables"
- Verifica que todas las variables de Supabase estén configuradas
- Asegúrate de que la service role key tenga permisos de escritura

### Error: "Edge Function not found"
- Verifica que la Edge Function esté desplegada
- Comprueba que la URL en `SUPABASE_FUNCTION_URL` sea correcta

### La efeméride no se genera
- Verifica los logs de la Edge Function
- Comprueba que OpenAI esté respondiendo
- Verifica que la tabla `ephemeris` tenga los permisos correctos

## 📊 Estructura de la Base de Datos

La tabla `ephemeris` debe tener esta estructura:

```sql
CREATE TABLE ephemeris (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  event TEXT NOT NULL,
  display_date DATE,
  historical_day INTEGER,
  historical_month INTEGER,
  historical_year INTEGER,
  description TEXT
);
```

## 🔐 Permisos de RLS

Asegúrate de que las políticas RLS permitan:
- **Lectura** para usuarios anónimos
- **Escritura** solo para la service role key

```sql
-- Política de lectura
CREATE POLICY "Allow anonymous read access" ON ephemeris
  FOR SELECT USING (true);

-- Política de escritura para service role
CREATE POLICY "Allow service role insert" ON ephemeris
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

## 📈 Escalabilidad

### Para múltiples proyectos:
- Crea diferentes Edge Functions por proyecto
- Usa diferentes tablas o esquemas
- Configura diferentes horarios de ejecución

### Para mayor frecuencia:
- Modifica el cron para ejecutar cada hora
- Implementa rate limiting en OpenAI
- Usa colas de trabajo para procesamiento asíncrono

## 🎯 Próximos Pasos

1. **Configura las variables de entorno**
2. **Despliega la Edge Function**
3. **Configura la ejecución automática**
4. **Prueba el sistema manualmente**
5. **Monitorea la ejecución automática**
6. **Personaliza según tus necesidades**

---

¿Necesitas ayuda con algún paso específico? ¡Revisa los logs y verifica la configuración!

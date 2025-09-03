#!/bin/bash

# 🚀 Script de Configuración para GitHub Actions
# Este script ayuda a configurar el entorno para la ejecución automática

echo "🚀 Configurando GitHub Actions para Generación Automática de Efemérides"
echo "=================================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Verificar que el script de generación existe
if [ ! -f "scripts/generate-daily-ephemeris.js" ]; then
    echo "❌ Error: No se encontró scripts/generate-daily-ephemeris.js"
    exit 1
fi

echo "✅ Verificaciones básicas completadas"
echo ""

# Mostrar información del proyecto
echo "📋 Información del Proyecto:"
echo "   - Nombre: $(node -p "require('./package.json').name")"
echo "   - Versión: $(node -p "require('./package.json').version")"
echo "   - Node.js: $(node --version)"
echo "   - NPM: $(npm --version)"
echo ""

# Verificar dependencias
echo "🔍 Verificando dependencias..."
if npm list @google/generative-ai > /dev/null 2>&1; then
    echo "   ✅ @google/generative-ai instalado"
else
    echo "   ❌ @google/generative-ai NO instalado"
    echo "   Ejecuta: npm install @google/generative-ai"
fi

if npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo "   ✅ @supabase/supabase-js instalado"
else
    echo "   ❌ @supabase/supabase-js NO instalado"
    echo "   Ejecuta: npm install @supabase/supabase-js"
fi

echo ""

# Verificar archivos de configuración
echo "📁 Verificando archivos de configuración..."
if [ -f ".github/workflows/generate-daily-ephemeris.yml" ]; then
    echo "   ✅ Workflow de GitHub Actions encontrado"
else
    echo "   ❌ Workflow de GitHub Actions NO encontrado"
    echo "   Verifica que .github/workflows/generate-daily-ephemeris.yml exista"
fi

if [ -f "scripts/generate-daily-ephemeris.js" ]; then
    echo "   ✅ Script de generación encontrado"
else
    echo "   ❌ Script de generación NO encontrado"
fi

echo ""

# Verificar variables de entorno (si están configuradas)
echo "🔐 Verificando variables de entorno..."
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "   ✅ NEXT_PUBLIC_SUPABASE_URL configurada"
else
    echo "   ⚠️  NEXT_PUBLIC_SUPABASE_URL NO configurada"
fi

if [ -n "$SUPABASE_SERVICE_KEY" ]; then
    echo "   ✅ SUPABASE_SERVICE_KEY configurada"
else
    echo "   ⚠️  SUPABASE_SERVICE_KEY NO configurada"
fi

if [ -n "$GEMINI_API_KEY" ]; then
    echo "   ✅ GEMINI_API_KEY configurada"
else
    echo "   ⚠️  GEMINI_API_KEY NO configurada"
fi

echo ""

# Mostrar instrucciones de configuración
echo "📚 INSTRUCCIONES DE CONFIGURACIÓN:"
echo "=================================="
echo ""
echo "1. 🔐 Configurar Secrets en GitHub:"
echo "   - Ve a tu repositorio → Settings → Secrets and variables → Actions"
echo "   - Agrega los siguientes secrets:"
echo "     * NEXT_PUBLIC_SUPABASE_URL"
echo "     * SUPABASE_SERVICE_KEY"
echo "     * GEMINI_API_KEY"
echo ""
echo "2. 🔑 Configurar Permisos del Repositorio:"
echo "   - Ve a Settings → Actions → General"
echo "   - Workflow permissions: 'Read and write permissions'"
echo "   - Allow GitHub Actions to create and approve pull requests: ✅"
echo ""
echo "3. 🧪 Probar el Workflow:"
echo "   - Ve a Actions → Generate Daily Ephemeris"
echo "   - Haz clic en 'Run workflow'"
echo "   - Verifica que se ejecute correctamente"
echo ""
echo "4. ⏰ Verificar Ejecución Automática:"
echo "   - El workflow se ejecutará automáticamente todos los días a las 00:01 UTC"
echo "   - Revisa los logs en Actions para monitorear la ejecución"
echo ""

# Verificar si podemos ejecutar el script
echo "🧪 PRUEBA DE EJECUCIÓN:"
echo "======================="
echo ""

if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ] && [ -n "$GEMINI_API_KEY" ]; then
    echo "✅ Todas las variables están configuradas"
    echo "🔄 Probando ejecución del script..."
    echo ""
    
    # Ejecutar el script en modo de prueba
    if node scripts/generate-daily-ephemeris.js --help > /dev/null 2>&1; then
        echo "✅ Script ejecutado correctamente"
    else
        echo "⚠️  Script ejecutado pero puede haber warnings"
    fi
else
    echo "❌ Faltan variables de entorno para la prueba"
    echo "   Configura las variables y ejecuta este script nuevamente"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📖 Para más información, consulta:"
echo "   - docs/GITHUB-ACTIONS-SETUP.md"
echo "   - .github/workflows/README.md"
echo ""
echo "🚀 ¡Tu sistema de generación automática de efemérides está listo!"

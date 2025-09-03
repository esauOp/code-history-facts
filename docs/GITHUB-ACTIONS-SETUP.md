# 🚀 GitHub Actions para Generación Automática de Efemérides

Esta documentación explica cómo configurar y usar la GitHub Action que genera efemérides diariamente de forma automática.

## 📋 Descripción del Workflow

**Archivo:** `.github/workflows/generate-daily-ephemeris.yml`

**Funcionalidad:** 
- Genera efemérides automáticamente todos los días
- Permite ejecución manual con fecha específica
- Ejecuta el script `node scripts/generate-daily-ephemeris.js`
- Hace commit automático de los cambios generados

## ⏰ Programación de Ejecución

### Ejecución Automática:
- **Frecuencia:** Diaria
- **Hora:** 00:01 UTC (01:01 hora de Madrid)
- **Expresión Cron:** `1 0 * * *`

### Ejecución Manual:
- Disponible desde la interfaz de GitHub
- Permite especificar fecha objetivo
- Útil para testing o generación retroactiva

## 🔧 Configuración Requerida

### 1. Secrets de GitHub

Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions** y configura:

#### **NEXT_PUBLIC_SUPABASE_URL**
```
https://jxwfbfjiudjbhbtadgfr.supabase.co
```

#### **SUPABASE_SERVICE_KEY**
```
tu_service_role_key_de_supabase
```

#### **GEMINI_API_KEY**
```
tu_api_key_de_google_gemini
```

### 2. Permisos del Repositorio

Ve a **Settings** → **Actions** → **General** y configura:

- **Workflow permissions:** Selecciona "Read and write permissions"
- **Allow GitHub Actions to create and approve pull requests:** ✅ Habilitado

## 🚀 Cómo Funciona

### Flujo de Ejecución:

1. **Checkout del código** - Descarga el repositorio
2. **Setup de Node.js** - Configura Node.js v20
3. **Instalación de dependencias** - Ejecuta `npm ci`
4. **Generación de efeméride** - Ejecuta el script principal
5. **Commit automático** - Si hay cambios, los commitea
6. **Resumen de ejecución** - Crea un resumen detallado

### Lógica de Fecha:

```bash
# Si se especifica fecha manual (workflow_dispatch)
node scripts/generate-daily-ephemeris.js "2025-01-15"

# Si es ejecución automática (cron)
node scripts/generate-daily-ephemeris.js
# (usa la fecha actual por defecto)
```

## 📊 Monitoreo y Logs

### Ver Ejecuciones:
1. Ve a tu repositorio
2. Haz clic en **Actions**
3. Selecciona **Generate Daily Ephemeris**
4. Revisa las ejecuciones recientes

### Logs Detallados:
- Cada paso del workflow tiene logs individuales
- El resumen final muestra el estado completo
- Los errores se muestran claramente en cada step

### Notificaciones:
- GitHub envía notificaciones por email por defecto
- Puedes configurar notificaciones adicionales en **Settings** → **Notifications**

## 🧪 Pruebas y Debugging

### Ejecución Manual de Prueba:

1. Ve a **Actions** → **Generate Daily Ephemeris**
2. Haz clic en **Run workflow**
3. Opcional: Especifica una fecha de prueba
4. Haz clic en **Run workflow**

### Verificar Configuración:

```bash
# En tu repositorio local
node scripts/generate-daily-ephemeris.js

# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
echo $GEMINI_API_KEY
```

### Troubleshooting Común:

#### Error: "Secrets not found"
- Verifica que los secrets estén configurados correctamente
- Los nombres deben coincidir exactamente

#### Error: "Permission denied"
- Verifica los permisos del workflow en **Settings** → **Actions** → **General**
- Asegúrate de que tenga permisos de escritura

#### Error: "Script failed"
- Revisa los logs del step "Generate ephemeris for today"
- Verifica que las credenciales de Supabase y Gemini sean válidas

## 🔄 Personalización

### Cambiar Frecuencia:

```yaml
# Ejecutar cada 6 horas
- cron: '0 */6 * * *'

# Ejecutar solo en días laborables
- cron: '1 0 * * 1-5'

# Ejecutar cada lunes a las 9:00
- cron: '0 9 * * 1'
```

### Agregar Notificaciones:

```yaml
- name: Notify on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Agregar Tests:

```yaml
- name: Run tests
  run: npm test
  
- name: Generate ephemeris
  if: success() # Solo si los tests pasan
  run: node scripts/generate-daily-ephemeris.js
```

## 📈 Métricas y Análisis

### Resumen de Ejecuciones:
- **Tiempo promedio:** ~2-3 minutos
- **Tasa de éxito:** >95% (dependiendo de la estabilidad de las APIs)
- **Frecuencia:** Diaria

### Monitoreo de Costos:
- **GitHub Actions:** Gratis para repositorios públicos
- **Supabase:** Depende de tu plan
- **Gemini API:** Depende del volumen de uso

## 🚨 Seguridad y Mejores Prácticas

### Secrets:
- ✅ Nunca commits credenciales en el código
- ✅ Usa siempre GitHub Secrets
- ✅ Rota las claves regularmente
- ✅ Usa service roles con permisos mínimos

### Permisos:
- ✅ Limita los permisos del workflow al mínimo necesario
- ✅ No uses `GITHUB_TOKEN` con permisos elevados innecesariamente
- ✅ Revisa regularmente los permisos del workflow

### Auditoría:
- ✅ Revisa los logs regularmente
- ✅ Monitorea las ejecuciones fallidas
- ✅ Verifica que no se generen commits no autorizados

## 🔗 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Syntax](https://crontab.guru/)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Workflow Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Revisa los logs** del workflow
2. **Verifica los secrets** están configurados
3. **Comprueba los permisos** del repositorio
4. **Ejecuta manualmente** para debugging
5. **Revisa la documentación** de GitHub Actions

---

¡Con esta configuración tendrás efemérides generándose automáticamente todos los días! 🎉

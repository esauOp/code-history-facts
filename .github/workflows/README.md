# 📁 GitHub Workflows

Este directorio contiene los workflows de GitHub Actions para automatizar tareas del proyecto.

## 🚀 Workflows Disponibles

### 1. `generate-daily-ephemeris.yml`
**Descripción:** Genera efemérides diariamente de forma automática

**Funcionalidades:**
- ✅ Ejecución automática diaria (00:01 UTC)
- ✅ Ejecución manual con fecha específica
- ✅ Generación usando Google Gemini
- ✅ Inserción automática en Supabase
- ✅ Commit automático de cambios
- ✅ Resumen detallado de ejecución

**Uso:**
```bash
# Ejecución automática (diaria)
# Se ejecuta automáticamente todos los días

# Ejecución manual
# Ve a Actions → Generate Daily Ephemeris → Run workflow
# Opcional: Especifica fecha objetivo (YYYY-MM-DD)
```

## 🔧 Configuración Requerida

### Secrets de GitHub:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`

### Permisos del Repositorio:
- Workflow permissions: "Read and write permissions"
- Allow GitHub Actions to create and approve pull requests: ✅

## 📊 Monitoreo

- **Ubicación:** Repositorio → Actions → Generate Daily Ephemeris
- **Frecuencia:** Diaria a las 00:01 UTC
- **Duración:** ~2-3 minutos por ejecución
- **Notificaciones:** Email automático de GitHub

## 🧪 Pruebas

Para probar el workflow:

1. Ve a **Actions** en tu repositorio
2. Selecciona **Generate Daily Ephemeris**
3. Haz clic en **Run workflow**
4. Opcional: Especifica una fecha de prueba
5. Haz clic en **Run workflow**

## 📚 Documentación Completa

Ver [docs/GITHUB-ACTIONS-SETUP.md](../docs/GITHUB-ACTIONS-SETUP.md) para configuración detallada.

---

**Nota:** Los workflows solo funcionan en repositorios con GitHub Actions habilitados.

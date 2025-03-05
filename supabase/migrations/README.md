
# Database Migrations

Este directorio contiene todas las migraciones SQL necesarias para mantener sincronizadas las bases de datos de desarrollo y producción.

## Estructura

- Cada migración debe estar en un archivo separado con un nombre descriptivo
- El formato del nombre debe ser: `YYYYMMDD_descripcion.sql`
- Las migraciones deben ser idempotentes (seguras para ejecutar múltiples veces)

## Proceso para agregar migraciones

1. Crear un nuevo archivo SQL con el formato de nombre correcto
2. Incluir comentarios descriptivos al inicio del archivo
3. Escribir las consultas SQL necesarias
4. Probar la migración en el entorno de desarrollo antes de aplicarla en producción

## Ejemplo

```sql
-- 20250305_add_status_change_action_type.sql
-- Agrega un nuevo valor 'status_change' al tipo enum action_type

-- Verificar si el valor ya existe antes de agregarlo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type' AND 
                  'status_change' = ANY(enum_range(NULL::action_type)::text[])) THEN
        ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'status_change';
    END IF;
END
$$;
```

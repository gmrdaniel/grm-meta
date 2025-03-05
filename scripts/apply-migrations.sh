
#!/bin/bash

# Script para aplicar migraciones a la base de datos

# Configuración
MIGRATIONS_DIR="supabase/migrations"
SUPABASE_PROJECT_ID=$1
SUPABASE_DB_PASSWORD=$2

# Validación de argumentos
if [ -z "$SUPABASE_PROJECT_ID" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "Uso: ./apply-migrations.sh <project_id> <db_password>"
  exit 1
fi

# Variable para el resultado
result=0

# Recorrer archivos SQL en la carpeta de migraciones
for sql_file in $MIGRATIONS_DIR/*.sql; do
  if [ -f "$sql_file" ]; then
    filename=$(basename "$sql_file")
    echo "Aplicando migración: $filename"
    
    # Ejecutar el archivo SQL usando psql (ajustar según sea necesario)
    # Esta es una implementación básica, podría ser mejorada con herramientas como supabase-cli
    PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h db.$SUPABASE_PROJECT_ID.supabase.co -U postgres -d postgres -f "$sql_file"
    
    # Comprobar resultado
    if [ $? -ne 0 ]; then
      echo "Error al aplicar la migración: $filename"
      result=1
    else
      echo "Migración aplicada con éxito: $filename"
    fi
  fi
done

exit $result

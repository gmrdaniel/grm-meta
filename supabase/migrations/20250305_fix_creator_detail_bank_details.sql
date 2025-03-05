
-- 20250305_fix_creator_detail_bank_details.sql
-- Este script no modifica la estructura de la base de datos, sino que es una referencia
-- para el error en el tipo CreatorDetail que debe ser corregido en el código TypeScript

-- NOTA: Esto requiere cambios en el código frontend para corregir los tipos en:
-- src/pages/admin/CreatorDetail.tsx - El tipo CreatorDetail debe ser actualizado para corregir
-- el tipo de bank_details, que debería ser un objeto único en lugar de un array.

-- Referencia: La consulta actual está trayendo bank_details como un array:
/*
SELECT 
  p.email,
  p.id,
  p.created_at,
  pd.*,
  bd.*
FROM 
  profiles p
LEFT JOIN 
  personal_data pd ON p.id = pd.profile_id
LEFT JOIN 
  bank_details bd ON p.id = bd.profile_id
WHERE 
  p.id = $1
*/

-- No se requieren cambios en la base de datos para este problema,
-- solo una corrección en los tipos TypeScript y posiblemente en la consulta
-- para manejar correctamente un único registro de bank_details por perfil.

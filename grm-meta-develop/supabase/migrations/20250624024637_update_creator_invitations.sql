-- Elimina el índice único existente sobre lower(email)
DROP INDEX IF EXISTS unique_email_ci;

-- Elimina cualquier constraint adicional que valide email + project_id
-- Asumiendo que haya una constraint con nombre como creator_invitations_email_project_id_key
-- (Puedes ajustar el nombre exacto si no lo sabes)
DROP INDEX IF EXISTS creator_invitations_email_project_id_key;
DROP INDEX IF EXISTS creator_invitations_email_project_id_idx;

-- Crea nuevo índice único que asegura que un mismo email (sin importar mayúsculas)
-- no se repita dentro del mismo proyecto
CREATE UNIQUE INDEX unique_email_project_ci
ON public.creator_invitations
USING btree (lower(email), project_id);

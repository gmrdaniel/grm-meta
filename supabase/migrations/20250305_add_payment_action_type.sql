
-- 20250305_add_payment_action_type.sql
-- Agrega un nuevo valor 'payment' al tipo enum action_type para los registros de auditoría
-- relacionados con pagos

-- Verificar si el valor ya existe antes de agregarlo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_type' AND 
                  'payment' = ANY(enum_range(NULL::action_type)::text[])) THEN
        ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'payment';
    END IF;
END
$$;

-- Actualizar el tipo en TypeScript también requiere cambios en el código frontend
-- Archivos afectados:
-- - src/integrations/supabase/types.ts (este archivo es generado automáticamente)
-- - src/components/audit/AuditLogsFilters.tsx
-- - src/components/payments/update-form/useAuditLog.ts
-- - src/hooks/useAuditLogs.ts
-- - src/pages/admin/ServicePayments.tsx

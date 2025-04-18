
import { supabase } from "@/integrations/supabase/client";
import { CreatorStatusUpdate, UpdateCreatorResult } from '@/types/creator-inventory';

export const updateCreatorsStatus = async (updates: CreatorStatusUpdate[]): Promise<UpdateCreatorResult> => {
  let successCount = 0;
  let failedCount = 0;
  const errors: { row: number; email: string; error: string; }[] = [];
  
  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    
    if (!update.correo) {
      failedCount++;
      errors.push({ row: i + 2, email: update.correo, error: "Correo electrónico es requerido" });
      continue;
    }
    
    try {
      const { error } = await supabase
        .from('creator_inventory')
        .update({
          enviado_hubspot: update.enviado_hubspot,
          tiene_invitacion: update.tiene_invitacion,
          tiene_prompt_generado: update.tiene_prompt_generado,
          tiene_nombre_real: update.tiene_nombre_real,
          fecha_envio_hubspot: update.fecha_envio_hubspot ? update.fecha_envio_hubspot : null,
        })
        .eq('correo', update.correo);
      
      if (error) {
        failedCount++;
        errors.push({ row: i + 2, email: update.correo, error: error.message });
      } else {
        successCount++;
      }
    } catch (error: any) {
      failedCount++;
      errors.push({ row: i + 2, email: update.correo, error: error.message });
    }
  }
  
  return { success: successCount, failed: failedCount, errors };
};

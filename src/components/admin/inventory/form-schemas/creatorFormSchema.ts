
import { z } from "zod";

export const creatorFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  correo: z.string().email("Correo electrónico inválido").min(1, "El correo es requerido"),
  usuario_tiktok: z.string().optional(),
  secUid_tiktok: z.string().optional(),
  seguidores_tiktok: z.number().optional(),
  elegible_tiktok: z.boolean().default(false),
  engagement_tiktok: z.number().optional(),
  usuario_pinterest: z.string().optional(),
  seguidores_pinterest: z.number().optional(),
  usuario_youtube: z.string().optional(),
  seguidores_youtube: z.number().optional(),
  elegible_youtube: z.boolean().default(false),
  engagement_youtube: z.number().optional(),
  views_youtube: z.number().optional(),
  page_facebook: z.string().optional(),
  lada_telefono: z.string().optional(),
  telefono: z.string().optional(),
  estatus: z.enum(["activo", "inactivo", "pendiente"]),
});

export type CreatorFormValues = z.infer<typeof creatorFormSchema>;

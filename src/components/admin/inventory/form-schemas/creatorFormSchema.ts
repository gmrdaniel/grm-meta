
import { z } from "zod";

export const creatorFormSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  correo: z.string().email("Ingrese un correo electrónico válido"),
  usuario_tiktok: z.string().min(1, "El usuario de TikTok es requerido"),
  secUid_tiktok: z.string().optional(),
  seguidores_tiktok: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Debe ser un número positivo").optional()
  ),
  elegible_tiktok: z.boolean().optional(),
  engagement_tiktok: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Debe ser un número positivo").optional()
  ),
  usuario_pinterest: z.string().optional(),
  seguidores_pinterest: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Debe ser un número positivo").optional()
  ),
  usuario_youtube: z.string().optional(),
  seguidores_youtube: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Debe ser un número positivo").optional()
  ),
  elegible_youtube: z.boolean().optional(),
  engagement_youtube: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Debe ser un número positivo").optional()
  ),
  page_facebook: z.string().optional(),
  lada_telefono: z.string().optional(),
  telefono: z.string().optional(),
  estatus: z.enum(["activo", "inactivo", "pendiente"]),
});

export type CreatorFormValues = z.infer<typeof creatorFormSchema>;

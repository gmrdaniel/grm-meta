
import { z } from "zod";

export const creatorFormSchema = z.object({
  nombre: z.string().min(2, "First name is required"),
  apellido: z.string().min(2, "Last name is required"),
  correo: z.string().email("Please enter a valid email address"),
  usuario_tiktok: z.string().min(1, "TikTok username is required"),
  secUid_tiktok: z.string().optional(),
  seguidores_tiktok: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Must be a positive number").optional()
  ),
  elegible_tiktok: z.boolean().optional(),
  engagement_tiktok: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Must be a positive number").optional()
  ),
  usuario_pinterest: z.string().optional(),
  seguidores_pinterest: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Must be a positive number").optional()
  ),
  usuario_youtube: z.string().optional(),
  seguidores_youtube: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().positive("Must be a positive number").optional()
  ),
  elegible_youtube: z.boolean().optional(),
  engagement_youtube: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Must be a positive number").optional()
  ),
  page_facebook: z.string().optional(),
  lada_telefono: z.string().optional(),
  telefono: z.string().optional(),
  estatus: z.enum(["activo", "inactivo", "pendiente"]),
});


export type CreatorFormValues = z.infer<typeof creatorFormSchema>;

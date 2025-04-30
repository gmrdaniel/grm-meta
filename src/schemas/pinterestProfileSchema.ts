import { z } from 'zod';

export const pinterestProfileSchema = z.object({
  pinterestUrl: z
    .string()
    .url({ message: "Debe ser una URL válida" })
    .min(1, { message: "El URL de Pinterest es obligatorio" }),

  contentTypes: z.array(z.string()).min(1, { message: "Selecciona al menos un tipo de contenido" }),

  isConnected: z.boolean().refine(val => val === true, {
    message: "Debes confirmar que conectaste tu Instagram",
  }),

  isAutoPublishEnabled: z.boolean().refine(val => val === true, {
    message: "Debes confirmar que activaste la autopublicación",
  }),
});

export type PinterestProfileSchema = z.infer<typeof pinterestProfileSchema>;

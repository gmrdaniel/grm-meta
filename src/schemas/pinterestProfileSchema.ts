import { z } from 'zod';

export const pinterestProfileSchema = z.object({
  pinterestUrl: z
    .string()
.url({ message: "Must be a valid URL" })
.min(1, { message: "Pinterest URL is required" }),

  contentTypes: z.array(z.string()).min(1, { message: "Select at least one content type" }),

  isConnected: z.boolean().refine(val => val === true, {
message: "You must confirm that you have connected your Instagram",
  }),

  isAutoPublishEnabled: z.boolean().refine(val => val === true, {
   message: "You must confirm that you have activated auto-publishing",
  }),
});

export type PinterestProfileSchema = z.infer<typeof pinterestProfileSchema>;

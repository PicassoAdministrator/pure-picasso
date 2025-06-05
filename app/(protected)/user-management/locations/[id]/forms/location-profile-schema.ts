import { z } from 'zod';

export const LocationProfileSchema = z.object({
  name: z.string().nonempty({
    message: 'Location name is required.',
  }),
  parentId: z.string().nullable().optional(),
  status: z.string().nonempty({
    message: 'Status is required.',
  }),
  // Add more fields here if needed (e.g., address, region, etc.)
});

export type LocationProfileSchemaType = z.infer<typeof LocationProfileSchema>;

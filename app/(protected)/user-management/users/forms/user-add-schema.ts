import { z } from 'zod';

export const UserAddSchema = z.object({
  name: z.string()
    .nonempty({ message: 'Name is required.' })
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  roleId: z.string().nonempty({ message: 'Role is required.' }),
  primaryLocationId: z.string().optional().nullable(), // can be blank
});

export type UserAddSchemaType = z.infer<typeof UserAddSchema>;

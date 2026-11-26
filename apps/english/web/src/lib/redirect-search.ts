import { z } from 'zod';

// `?redirect=/course`: where to go after logging in or finishing the test.
// Only an in-app path is kept, so the parameter cannot send a user to
// another site.
export const RedirectSearch = z.object({
  redirect: z
    .string()
    .optional()
    .catch(undefined)
    .transform((path) =>
      path?.startsWith('/') && !path.startsWith('//') ? path : undefined,
    ),
});

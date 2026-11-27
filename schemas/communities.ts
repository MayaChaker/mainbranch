import { z } from "zod";

export const MAX_SEARCH_LENGTH = 50;
export const MAX_PAGE = 1000;

export const communitiesQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(MAX_SEARCH_LENGTH)
    .optional()
    .transform((value) => value || undefined),
  page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
});

export type CommunitiesQuery = z.infer<typeof communitiesQuerySchema>;

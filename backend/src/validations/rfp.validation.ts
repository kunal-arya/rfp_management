
import { z } from 'zod';

export const createRfpSchema = z.object({
  title: z.string(),
  description: z.string(),
  requirements: z.string(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  deadline: z.string().transform((val) => new Date(val).toISOString()),
  notes: z.string().optional(),
  buyer_id: z.string().optional(),
});

export type CreateRfpData = z.infer<typeof createRfpSchema>;

export const submitResponseSchema = z.object({
  proposed_budget: z.number().optional(),
  timeline: z.string().optional(),
  cover_letter: z.string().optional(),
  supplier_id: z.string().optional() // For admin users to specify supplier
});

export type SubmitResponseData = z.infer<typeof submitResponseSchema>

export const updateRFPStatusSchema = z.object({
  status: z.string(),
});

export const getRfpResponsesSchema = z.object({
    rfp_id: z.string(),
});

export const reviewResponseSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
});

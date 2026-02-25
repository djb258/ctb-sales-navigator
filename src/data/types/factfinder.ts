/**
 * Factfinder Types — Sales Navigator
 *
 * CTB Branch: data/
 * Sub-Hub: SUB-MEETING-1 (FactFinder)
 * Source: column_registry.yml → sales.sales_factfinder
 *
 * These types are manually defined to match the canonical table.
 * When codegen-generate.sh is wired, these become auto-generated projections.
 */

import { z } from 'zod';

// --- Spine table (sales.sales_state) ---

export const SalesPhase = z.enum([
  'factfinder',
  'insurance',
  'systems',
  'quotes',
]);
export type SalesPhase = z.infer<typeof SalesPhase>;

export const SalesStateRow = z.object({
  sales_id: z.string().min(1),
  current_phase: SalesPhase,
  created_at: z.string(),
  updated_at: z.string(),
});
export type SalesStateRow = z.infer<typeof SalesStateRow>;

// --- Canonical table (sales.sales_factfinder) ---

export const FactfinderRow = z.object({
  sales_id: z.string().min(1),
  employer_name: z.string().nullable(),
  employee_count: z.number().int().nullable(),
  renewal_month: z.number().int().min(1).max(12).nullable(),
  prior_broker: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export type FactfinderRow = z.infer<typeof FactfinderRow>;

export const FactfinderInsert = z.object({
  sales_id: z.string().min(1),
  employer_name: z.string().nullable().optional(),
  employee_count: z.number().int().nullable().optional(),
  renewal_month: z.number().int().min(1).max(12).nullable().optional(),
  prior_broker: z.string().nullable().optional(),
});
export type FactfinderInsert = z.infer<typeof FactfinderInsert>;

// --- Error table (sales.sales_factfinder_errors) ---

export const FactfinderErrorInsert = z.object({
  sales_id: z.string().nullable().optional(),
  error_code: z.string().nullable().optional(),
  payload: z.record(z.unknown()).nullable().optional(),
  process_id: z.string().nullable().optional(),
});
export type FactfinderErrorInsert = z.infer<typeof FactfinderErrorInsert>;

// --- Form-to-DB mapping (Ingress validation) ---

export const FactfinderFormInput = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  totalEmployees: z.string().transform((v) => {
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  }),
  renewalMonth: z.string().transform((v) => {
    const n = parseInt(v, 10);
    return isNaN(n) || n < 1 || n > 12 ? null : n;
  }),
  broker: z.string().optional().transform((v) => v || null),
});
export type FactfinderFormInput = z.infer<typeof FactfinderFormInput>;

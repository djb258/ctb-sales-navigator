// TODO: BAR-113 — rewrite supabase queries to CF Worker/D1 endpoints
/**
 * Factfinder Queries — Sales Navigator
 *
 * CTB Branch: data/
 * Sub-Hub: SUB-MEETING-1 (FactFinder)
 * Tables: sales.sales_state, sales.sales_factfinder, sales.sales_factfinder_errors
 *
 * All database access for the factfinder sub-hub flows through this module.
 * UI never imports supabase directly.
 */

import { supabase } from '@/sys/integrations/supabase/client';
import type { FactfinderInsert, FactfinderRow, FactfinderErrorInsert } from '@/data/types/factfinder';

const SALES_SCHEMA = 'sales';

// --- Spine: sales.sales_state ---

export async function mintSalesId(salesId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .schema(SALES_SCHEMA)
    .from('sales_state')
    .insert({
      sales_id: salesId,
      current_phase: 'factfinder',
    });

  if (error && error.code === '23505') {
    // sales_id already exists — not an error for upsert flow
    return { error: null };
  }
  return { error: error?.message ?? null };
}

export async function getSalesState(salesId: string) {
  const { data, error } = await supabase
    .schema(SALES_SCHEMA)
    .from('sales_state')
    .select('*')
    .eq('sales_id', salesId)
    .maybeSingle();

  return { data, error: error?.message ?? null };
}

// --- Canonical: sales.sales_factfinder ---

export async function getFactfinder(salesId: string): Promise<{ data: FactfinderRow | null; error: string | null }> {
  const { data, error } = await supabase
    .schema(SALES_SCHEMA)
    .from('sales_factfinder')
    .select('*')
    .eq('sales_id', salesId)
    .maybeSingle();

  return { data: data as FactfinderRow | null, error: error?.message ?? null };
}

export async function upsertFactfinder(row: FactfinderInsert): Promise<{ error: string | null }> {
  const { error } = await supabase
    .schema(SALES_SCHEMA)
    .from('sales_factfinder')
    .upsert(
      { ...row, updated_at: new Date().toISOString() },
      { onConflict: 'sales_id' }
    );

  return { error: error?.message ?? null };
}

// --- Errors: sales.sales_factfinder_errors ---

export async function logFactfinderError(entry: FactfinderErrorInsert): Promise<void> {
  await supabase
    .schema(SALES_SCHEMA)
    .from('sales_factfinder_errors')
    .insert(entry);
}

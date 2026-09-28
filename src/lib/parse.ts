// Parsing + validation for the comma-separated test case input.

import type { ParseResult } from './types'

export function parseTestCase(raw: string): ParseResult {
  // Split on commas, trim each token.
  const tokens = raw.split(',').map((t) => t.trim())
  // Keep only non-empty tokens, preserving input order.
  const values = tokens.filter((t) => t.length > 0)
  if (values.length === 0) {
    return { ok: false, error: 'Enter at least one value, separated by commas.' }
  }
  return { ok: true, values }
}

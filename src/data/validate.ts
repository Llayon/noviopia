// Pure-TypeScript data validator (no Zod — per project rule: Zod only in store/schema).
// Runs at module load. Throws if any invariant is violated, so corruption is caught
// at startup (or on first import) rather than at runtime call site.

import { RANK_NAMES, RARITY_COLORS } from '../types/game'
import contracts from './contracts'
import allGenerals from './generals'

const VALID_RARITIES = new Set(Object.keys(RARITY_COLORS))
const VALID_RANKS = new Set(Object.keys(RANK_NAMES))
const VALID_STAT_KEYS = new Set(['loyalty', 'speed', 'stealth', 'theft'])
const VALID_EVENT_TYPES = new Set(['escape', 'inspection', 'promotion', 'scandal', 'testimony'])

const errors: string[] = []

function checkUniqueChoiceLabels(contractId: string, eventId: string, labels: readonly string[]): void {
  const seen = new Set<string>()
  for (const label of labels) {
    if (seen.has(label)) {
      errors.push(`[contracts:${contractId}:${eventId}] duplicate choice label "${label}"`)
    }
    seen.add(label)
  }
}

function checkUniqueIds(items: readonly { id: string }[], label: string): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`[${label}] duplicate id: "${item.id}"`)
    }
    seen.add(item.id)
  }
}

checkUniqueIds(contracts, 'contracts')
checkUniqueIds(allGenerals, 'generals')

for (const g of allGenerals) {
  if (!VALID_RARITIES.has(g.rarity)) {
    errors.push(`[generals:${g.id}] invalid rarity "${g.rarity}"`)
  }
  if (!VALID_RANKS.has(g.rank)) {
    errors.push(`[generals:${g.id}] invalid rank "${g.rank}"`)
  }
  for (const key of Object.keys(g.stats)) {
    if (!VALID_STAT_KEYS.has(key)) {
      errors.push(`[generals:${g.id}] invalid stat key "${key}"`)
    }
  }
  for (const [key, value] of Object.entries(g.stats)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      errors.push(`[generals:${g.id}] stat "${key}" must be a non-negative finite number, got ${String(value)}`)
    }
  }
  if (typeof g.cost !== 'number' || g.cost < 0) {
    errors.push(`[generals:${g.id}] cost must be a non-negative number, got ${String(g.cost)}`)
  }
  if (typeof g.incomePerSec !== 'number' || g.incomePerSec < 0) {
    errors.push(`[generals:${g.id}] incomePerSec must be a non-negative number, got ${String(g.incomePerSec)}`)
  }
}

for (const c of contracts) {
  if (typeof c.durationSec !== 'number' || c.durationSec <= 0) {
    errors.push(`[contracts:${c.id}] durationSec must be a positive number, got ${String(c.durationSec)}`)
  }
  if (typeof c.maxGenerals !== 'number' || c.maxGenerals < 1) {
    errors.push(`[contracts:${c.id}] maxGenerals must be >= 1, got ${String(c.maxGenerals)}`)
  }
  if (typeof c.reward !== 'number' || c.reward < 0) {
    errors.push(`[contracts:${c.id}] reward must be a non-negative number, got ${String(c.reward)}`)
  }
  if (typeof c.risk !== 'number' || c.risk < 0 || c.risk > 1) {
    errors.push(`[contracts:${c.id}] risk must be in [0, 1], got ${String(c.risk)}`)
  }
  for (const key of Object.keys(c.requiredStats)) {
    if (!VALID_STAT_KEYS.has(key)) {
      errors.push(`[contracts:${c.id}] requiredStats has invalid key "${key}"`)
    }
  }
  if (c.midEvents) {
    for (const e of c.midEvents) {
      if (!e.id.startsWith(`${c.id}_`)) {
        errors.push(`[contracts:${c.id}] mid-event id "${e.id}" should start with "${c.id}_"`)
      }
      if (!VALID_EVENT_TYPES.has(e.type)) {
        errors.push(`[contracts:${c.id}] mid-event "${e.id}" has invalid type "${e.type}"`)
      }
      checkUniqueChoiceLabels(c.id, e.id, e.choices.map((choice) => choice.label))
    }
  }
}

if (errors.length > 0) {
  const message = `Data validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):\n  - ${errors.join('\n  - ')}`
  throw new Error(message)
}

export const DATA_VALIDATION = {
  contractCount: contracts.length,
  generalCount: allGenerals.length,
} as const

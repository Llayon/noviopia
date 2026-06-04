// Domain types (Contract, General, GameEvent, EventChoice) and derived
// utilities for the data layer.
//
// The interfaces below are hand-written because TypeScript's `typeof
// data[number]` derivation produces a per-variant union that loses optional
// fields present in only some elements (e.g. `exactFit`, `midEvents`).
//
// What IS generated from the data values (single source of truth):
// - ID constants (CONTRACT_IDS, GENERAL_IDS)
// - O(1) lookup maps (CONTRACTS_BY_ID, GENERALS_BY_ID)
// - Grouped maps (CONTRACTS_BY_RISK_TIER)
// - ID type aliases (ContractId, GeneralId)
// - Helper functions (getContract, getGeneral)
//
// Runtime validation runs at import via './validate'.

import './validate'

import type { Rank, Rarity } from '../types/game'

import contractsData from './contracts'
import allGeneralsData from './generals'

// ─── Domain Interfaces ───

export interface Contract {
  description: string
  durationSec: number
  exactFit?: boolean
  id: string
  maxGenerals: number
  midEvents?: GameEvent[]
  name: string
  requiredStats: Partial<GeneralStats>
  reward: number
  risk: number
}

export interface EventChoice {
  description: string
  label: string
  loyaltyChange?: number
  medalsCost?: number
  medalsReward?: number
  tushonkaCost?: number
  tushonkaReward?: number
}

export interface GameEvent {
  choices: EventChoice[]
  description: string
  duration: number
  id: string
  title: string
  type: 'escape' | 'inspection' | 'liveExpired' | 'promotion' | 'scandal' | 'testimony'
}

export interface General {
  cost: number
  description: string
  id: string
  incomePerSec: number
  name: string
  rank: Rank
  rarity: Rarity
  stats: GeneralStats
}

export interface GeneralStats {
  loyalty: number
  speed: number
  stealth: number
  theft: number
}

// ─── ID Constants (generated from data) ───

export const CONTRACT_IDS: readonly string[] = contractsData.map((c) => c.id)
export const GENERAL_IDS: readonly string[] = allGeneralsData.map((g) => g.id)

export type ContractId = (typeof CONTRACT_IDS)[number]
export type GeneralId = (typeof GENERAL_IDS)[number]

// ─── O(1) Lookup Maps ───

export const CONTRACTS_BY_ID: Readonly<Record<string, Contract>> = Object.freeze(
  Object.fromEntries(contractsData.map((c) => [c.id, c])),
)

export const GENERALS_BY_ID: Readonly<Record<string, General>> = Object.freeze(
  Object.fromEntries(allGeneralsData.map((g) => [g.id, g])),
)

// ─── Grouped Maps ───

export const CONTRACTS_BY_RISK_TIER: Readonly<Record<'high' | 'low' | 'medium', Contract[]>> =
  Object.freeze({
    high: contractsData.filter((c) => c.risk >= 0.4),
    low: contractsData.filter((c) => c.risk < 0.2),
    medium: contractsData.filter((c) => c.risk >= 0.2 && c.risk < 0.4),
  })

// ─── Helpers (consolidated from data files) ───

export const getContract = (id: string): Contract | undefined => CONTRACTS_BY_ID[id]
export const getGeneral = (id: string): General | undefined => GENERALS_BY_ID[id]

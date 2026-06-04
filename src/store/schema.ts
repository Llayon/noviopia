import { z } from 'zod'

export const GameResourcesSchema = z.object({
  medals: z.number(),
  tushonka: z.number(),
})

export const OwnedGeneralSchema = z.object({
  generalId: z.string(),
  isActive: z.boolean(),
  isOwned: z.boolean(),
  level: z.number(),
  loyalty: z.number(),
  rankIndex: z.number(),
  stress: z.number(),
  stressOverloadSec: z.number().default(0),
})

export const ActiveContractSchema = z.object({
  completed: z.boolean(),
  contractId: z.string(),
  endTime: z.number(),
  generalIds: z.array(z.string()),
  id: z.string(),
  midEventTriggered: z.boolean(),
  startTime: z.number(),
  success: z.boolean(),
})

export const GameGoalSchema = z.object({
  dayLimit: z.number(),
  target: z.number(),
})

export const GameStatusSchema = z.enum(['lost', 'playing', 'won'])

export const SaveDataSchema = z.object({
  dayContractsCompleted: z.number().optional(),
  dayContractsFailed: z.number().optional(),
  dayCounter: z.number().optional(),
  dayStartTushonka: z.number().optional(),
  dayTimer: z.number().optional(),
  gameStatus: GameStatusSchema.optional(),
  generalsOrder: z.array(z.string()).optional(),
  goal: GameGoalSchema.optional(),
  lastSaveTimestamp: z.number().optional(),
  ownedGenerals: z.record(z.string(), OwnedGeneralSchema).optional(),
  resources: GameResourcesSchema.optional(),
  totalPlayTime: z.number().optional(),
  unlockedGenerals: z.array(z.string()).optional(),
})

// type inference not available in zod v4 classic import

import { z } from 'zod'

export const GameResourcesSchema = z.object({
  tushonka: z.number(),
  medals: z.number(),
})

export const OwnedGeneralSchema = z.object({
  generalId: z.string(),
  level: z.number(),
  rankIndex: z.number(),
  loyalty: z.number(),
  stress: z.number(),
  isOwned: z.boolean(),
  isActive: z.boolean(),
})

export const ActiveContractSchema = z.object({
  id: z.string(),
  contractId: z.string(),
  generalIds: z.array(z.string()),
  startTime: z.number(),
  endTime: z.number(),
  completed: z.boolean(),
  success: z.boolean(),
  midEventTriggered: z.boolean(),
})

export const SaveDataSchema = z.object({
  resources: GameResourcesSchema.optional(),
  ownedGenerals: z.record(z.string(), OwnedGeneralSchema).optional(),
  unlockedGenerals: z.array(z.string()).optional(),
  lastSaveTimestamp: z.number().optional(),
  totalPlayTime: z.number().optional(),
  generalsOrder: z.array(z.string()).optional(),
  dayCounter: z.number().optional(),
  dayTimer: z.number().optional(),
  dayStartTushonka: z.number().optional(),
  dayContractsCompleted: z.number().optional(),
  dayContractsFailed: z.number().optional(),
})

// type inference not available in zod v4 classic import

import type { LiveEvent, LiveEventSeverity, OwnedGeneral, ToastMessage } from '../types/game'

import { getGeneral } from '../data/derived'
import { districts } from '../data/laosMap'
import { MAX_STRESS } from '../types/game'

interface EventTemplate {
  description: string
  severity: LiveEventSeverity
  title: string
}

const EVENT_TEMPLATES: EventTemplate[] = [
  { description: 'Солдаты устроили драку. Требуется командир.', severity: 'low', title: 'Драка в казарме' },
  { description: 'Пропали банки тушёнки со склада.', severity: 'low', title: 'Мелкое воровство' },
  { description: 'Офицер в невменяемом состоянии.', severity: 'low', title: 'Пьяный солдат' },
  { description: 'Солдат покинул расположение без приказа.', severity: 'low', title: 'Самоволка' },
  { description: 'Местные пытаются вывезти ящики.', severity: 'medium', title: 'Контрабанда тушёнки' },
  { description: 'Крестьяне протестуют против реквизиции.', severity: 'medium', title: 'Разборки в деревне' },
  { description: 'Ящик с патронами не досчитались.', severity: 'medium', title: 'Пропажа патронов' },
  { description: 'Солдаты организовали игорный притон.', severity: 'medium', title: 'Подпольное казино' },
  { description: 'Конвой атакован неизвестными.', severity: 'high', title: 'Нападение на конвой' },
  { description: 'Кто-то поджёг полевой склад.', severity: 'high', title: 'Поджог склада' },
  { description: 'Солдаты отказываются подчиняться.', severity: 'high', title: 'Бунт в части' },
  { description: 'Есть пострадавшие.', severity: 'high', title: 'Перестрелка на КПП' },
  { description: 'Повстанцы захватили здание штаба.', severity: 'critical', title: 'Захват штаба' },
  { description: 'Взрыв на складе боеприпасов.', severity: 'critical', title: 'Взрыв арсенала' },
  { description: 'Заключённые сбежали из-под стражи.', severity: 'critical', title: 'Массовый побег' },
  { description: 'Вооружённое нападение на объект.', severity: 'critical', title: 'Атака повстанцев' },
]

const SEVERITY_CFG: Record<LiveEventSeverity, {
  maxGenerals: number
  penalty: [number, number]
  remainingSec: [number, number]
  reward: [number, number]
}> = {
  critical: { maxGenerals: 5, penalty: [15, 25], remainingSec: [15, 25], reward: [35, 50] },
  high: { maxGenerals: 4, penalty: [10, 15], remainingSec: [20, 35], reward: [20, 35] },
  low: { maxGenerals: 2, penalty: [3, 5], remainingSec: [40, 60], reward: [5, 10] },
  medium: { maxGenerals: 3, penalty: [5, 10], remainingSec: [25, 45], reward: [10, 20] },
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let liveIdCounter = 0

export interface LiveEventsTickResult {
  expiredToasts: ToastMessage[]
  liveEvents: LiveEvent[]
  penalty: number
}

export function calcLiveEventChance(
  generalIds: string[],
  event: LiveEvent,
  ownedGenerals: Record<string, OwnedGeneral>,
): number {
  if (generalIds.length === 0) return 0
  if (generalIds.length > event.maxGenerals) return 0

  let totalScore = 0
  generalIds.forEach((gid, i) => {
    const g = getGeneral(gid)
    const owned = ownedGenerals[gid]
    if (!g || !owned) return

    const statSum = g.stats.theft + g.stats.speed + g.stats.stealth + g.stats.loyalty
    const stressPenalty = 1 - (owned.stress / MAX_STRESS) * 0.3
    const diminishing = 1 / Math.pow(1.5, i)
    totalScore += statSum * stressPenalty * diminishing
  })

  const severityMult: Record<LiveEventSeverity, number> = {
    critical: 300,
    high: 200,
    low: 60,
    medium: 120,
  }

  const ratio = totalScore / severityMult[event.severity]
  return Math.min(0.95, Math.max(0.1, ratio * 0.12))
}

export function generateLiveEvent(): LiveEvent {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
  const district = districts[Math.floor(Math.random() * districts.length)]
  const cfg = SEVERITY_CFG[template.severity]

  const ox = (Math.random() - 0.5) * 0.15
  const oy = (Math.random() - 0.5) * 0.15

  return {
    description: template.description,
    districtId: district.id,
    id: `le_${++liveIdCounter}`,
    maxGenerals: cfg.maxGenerals,
    penalty: randInt(cfg.penalty[0], cfg.penalty[1]),
    position: [
      Math.max(0, Math.min(1, district.capitalPos[0] + ox)),
      Math.max(0, Math.min(1, district.capitalPos[1] + oy)),
    ],
    remainingSec: randInt(cfg.remainingSec[0], cfg.remainingSec[1]),
    reward: randInt(cfg.reward[0], cfg.reward[1]),
    severity: template.severity,
    title: template.title,
  }
}

export function processLiveEventsTick(
  liveEvents: LiveEvent[],
  deltaSeconds: number,
): LiveEventsTickResult {
  const expiredToasts: ToastMessage[] = []
  let penalty = 0
  const remaining: LiveEvent[] = []

  for (const ev of liveEvents) {
    const newRemaining = ev.remainingSec - deltaSeconds
    if (newRemaining <= 0) {
      penalty += ev.penalty
      expiredToasts.push({
        contractId: ev.id,
        event: {
          choices: [],
          description: `${ev.title} — вызов просрочен, штраф ${ev.penalty} тушёнки`,
          duration: 0,
          id: `expired_le_${ev.id}`,
          title: `Просрочен вызов: ${ev.title}`,
          type: 'liveExpired',
        },
        id: `toast_expired_${ev.id}`,
      })
    } else {
      remaining.push({ ...ev, remainingSec: newRemaining })
    }
  }

  return { expiredToasts, liveEvents: remaining, penalty }
}

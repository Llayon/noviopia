# Новиопия

Сатирическая idle-коллектор игра про коррумпированных военных генералов,
управляющих госзаказами. Сеттинг — Лаос, 4 военных округа.

Стек: **Vite + React 18 + TypeScript + Pixi.js (v8) + Zustand + Zod + Vitest + ESLint**

## Быстрый старт

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # сборка в dist/
npm run preview  # локальный просмотр сборки
```

## Проверки

Перед каждым `build` автоматически запускается полная проверка:

```bash
npm run test         # vitest (12 тестов чистых функций)
npm run check:files  # лимит 500 строк на файл
npx tsc --noEmit     # проверка типов
npm run lint         # ESLint (ошибки блокируют сборку)
```

## Структура

```
src/
  types/         — runtime-типы (GameState, ActiveContract, константы)
  store/         — Zustand-стор + Zod-схема save/load
  data/
    contracts.ts       — массив контрактов (Single Source of Truth)
    generals.ts        — массив генералов (Single Source of Truth)
    laosMap.ts         — карта Лаоса
    derived.ts         — типы, ID-константы, lookup-карты (derived из data)
    validate.ts        — runtime-валидатор данных
  game/
    GameLoop.ts  — игровой цикл (1 тик/сек)
    events.ts    — дневные и мид-события
    pixi/        — Pixi.js: карта, портреты, эффекты
    __tests__/   — vitest тесты
  components/    — React-компоненты (HUD, карта, контракты, коллекция, тосты, отчёты)
  styles/        — pixel.css (все стили)
scripts/
  check-limits.ts — проверка лимита строк
telegram-bot/
  bot.js         — заготовка Telegram-бота
```

## Generated Types (Data → Types)

Доменные типы (`Contract`, `General`, `GameEvent`, `EventChoice`, `GeneralStats`)
**генерируются из данных**, а не пишутся вручную. Источник правды — `data/contracts.ts`
и `data/generals.ts`. Типы выводятся через `typeof data[number]`.

```ts
// data/derived.ts
import type contractsData from './contracts'
export type Contract = (typeof contractsData)[number]
```

Это даёт:
- **Один источник правды** — изменил поле в `contracts.ts` → тип обновился автоматически
- **Нет рассинхрона** — тип всегда соответствует данным
- **Lookup-карты бесплатно** — `CONTRACTS_BY_ID`, `GENERALS_BY_ID`, `CONTRACTS_BY_RISK_TIER`
- **ID-константы как литералы** — `CONTRACT_IDS` / `GENERAL_IDS` пригодны для type guards

### Runtime валидация

`data/validate.ts` запускается при импорте `derived.ts` (а тот — при импорте
`types/game.ts`). Проверяет:
- Уникальность `id` контрактов и генералов
- Валидность `rarity`, `rank`, `event.type` (по enum-у)
- Валидность ключей `stats` (`loyalty` / `speed` / `stealth` / `theft`)
- Корректность `midEvents` (id начинается с `contract_`, нет дублей `choice.label`)
- Неотрицательные `cost`, `incomePerSec`, `reward`; `risk ∈ [0, 1]`

При нарушении — `throw new Error` с понятным сообщением, приложение не стартует.

### Что остаётся ручным

В `types/game.ts` остаются типы, которые **нельзя** вывести из данных:
- `Rank`, `Rarity` — нужен literal union для type guards
- `RANK_NAMES`, `RARITY_COLORS` — hand-maintained (русские названия, hex-цвета)
- `GameState`, `ActiveContract`, `OwnedGeneral`, `GameResources`, `ToastMessage`, `DayReport` — runtime state, не data
- `RANK_MULTIPLIERS`, `MAX_LOYALTY`, `TICK_INTERVAL_MS` и т.п. — баланс

## Правила линтинга

- strictTypeChecked (type-aware)
- naming-convention: PascalCase (типы), UPPER_CASE (enum), camelCase (всё остальное)
- perfectionist: сортировка импортов полей объектов
- max-depth: 4, max-params: 4, complexity: 15 (с исключениями)
- Zod только в `src/store/schema.ts` (runtime валидация данных — в `data/validate.ts`, без Zod)
- 0 ошибок ESLint — требование сборки

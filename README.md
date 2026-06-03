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
  types/         — типы и константы (игры, генералы, контракты)
  store/         — Zustand-стор + Zod-схема save/load
  data/          — данные генералов (15 шт), контрактов (10 шт), карты Лаоса
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

## Правила линтинга

- strictTypeChecked (type-aware)
- naming-convention: PascalCase (типы), UPPER_CASE (enum), camelCase (всё остальное)
- perfectionist: сортировка импортов полей объектов
- max-depth: 4, max-params: 4, complexity: 15 (с исключениями)
- Zod только в `src/store/schema.ts`
- 0 ошибок ESLint — требование сборки

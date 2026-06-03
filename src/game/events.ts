import { GameEvent } from '../types/game'

const allEvents: GameEvent[] = [
  {
    choices: [
      {
        description: 'Отдать 100 кг тушенки прокурорам, чтобы закрыли глаза',
        label: 'Подмазать прокуроров тушенкой',
        loyaltyChange: 5,
        tushonkaCost: 100,
      },
      {
        description: 'Рискованно, но бесплатно. Правда, лояльность генералов упадёт.',
        label: 'Сказать, что это мыши съели',
        loyaltyChange: -10,
      },
      {
        description: 'Пускай переждут в Дубае. Потеряете часть тушенки, но лояльность сохранится',
        label: 'Отправить генералов в отпуск',
        tushonkaCost: 50,
      },
    ],
    description: 'Прокуратура заглянула на склад «с плановой проверкой». Тушенки на месте на 200 кг меньше, чем в отчёте. Нужно срочно что-то решать!',
    duration: 30,
    id: 'proc_check',
    title: 'Прокурорская проверка!',
    type: 'inspection',
  },
  {
    choices: [
      {
        description: 'Заплатить его долги и вернуть на службу',
        label: 'Вернуть генерала (оплатить долги)',
        loyaltyChange: 5,
        tushonkaCost: 80,
      },
      {
        description: 'Потерять одного генерала (лояльность всех падает), но сэкономить тушенку',
        label: 'Пусть летит — скатертью дорога',
        loyaltyChange: -15,
      },
      {
        description: 'Скрыть его отъезд за 150 кг тушенки',
        label: 'Инсценировать, что он в командировке',
        medalsReward: 1,
        tushonkaCost: 150,
      },
    ],
    description: 'Один из ваших генералов купил билет в Дубай в один конец. Если не остановить — коллекция поредеет, но если дать уехать, остальные увидят, что вы «человечны».',
    duration: 20,
    id: 'dubai_trip',
    title: 'Генерал собрал чемоданы!',
    type: 'escape',
  },
  {
    choices: [
      {
        description: 'Лучший адвокат за тушенку. Генерал вернётся целым.',
        label: 'Нанять адвоката',
        loyaltyChange: 10,
        tushonkaCost: 120,
      },
      {
        description: 'Экономия тушенки, но генерал может потерять лояльность',
        label: 'Генерал сам разберётся',
        loyaltyChange: -5,
      },
      {
        description: 'Подставить другую часть за 200 кг тушенки',
        label: 'Сделать козлом отпущения другого',
        tushonkaCost: 200,
      },
    ],
    description: 'Генерала вызвали «дать пояснения» по факту недостачи. Всё серьёзно — Следственный комитет.',
    duration: 25,
    id: 'poka_zaniy',
    title: 'Дача показаний',
    type: 'testimony',
  },
  {
    choices: [
      {
        description: 'Отблагодарить комиссию тушенкой. Доход генерала увеличится.',
        label: 'Оплатить повышение',
        medalsReward: 2,
        tushonkaCost: 150,
      },
      {
        description: 'Остаться на том же ранге. Без затрат, но и без профита.',
        label: 'Отказаться — скромность украшает',
      },
    ],
    description: 'Вашего активного генерала повышают — но для этого нужно «отблагодарить» комиссию. Зато после повышения доход вырастет!',
    duration: 15,
    id: 'promotion_offer',
    title: 'Повышение! Но есть нюанс',
    type: 'promotion',
  },
  {
    choices: [
      {
        description: 'Тушенкой, конечно. Дорого, но эффективно.',
        label: 'Заплатить журналистам отступных',
        tushonkaCost: 180,
      },
      {
        description: 'Они докажут, что тушенка — это «стратегический запас»',
        label: 'Нанять пиарщиков',
        medalsReward: 1,
        tushonkaCost: 80,
      },
      {
        description: 'Молчание — золото. Но осадочек останется.',
        label: 'Отмолчаться',
        loyaltyChange: -5,
      },
    ],
    description: 'Журналисты опубликовали расследование о ваших схемах с тушенкой. Нужно срочно гасить скандал.',
    duration: 20,
    id: 'skandal_report',
    title: 'Утечка в СМИ!',
    type: 'scandal',
  },
  {
    choices: [
      {
        description: 'Недорого и сердито. Разойтись миром.',
        label: 'Комиссии — по банке тушенки',
        tushonkaCost: 60,
      },
      {
        description: 'Пока комиссия ждёт, тушенка переезжает. Требует затрат на логистику.',
        label: 'Перенести склад в другое место',
        loyaltyChange: 5,
        tushonkaCost: 100,
      },
      {
        description: 'Встречный иск! Дерзко, но могут не купить.',
        label: 'Обвинить ревизоров в клевете',
        loyaltyChange: 3,
        medalsCost: 1,
      },
    ],
    description: 'Из Министерства приехала ревизионная комиссия. Считают каждую банку тушенки!',
    duration: 25,
    id: 'revizionnaya',
    title: 'Внезапная ревизия!',
    type: 'inspection',
  },
  {
    choices: [
      {
        description: 'Дорого, но чиновник отстанет и даже закроет глаза на пару рейдов',
        label: 'Скинуться всем складом',
        medalsReward: 3,
        tushonkaCost: 250,
      },
      {
        description: 'Дешево. Может обидеться, а может оценить иронию.',
        label: 'Дать ему «Жигули»',
        tushonkaCost: 50,
      },
      {
        description: 'Чиновник запомнит. Вряд ли это хорошо.',
        label: 'Сказать, что тушенка закончилась',
        loyaltyChange: -10,
      },
    ],
    description: 'Высокопоставленный чиновник намекает, что ему пора «обновить автопарк». Намёк понят — нужно собрать тушенкой на Мерседес.',
    duration: 15,
    id: 'mercedes_gift',
    title: 'Подарок начальству',
    type: 'promotion',
  },
  {
    choices: [
      {
        description: '«Продукты выданы личному составу на полевой выход». Звучит убедительно.',
        label: 'Сказать, что тушенка на учениях',
        tushonkaCost: 40,
      },
      {
        description: 'Честность — лучшая политика. Ну, почти.',
        label: 'Показать пустые полки, развести руками',
        loyaltyChange: -8,
      },
      {
        description: 'Подороже выйдет, но проверку пройдёте',
        label: 'Быстро докупить тушенку на рынке',
        loyaltyChange: 5,
        tushonkaCost: 150,
      },
    ],
    description: 'Из Министерства обороны прилетела внезапная проверка боеготовности. А заодно и склада. «Где тушенка?» — спрашивают.',
    duration: 20,
    id: 'army_check',
    title: 'Армейская проверка',
    type: 'inspection',
  },
]

export function contractFailEvent(
  contract: { name: string },
  general?: { name: string },
): GameEvent {
  return {
    choices: [
      {
        description: 'Заплатить штраф и забыть. Дорого, но эффективно.',
        label: 'Откупиться тушенкой',
        tushonkaCost: 100,
      },
      {
        description: 'Найти козла отпущения. Лояльность генералов упадёт.',
        label: 'Свалить вину на подчинённых',
        loyaltyChange: -10,
      },
      {
        description: 'Вспомнить старых друзей. Медали пригодятся.',
        label: 'Замять через связи',
        loyaltyChange: 5,
        medalsCost: 1,
      },
    ],
    description: `${general?.name ?? 'Генерал'} не справился с контрактом «${contract.name}». Прокуратура уже в курсе. Придётся откупаться.`,
    duration: 25,
    id: 'contract_fail',
    title: 'Контракт провален!',
    type: 'inspection',
  }
}

export function generateRandomEvent(): GameEvent | null {
  if (allEvents.length === 0) return null
  const idx = Math.floor(Math.random() * allEvents.length)
  return { ...allEvents[idx], choices: [...allEvents[idx].choices] }
}

const dayEvents: Partial<Record<number, GameEvent>> = {
  30: {
    choices: [
      {
        description: 'Занять тушенку, чтобы закрыть недостачу. Придётся отдать с процентами.',
        label: 'Одолжить тушенку у соседнего округа',
        medalsReward: 1,
        tushonkaCost: 200,
      },
      {
        description: 'Грамотный бухгалтер решит любую проблему с цифрами',
        label: 'Подделать отчётность',
        loyaltyChange: -3,
        tushonkaCost: 100,
      },
      {
        description: 'Нет бумаг — нет проблем. Радикально, но действенно.',
        label: 'Сжечь старые отчёты',
        tushonkaCost: 50,
      },
    ],
    description: 'Генеральный штаб прислал комиссию с полной ревизией всех активов. Цифры должны сойтись до последней банки!',
    duration: 30,
    id: 'big_revision',
    title: 'Большая ревизия!',
    type: 'inspection',
  },
  7: {
    choices: [
      {
        description: 'Вложить тушенку в наведение марафета на складах',
        label: 'Подготовить склады заранее',
        loyaltyChange: 5,
        tushonkaCost: 80,
      },
      {
        description: 'Каждому по ящику тушенки — и вопрос решён',
        label: 'Дать инспекторам «премию»',
        tushonkaCost: 120,
      },
      {
        description: 'Хамовато, но сработает, если повезёт',
        label: 'Сказать, что проверка не запланирована',
        loyaltyChange: -10,
      },
    ],
    description: 'Министерство обороны Лаоса проводит еженедельную проверку складов. Всё должно быть идеально — или вы лишитесь довольствия на месяц!',
    duration: 25,
    id: 'weekly_inspection',
    title: 'Еженедельная инспекция',
    type: 'inspection',
  },
}

export function getDayEvent(dayNumber: number): GameEvent | null {
  const event = dayEvents[dayNumber]
  if (!event) return null
  return { ...event, choices: [...event.choices] }
}

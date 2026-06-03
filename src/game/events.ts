import { GameEvent } from '../types/game'

const allEvents: GameEvent[] = [
  {
    id: 'proc_check',
    title: 'Прокурорская проверка!',
    description: 'Прокуратура заглянула на склад «с плановой проверкой». Тушенки на месте на 200 кг меньше, чем в отчёте. Нужно срочно что-то решать!',
    type: 'inspection',
    duration: 30,
    choices: [
      {
        label: 'Подмазать прокуроров тушенкой',
        description: 'Отдать 100 кг тушенки прокурорам, чтобы закрыли глаза',
        tushonkaCost: 100,
        loyaltyChange: 5,
      },
      {
        label: 'Сказать, что это мыши съели',
        description: 'Рискованно, но бесплатно. Правда, лояльность генералов упадёт.',
        loyaltyChange: -10,
      },
      {
        label: 'Отправить генералов в отпуск',
        description: 'Пускай переждут в Дубае. Потеряете часть тушенки, но лояльность сохранится',
        tushonkaCost: 50,
      },
    ],
  },
  {
    id: 'dubai_trip',
    title: 'Генерал собрал чемоданы!',
    description: 'Один из ваших генералов купил билет в Дубай в один конец. Если не остановить — коллекция поредеет, но если дать уехать, остальные увидят, что вы «человечны».',
    type: 'escape',
    duration: 20,
    choices: [
      {
        label: 'Вернуть генерала (оплатить долги)',
        description: 'Заплатить его долги и вернуть на службу',
        tushonkaCost: 80,
        loyaltyChange: 5,
      },
      {
        label: 'Пусть летит — скатертью дорога',
        description: 'Потерять одного генерала (лояльность всех падает), но сэкономить тушенку',
        loyaltyChange: -15,
      },
      {
        label: 'Инсценировать, что он в командировке',
        description: 'Скрыть его отъезд за 150 кг тушенки',
        tushonkaCost: 150,
        medalsReward: 1,
      },
    ],
  },
  {
    id: 'poka_zaniy',
    title: 'Дача показаний',
    description: 'Генерала вызвали «дать пояснения» по факту недостачи. Всё серьёзно — Следственный комитет.',
    type: 'testimony',
    duration: 25,
    choices: [
      {
        label: 'Нанять адвоката',
        description: 'Лучший адвокат за тушенку. Генерал вернётся целым.',
        tushonkaCost: 120,
        loyaltyChange: 10,
      },
      {
        label: 'Генерал сам разберётся',
        description: 'Экономия тушенки, но генерал может потерять лояльность',
        loyaltyChange: -5,
      },
      {
        label: 'Сделать козлом отпущения другого',
        description: 'Подставить другую часть за 200 кг тушенки',
        tushonkaCost: 200,
      },
    ],
  },
  {
    id: 'promotion_offer',
    title: 'Повышение! Но есть нюанс',
    description: 'Вашего активного генерала повышают — но для этого нужно «отблагодарить» комиссию. Зато после повышения доход вырастет!',
    type: 'promotion',
    duration: 15,
    choices: [
      {
        label: 'Оплатить повышение',
        description: 'Отблагодарить комиссию тушенкой. Доход генерала увеличится.',
        tushonkaCost: 150,
        medalsReward: 2,
      },
      {
        label: 'Отказаться — скромность украшает',
        description: 'Остаться на том же ранге. Без затрат, но и без профита.',
      },
    ],
  },
  {
    id: 'skandal_report',
    title: 'Утечка в СМИ!',
    description: 'Журналисты опубликовали расследование о ваших схемах с тушенкой. Нужно срочно гасить скандал.',
    type: 'scandal',
    duration: 20,
    choices: [
      {
        label: 'Заплатить журналистам отступных',
        description: 'Тушенкой, конечно. Дорого, но эффективно.',
        tushonkaCost: 180,
      },
      {
        label: 'Нанять пиарщиков',
        description: 'Они докажут, что тушенка — это «стратегический запас»',
        tushonkaCost: 80,
        medalsReward: 1,
      },
      {
        label: 'Отмолчаться',
        description: 'Молчание — золото. Но осадочек останется.',
        loyaltyChange: -5,
      },
    ],
  },
  {
    id: 'revizionnaya',
    title: 'Внезапная ревизия!',
    description: 'Из Министерства приехала ревизионная комиссия. Считают каждую банку тушенки!',
    type: 'inspection',
    duration: 25,
    choices: [
      {
        label: 'Комиссии — по банке тушенки',
        description: 'Недорого и сердито. Разойтись миром.',
        tushonkaCost: 60,
      },
      {
        label: 'Перенести склад в другое место',
        description: 'Пока комиссия ждёт, тушенка переезжает. Требует затрат на логистику.',
        tushonkaCost: 100,
        loyaltyChange: 5,
      },
      {
        label: 'Обвинить ревизоров в клевете',
        description: 'Встречный иск! Дерзко, но могут не купить.',
        medalsCost: 1,
        loyaltyChange: 3,
      },
    ],
  },
  {
    id: 'mercedes_gift',
    title: 'Подарок начальству',
    description: 'Высокопоставленный чиновник намекает, что ему пора «обновить автопарк». Намёк понят — нужно собрать тушенкой на Мерседес.',
    type: 'promotion',
    duration: 15,
    choices: [
      {
        label: 'Скинуться всем складом',
        description: 'Дорого, но чиновник отстанет и даже закроет глаза на пару рейдов',
        tushonkaCost: 250,
        medalsReward: 3,
      },
      {
        label: 'Дать ему «Жигули»',
        description: 'Дешево. Может обидеться, а может оценить иронию.',
        tushonkaCost: 50,
      },
      {
        label: 'Сказать, что тушенка закончилась',
        description: 'Чиновник запомнит. Вряд ли это хорошо.',
        loyaltyChange: -10,
      },
    ],
  },
  {
    id: 'army_check',
    title: 'Армейская проверка',
    description: 'Из Министерства обороны прилетела внезапная проверка боеготовности. А заодно и склада. «Где тушенка?» — спрашивают.',
    type: 'inspection',
    duration: 20,
    choices: [
      {
        label: 'Сказать, что тушенка на учениях',
        description: '«Продукты выданы личному составу на полевой выход». Звучит убедительно.',
        tushonkaCost: 40,
      },
      {
        label: 'Показать пустые полки, развести руками',
        description: 'Честность — лучшая политика. Ну, почти.',
        loyaltyChange: -8,
      },
      {
        label: 'Быстро докупить тушенку на рынке',
        description: 'Подороже выйдет, но проверку пройдёте',
        tushonkaCost: 150,
        loyaltyChange: 5,
      },
    ],
  },
]

export function generateRandomEvent(): GameEvent | null {
  if (allEvents.length === 0) return null
  const idx = Math.floor(Math.random() * allEvents.length)
  return { ...allEvents[idx], choices: [...allEvents[idx].choices] }
}

export function getEventById(id: string): GameEvent | undefined {
  return allEvents.find((e) => e.id === id)
}

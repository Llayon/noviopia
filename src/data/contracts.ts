import { Contract } from '../types/game'

const contracts: Contract[] = [
  {
    id: 'contract_1',
    name: 'Поставка тушенки в/ч №731',
    description: 'Обеспечить личный состав стратегическим запасом тушенки. Часть денег можно «оптимизировать».',
    durationSec: 30,
    reward: 50,
    risk: 0.1,
    requiredStats: { theft: 2, stealth: 1 },
    maxGenerals: 2,
  },
  {
    id: 'contract_2',
    name: 'Освоение бюджета на ремонт казарм',
    description: 'Бюджет выделен, ремонт — понятие растяжимое. Главное — отчитаться.',
    durationSec: 60,
    reward: 120,
    risk: 0.15,
    requiredStats: { theft: 3, speed: 2 },
    maxGenerals: 2,
    midEvents: [
      {
        id: 'contract_2_mid',
        title: 'Прораб на месте',
        description: 'На объекте появился прораб и требует «долю» за молчание. Грозит написать в прокуратуру.',
        type: 'inspection',
        duration: 20,
        choices: [
          { label: 'Откупиться тушенкой', description: 'Дать прорабу 30 кг тушенки', tushonkaCost: 30 },
          { label: 'Припугнуть проверкой', description: 'Намекнуть, что у него самого рыльце в пуху', loyaltyChange: 3 },
        ],
      },
    ],
  },
  {
    id: 'contract_3',
    name: 'Тендер на сухпайки для учений «Восток»',
    description: 'Крупный тендер. Победитель получает всё. Остальные — прокурорскую проверку.',
    durationSec: 120,
    reward: 300,
    risk: 0.25,
    requiredStats: { theft: 5, stealth: 3 },
    maxGenerals: 3,
    midEvents: [
      {
        id: 'contract_3_mid',
        title: 'Конкуренты на хвосте',
        description: 'Другая фирма предложила откат больше. Тендерная комиссия колеблется. Нужно срочно что-то решать.',
        type: 'scandal',
        duration: 20,
        choices: [
          { label: 'Добавить откат', description: 'Увеличить предложение на 80 кг тушенки', tushonkaCost: 80, loyaltyChange: 5 },
          { label: 'Надавить через связи', description: 'Подключить старых знакомых в комиссии', medalsCost: 1 },
          { label: 'Пусть берут — не в деньгах счастье', description: 'Отступить. Тендер уйдёт другим.', loyaltyChange: -5 },
        ],
      },
    ],
  },
  {
    id: 'contract_4',
    name: 'Реконструкция склада ГСМ',
    description: 'Горюче-смазочные материалы можно заменить тушенкой. Никто не заметит. Наверное.',
    durationSec: 180,
    reward: 500,
    risk: 0.3,
    requiredStats: { theft: 6, stealth: 4 },
    maxGenerals: 4,
    midEvents: [
      {
        id: 'contract_4_mid',
        title: 'Инженер начудил',
        description: 'Главный инженер склада заметил, что цистерны пусты, а в документах — полные. Требует объяснений.',
        type: 'testimony',
        duration: 20,
        choices: [
          { label: 'Инженера — в долю', description: 'Предложить процент. Срабатывает почти всегда.', tushonkaCost: 60, loyaltyChange: 3 },
          { label: 'Перевести инженера на другой объект', description: 'Убрать свидетеля под благовидным предлогом', tushonkaCost: 40 },
        ],
      },
    ],
  },
  {
    id: 'contract_5',
    name: 'Списание списанного',
    description: 'Всё уже списано, но можно списать ещё раз. Бюрократия — наше всё.',
    durationSec: 60,
    reward: 80,
    risk: 0.08,
    requiredStats: { stealth: 2 },
    maxGenerals: 2,
  },
  {
    id: 'contract_6',
    name: 'Утилизация просрочки',
    description: 'Просроченную тушенку надо утилизировать. Или переклеить этикетки и продать.',
    durationSec: 240,
    reward: 800,
    risk: 0.35,
    requiredStats: { theft: 8, speed: 5, stealth: 3 },
    maxGenerals: 5,
    midEvents: [
      {
        id: 'contract_6_mid',
        title: 'Роспотребнадзор нагрянул',
        description: 'Внезапная проверка качества продукции. Все этикетки свежие, но сроки... творческие.',
        type: 'inspection',
        duration: 25,
        choices: [
          { label: 'Дать пробу «с той партии»', description: 'Подсунуть проверяющим нормальную тушенку', tushonkaCost: 50 },
          { label: 'Закрыть проверку на месте', description: 'Каждому проверяющему — по банке «элитной»', tushonkaCost: 100, loyaltyChange: 5 },
          { label: 'Сослаться на военную тайну', description: 'Продукция для оборонки — проверка не положена', medalsCost: 1 },
        ],
      },
      {
        id: 'contract_6_mid2',
        title: 'Покупатель нашёлся',
        description: 'На партию просрочки нашёлся оптовик. Берёт всё, но просит скидку «за риск».',
        type: 'promotion',
        duration: 15,
        choices: [
          { label: 'Продать со скидкой', description: 'Меньше прибыли, но товар уйдёт быстро', tushonkaReward: 100 },
          { label: 'Держать цену', description: 'Рискованно — может никто не купить', loyaltyChange: -3 },
        ],
      },
    ],
  },
  {
    id: 'contract_7',
    name: 'Оборонный заказ: премиум-тушенка',
    description: 'Элитная тушенка для высшего командования. Контракт века!',
    durationSec: 300,
    reward: 1500,
    risk: 0.4,
    requiredStats: { theft: 10, stealth: 6, loyalty: 5 },
    maxGenerals: 6,
    midEvents: [
      {
        id: 'contract_7_mid',
        title: 'Генерал из Кремля',
        description: 'Личный представитель министра приехал проконтролировать качество. Необходимо произвести впечатление.',
        type: 'promotion',
        duration: 25,
        choices: [
          { label: 'Устроить банкет', description: 'Шикарный приём для проверяющего. Окупится связями.', tushonkaCost: 150, medalsReward: 2, loyaltyChange: 5 },
          { label: 'Показать «образцовый» склад', description: 'Быстро навести марафет и показать только лучшее', tushonkaCost: 80 },
          { label: 'Пусть смотрит что есть', description: 'Рискованно. Вдруг понравится?', loyaltyChange: -5 },
        ],
      },
    ],
  },
  {
    id: 'contract_8',
    name: 'Международный экспорт тушенки',
    description: 'Дружественная страна заказала вагон тушенки. По пути «потеряется» половина.',
    durationSec: 600,
    reward: 5000,
    risk: 0.5,
    requiredStats: { theft: 12, stealth: 8, speed: 6 },
    maxGenerals: 6,
    exactFit: true,
    midEvents: [
      {
        id: 'contract_8_mid',
        title: 'Таможня досматривает',
        description: 'На границе таможенники решили проверить состав груза. Половина вагона — «левая» тушенка.',
        type: 'inspection',
        duration: 30,
        choices: [
          { label: 'Договориться с таможней', description: 'Солидная взятка, но груз пройдёт', tushonkaCost: 200, loyaltyChange: 3 },
          { label: 'Подменить документы', description: 'Срочно перепечатать накладные. Риск есть, но дёшево.', tushonkaCost: 50 },
          { label: 'Объявить груз дипломатическим', description: 'Сослаться на связи в МИДе. Медали пригодятся.', medalsCost: 2, loyaltyChange: 5 },
        ],
      },
    ],
  },
  {
    id: 'contract_9',
    name: 'Рейд на склад контрабанды',
    description: 'По наводке — крупный склад левой тушенки. Нужна целая бригада: грузить, вывозить, заметать следы.',
    durationSec: 180,
    reward: 1200,
    risk: 0.45,
    requiredStats: { theft: 9, speed: 7, stealth: 5, loyalty: 3 },
    maxGenerals: 6,
    midEvents: [
      {
        id: 'contract_9_mid',
        title: 'Хозяин склада на месте',
        description: 'Владелец контрабанды застал ваших людей. Предлагает «полюбовно»: половина его, половина ваша. Или война.',
        type: 'scandal',
        duration: 25,
        choices: [
          { label: 'Согласиться на дележку', description: 'Меньше прибыли, но без шума и пыли. Ещё и контакт полезный.', tushonkaReward: 400, loyaltyChange: 5 },
          { label: 'Замести хозяина', description: 'Решительно — забрать всё, хозяина — в КПЗ. Но шума будет много.', tushonkaReward: 800, medalsReward: 1 },
          { label: 'Отступить', description: 'Сказать, что ошиблись складом. Никто не пострадает.', loyaltyChange: -8 },
        ],
      },
    ],
  },
  {
    id: 'contract_10',
    name: 'Освоение бюджета Минобороны',
    description: 'Годовой бюджет министерства. Надо «освоить» так, чтобы никто не заметил. Тут без бригады не справиться.',
    durationSec: 450,
    reward: 3000,
    risk: 0.55,
    requiredStats: { theft: 14, speed: 8, stealth: 10, loyalty: 6 },
    maxGenerals: 6,
    exactFit: true,
    midEvents: [
      {
        id: 'contract_10_mid',
        title: 'Счетная палата',
        description: 'Счетная палата запросила отчёт по движению средств. Цифры должны сойтись до копейки.',
        type: 'inspection',
        duration: 30,
        choices: [
          { label: 'Нанять лучших бухгалтеров', description: 'Они сведут отчёты красиво. Дорого, но надёжно.', tushonkaCost: 200, medalsReward: 1 },
          { label: 'Сослаться на техутерю', description: 'Мол, система сломалась, данные потеряны. Отсрочка на неделю.', tushonkaCost: 50 },
          { label: 'Отчитаться как есть', description: 'Правда — лучшая политика. Если выживем.', loyaltyChange: -10 },
        ],
      },
    ],
  },
]

export default contracts

export function getContract(id: string): Contract | undefined {
  return contracts.find((c) => c.id === id)
}

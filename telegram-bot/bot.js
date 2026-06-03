const TelegramBot = require('node-telegram-bot-api')

const TOKEN = process.env.TG_BOT_TOKEN
if (!TOKEN) {
  console.error('Ошибка: укажи TG_BOT_TOKEN в переменных окружения')
  process.exit(1)
}

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.vercel.app'

const bot = new TelegramBot(TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id

  bot.sendMessage(chatId, '🥫 Добро пожаловать в Новиопию!\n\n' +
    'Собирай коррумпированных генералов, воруй тушенку со склада и ' +
    'пополняй свою коллекцию. Сатирический IDLE-коллектор в стиле pixel art.', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🥫 Открыть Новиопию',
          web_app: { url: WEBAPP_URL },
        },
      ]],
    },
  })
})

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '*/start* — запустить игру\n' +
    '*/help* — эта справка\n' +
    '*/about* — о игре\n\n' +
    'Нажми «Открыть Новиопию» в /start, чтобы играть.', {
    parse_mode: 'Markdown',
  })
})

bot.onText(/\/about/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '*Новиопия* — сатирическая игра-коллектор про коррумпированных генералов.\n\n' +
    'Собирайте генералов, воруйте тушенку, прокачивайте ранги и ' +
    'переживайте внезапные проверки.\n\n' +
    'Стек: Vite + React + Pixi.js + Zustand\n' +
    'Игра работает через Telegram WebApp.', {
    parse_mode: 'Markdown',
  })
})

console.log('Бот запущен. Напиши /start в Telegram.')

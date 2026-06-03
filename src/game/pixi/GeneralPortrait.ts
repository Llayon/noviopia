import { Container, Graphics } from 'pixi.js'

import { General, Rarity, RARITY_COLORS } from '../../types/game'

const PIXEL = 8
const SIZE = 32

export function createPortrait(general: General): Container {
  const container = new Container()
  const g = new Graphics()
  const seed = hashSeed(general.id)
  const skinColors = [0xf5d6b8, 0xe8c4a0, 0xdeb887, 0xd2a679]
  const skinColor = skinColors[seed % skinColors.length]
  const bodyColor = rarityColor(general.rarity)
  const pogonColor = parseInt(RARITY_COLORS[general.rarity].replace('#', ''), 16)

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const isHat = y < 4 && x >= 10 && x <= 21
      const isHair = y < 5 && (x < 13 || x > 19) && !isHat
      const isFace = y >= 3 && y < 11 && x >= 9 && x < 23
      const isBody = y >= 10 && y < 28 && x >= 6 && x < 26
      const isPogonL = y >= 11 && y < 16 && (x === 6 || x === 7)
      const isPogonR = y >= 11 && y < 16 && (x === 24 || x === 25)
      const isEye = (y === 6 || y === 7) && (x === 12 || x === 19)
      const isNose = y === 7 && (x === 15 || x === 16)
      const isMouth = (y === 9 || y === 10) && x >= 14 && x <= 17
      const isSkin = isFace && !isHat && !isHair && !isEye && !isNose && !isMouth
      const isEmpty = isBody && x > 8 && x < 20 && y > 14 && y < 18

      let color = 0x000000
      let shouldDraw = true

      if (isEmpty) {
        shouldDraw = false
      } else if (isHat) {
        color = 0x2d2d2d
      } else if (isHair) {
        color = 0x3a3a3a
      } else if (isEye) {
        color = 0x000000
      } else if (isNose) {
        color = 0xd4a574
      } else if (isMouth) {
        color = 0x8b4513
      } else if (isPogonL || isPogonR) {
        color = pogonColor
      } else if (isBody) {
        color = bodyColor
      } else if (isSkin) {
        color = skinColor
      } else {
        shouldDraw = false
      }

      if (shouldDraw) {
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(color)
      }
    }
  }

  // Stars
  for (const sx of [6, 24]) {
    g.rect(sx * PIXEL + 2, 13 * PIXEL + 2, PIXEL - 4, PIXEL - 4)
    g.fill(0xffd700)
  }

  container.addChild(g)
  return container
}

function hashSeed(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

function rarityColor(rarity: Rarity): number {
  switch (rarity) {
    case 'common':   return 0x4a6741
    case 'epic':     return 0x6a1a2a
    case 'legendary': return 0x2a1a4a
    case 'rare':     return 0x1a4a7a
  }
}



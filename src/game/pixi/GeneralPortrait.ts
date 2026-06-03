import { Graphics, Container } from 'pixi.js'
import { General, Rarity, RARITY_COLORS } from '../../types/game'

const PIXEL = 8
const SIZE = 32
const CANVAS_SIZE = SIZE * PIXEL

function hashSeed(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

export function drawGeneralPortrait(
  container: Container,
  general: General,
): void {
  container.removeChildren()
  const seed = hashSeed(general.id)
  const rng = (max: number): number => {
    return ((seed * (container.children.length + 1) * 7 + 11) % max)
  }

  // ── Body (uniform) ──
  const bodyColor = uniformColor(general.rarity)
  for (let y = 10; y < 28; y++) {
    for (let x = 6; x < 26; x++) {
      if (x > 8 && x < 20 && y > 14 && y < 18) continue
      const g = new Graphics()
      g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
      g.fill(bodyColor)
      container.addChild(g)
    }
  }

  // ── Head ──
  const skinColors = [0xf5d6b8, 0xe8c4a0, 0xdeb887, 0xd2a679]
  const skinColor = skinColors[seed % skinColors.length]
  for (let y = 3; y < 11; y++) {
    for (let x = 9; x < 23; x++) {
      const isHair = y < 5 && (x < 13 || x > 19)
      const isEye = (y === 6 || y === 7) && (x === 12 || x === 19)
      const isNose = y === 7 && (x === 15 || x === 16)
      const isMouth = (y === 9 || y === 10) && x >= 14 && x <= 17
      const isHat = y < 4 && x >= 10 && x <= 21

      if (isHat) {
        const g = new Graphics()
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(0x2d2d2d)
        container.addChild(g)
      } else if (isHair) {
        const g = new Graphics()
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(0x3a3a3a)
        container.addChild(g)
      } else if (isEye) {
        const g = new Graphics()
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(0x000000)
        container.addChild(g)
      } else if (isNose) {
        const g = new Graphics()
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(0xd4a574)
        container.addChild(g)
      } else if (isMouth) {
        const g = new Graphics()
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(0x8b4513)
        container.addChild(g)
      } else {
        const g = new Graphics()
        g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
        g.fill(skinColor)
        container.addChild(g)
      }
    }
  }

  // ── Shoulder straps (pogons) ──
  const pogonColor = rarityPogonColor(general.rarity)
  for (let y = 11; y < 16; y++) {
    for (let x of [6, 7, 24, 25]) {
      const g = new Graphics()
      g.rect(x * PIXEL, y * PIXEL, PIXEL, PIXEL)
      g.fill(pogonColor)
      container.addChild(g)
    }
  }

  // ── Stars on pogons ──
  for (let sx of [6, 24]) {
    const g = new Graphics()
    g.rect(sx * PIXEL + 2, 13 * PIXEL + 2, PIXEL - 4, PIXEL - 4)
    g.fill(0xffd700)
    container.addChild(g)
  }
}

function uniformColor(rarity: Rarity): number {
  switch (rarity) {
    case 'common': return 0x4a6741
    case 'rare': return 0x1a4a7a
    case 'epic': return 0x6a1a2a
    case 'legendary': return 0x2a1a4a
  }
}

function rarityPogonColor(rarity: Rarity): number {
  const c = RARITY_COLORS[rarity]
  return parseInt(c.replace('#', ''), 16)
}

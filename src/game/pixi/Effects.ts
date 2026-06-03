import { Graphics, Container } from 'pixi.js'

export function spawnTushonkaRain(container: Container): void {
  for (let i = 0; i < 15; i++) {
    const can = new Graphics()
    const x = Math.random() * 200
    const y = -20 - Math.random() * 100
    const size = 6 + Math.random() * 4

    can.rect(x, y, size, size * 1.3)
    can.fill(0x8b4513)
    can.rect(x + 1, y + 1, size - 2, 2)
    can.fill(0xc0c0c0)

    container.addChild(can)

    const fall = () => {
      can.y += 2 + Math.random() * 3
      if (can.y < 300) {
        requestAnimationFrame(fall)
      } else {
        container.removeChild(can)
        can.destroy()
      }
    }
    fall()
  }
}

export function spawnStars(container: Container): void {
  const colors = [0xffd700, 0xffa500, 0xffffff]
  for (let i = 0; i < 8; i++) {
    const star = new Graphics()
    const x = 40 + Math.random() * 180
    const y = 40 + Math.random() * 180
    const color = colors[Math.floor(Math.random() * colors.length)]

    star.poly([
      0, -4,
      1, -1,
      4, 0,
      1, 1,
      0, 4,
      -1, 1,
      -4, 0,
      -1, -1,
    ])
    star.fill(color)
    star.x = x
    star.y = y
    star.alpha = 0

    container.addChild(star)

    const twinkle = () => {
      star.alpha = 0.3 + Math.random() * 0.7
      setTimeout(twinkle, 200 + Math.random() * 400)
    }
    twinkle()
  }
}

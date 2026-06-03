import { Container, Graphics, Ticker } from 'pixi.js'

interface Particle {
  graphic: Graphics
  vx: number
  vy: number
  life: number
  maxLife: number
}

export function spawnTushonkaRain(container: Container, ticker: Ticker): void {
  const particles: Particle[] = []

  for (let i = 0; i < 20; i++) {
    const can = new Graphics()
    const x = Math.random() * 220 + 10
    const size = 5 + Math.random() * 4

    can.rect(x, -20 - Math.random() * 80, size, size * 1.3)
    can.fill(0x8b4513)
    can.rect(x + 1, -19 - Math.random() * 80, size - 2, 2)
    can.fill(0xc0c0c0)

    container.addChild(can)

    particles.push({
      graphic: can,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 1.5 + Math.random() * 2,
      life: 1,
      maxLife: 120 + Math.random() * 80,
    })
  }

  const onTick = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life--
      p.graphic.x += p.vx
      p.graphic.y += p.vy

      if (p.life <= 0) {
        container.removeChild(p.graphic)
        p.graphic.destroy()
        particles.splice(i, 1)
      }
    }

    if (particles.length === 0) {
      ticker.remove(onTick)
    }
  }

  ticker.add(onTick)
}

export function spawnStars(container: Container, ticker: Ticker): void {
  const stars: { graphic: Graphics; phase: number; speed: number }[] = []

  for (let i = 0; i < 12; i++) {
    const star = new Graphics()
    const x = 20 + Math.random() * 200
    const y = 20 + Math.random() * 200
    const colors = [0xffd700, 0xffa500, 0xffffff]
    const color = colors[Math.floor(Math.random() * colors.length)]

    star.poly([
      0, -3, 1, -1, 3, 0, 1, 1, 0, 3, -1, 1, -3, 0, -1, -1,
    ])
    star.fill(color)
    star.x = x
    star.y = y
    star.alpha = 0

    container.addChild(star)

    stars.push({
      graphic: star,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
    })
  }

  let elapsed = 0

  const onTick = () => {
    elapsed++
    for (const s of stars) {
      s.graphic.alpha = 0.3 + Math.sin(elapsed * s.speed + s.phase) * 0.35
    }
  }

  ticker.add(onTick)
}

import {
  Application,
  Container,
  Graphics,
  Text,
} from 'pixi.js'
import { useEffect, useRef } from 'react'

import type { LiveEvent } from '../../types/game'

import { District, districts, LAOS_OUTLINE, MEKONG_PATH } from '../../data/laosMap'

const MAP_W = 360
const MAP_H = 480
const PAD = 20

export interface MapClickInfo {
  district: District
}

const SEVERITY_COLORS: Record<string, number> = {
  critical: 0xd32f2f,
  high: 0xf44336,
  low: 0x4caf50,
  medium: 0xff9800,
}

export default function LaosMapView({
  liveEvents,
  onDistrictClick,
  onLiveEventClick,
}: {
  liveEvents: LiveEvent[]
  onDistrictClick: (info: MapClickInfo) => void
  onLiveEventClick: (event: LiveEvent) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const eventsLayerRef = useRef<Container | null>(null)
  const phaseRef = useRef(0)
  const pulsePhasesRef = useRef<Map<Container, number>>(new Map())

  useEffect(() => {
    if (!containerRef.current) return
    const app = new Application()
    appRef.current = app

    const initApp = async () => {
      await app.init({
        antialias: false,
        background: 0x0a1a0a,
        height: MAP_H,
        resolution: 1,
        width: MAP_W,
      })

      if (!containerRef.current) return
      containerRef.current.appendChild(app.canvas)

      const scaleX = MAP_W - PAD * 2
      const scaleY = MAP_H - PAD * 2

      function toScreen([nx, ny]: [number, number]): { x: number; y: number } {
        return { x: nx * scaleX + PAD, y: ny * scaleY + PAD }
      }

      function screenPts(pts: readonly [number, number][]): { x: number; y: number }[] {
        return pts.map(toScreen)
      }

      const bg = new Graphics()
      bg.rect(0, 0, MAP_W, MAP_H)
      bg.fill(0x0d1f0d)
      app.stage.addChild(bg)

      const country = new Graphics()
      const outlinePts = screenPts(LAOS_OUTLINE)
      country.poly(outlinePts.map((p) => ({ x: p.x, y: p.y })))
      country.fill({ color: 0x1a3a1a })
      country.poly(outlinePts.map((p) => ({ x: p.x, y: p.y })))
      country.stroke({ alpha: 0.8, color: 0x4a8a4a, width: 2 })
      app.stage.addChild(country)

      const river = new Graphics()
      const mekong = screenPts(MEKONG_PATH)
      river.moveTo(mekong[0].x, mekong[0].y)
      for (let i = 1; i < mekong.length; i++) {
        river.lineTo(mekong[i].x, mekong[i].y)
      }
      river.stroke({ alpha: 0.35, color: 0x2a6a9a, width: 1.5 })
      app.stage.addChild(river)

      for (const dist of districts) {
        const c = new Container()
        c.eventMode = 'static'
        c.cursor = 'pointer'

        const g = new Graphics()
        const pts = screenPts(dist.polygon)

        g.poly(pts.map((p) => ({ x: p.x, y: p.y })))
        g.fill({ alpha: 0.50, color: dist.color })
        g.poly(pts.map((p) => ({ x: p.x, y: p.y })))
        g.stroke({ alpha: 0.2, color: 0xffffff, width: 0.5 })
        g.poly(pts.map((p) => ({ x: p.x, y: p.y })))
        g.stroke({ color: dist.color, width: 3 })

        c.addChild(g)

        const lbl = new Text({
          style: { fill: 0xffffff, fontFamily: '"Press Start 2P",monospace', fontSize: 8 },
          text: dist.name,
        })
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
        lbl.x = cx - lbl.width / 2
        lbl.y = cy - lbl.height / 2
        c.addChild(lbl)

        const capPos = toScreen(dist.capitalPos)
        const dot = new Graphics()
        dot.circle(capPos.x, capPos.y, 3)
        dot.fill(0xffd700)
        c.addChild(dot)

        c.on('pointerdown', () => { onDistrictClick({ district: dist }); })
        c.on('pointerover', () => { c.alpha = 0.85 })
        c.on('pointerout', () => { c.alpha = 1 })

        app.stage.addChild(c)
      }

      const evLayer = new Container()
      app.stage.addChild(evLayer)
      eventsLayerRef.current = evLayer

      const pulseMap = pulsePhasesRef.current

      app.ticker.add(() => {
        phaseRef.current += 0.04
        for (const child of evLayer.children) {
          const container = child as Container
          const phase = pulseMap.get(container) ?? 0
          const s = 1 + Math.sin(phaseRef.current + phase) * 0.25
          container.scale.set(s)
          container.alpha = 0.65 + Math.sin(phaseRef.current + phase) * 0.35
        }
      })
    }

    void initApp()
    return () => { app.destroy(true, { children: true }); appRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const evLayer = eventsLayerRef.current
    const app = appRef.current
    if (!evLayer || !app) return

    evLayer.removeChildren()
    pulsePhasesRef.current.clear()

    const scaleX = MAP_W - PAD * 2
    const scaleY = MAP_H - PAD * 2
    const toScreen = ([nx, ny]: [number, number]) => ({
      x: nx * scaleX + PAD,
      y: ny * scaleY + PAD,
    })

    for (const ev of liveEvents) {
      const pos = toScreen(ev.position)
      const color = SEVERITY_COLORS[ev.severity] ?? 0xffffff

      const marker = new Container()
      marker.eventMode = 'static'
      marker.cursor = 'pointer'
      marker.x = pos.x
      marker.y = pos.y
      pulsePhasesRef.current.set(marker, Math.random() * Math.PI * 2)

      const ring = new Graphics()
      ring.circle(0, 0, 10)
      ring.fill({ alpha: 0.3, color })
      marker.addChild(ring)

      const core = new Graphics()
      core.circle(0, 0, 5)
      core.fill({ color })
      marker.addChild(core)

      const label = new Text({
        style: { fill: 0xffffff, fontFamily: '"Press Start 2P",monospace', fontSize: 7 },
        text: ev.severity === 'critical' ? '!!!' : ev.severity === 'high' ? '!!' : '!',
      })
      label.x = -label.width / 2
      label.y = -label.height / 2
      marker.addChild(label)

      marker.on('pointerdown', () => { onLiveEventClick(ev); })
      marker.on('pointerover', () => { marker.alpha = 1; marker.scale.set(1.4); })
      marker.on('pointerout', () => { marker.alpha = 1; })

      evLayer.addChild(marker)
    }
  }, [liveEvents, onLiveEventClick])

  return (
    <div
      ref={containerRef}
      style={{
        borderRadius: 4,
        height: MAP_H,
        margin: '0 auto',
        overflow: 'hidden',
        width: MAP_W,
      }}
    />
  )
}

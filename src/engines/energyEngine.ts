export default class EnergyEngine {
  time = 0

  step(ctx: CanvasRenderingContext2D, hands: any[], w: number, h: number) {
    this.time += 0.02
    const a = hands[0]
    const b = hands[1]
    if (!a || !b) return

    const maxDistance = 0.35
    const palette = [
      { start: '#00f5ff', end: '#7c68ff' },
      { start: '#ff4da6', end: '#e94efd' },
      { start: '#8c4bff', end: '#4dc3ff' }
    ]

    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = 'source-over'

    const drawSolidLine = (sx: number, sy: number, ex: number, ey: number, width: number, color: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }

    for (let i = 0; i < a.landmarks.length; i++) {
      const A = a.landmarks[i]
      const B = b.landmarks[i]
      if (!A || !B) continue
      const dx = A.x - B.x
      const dy = A.y - B.y
      const d = Math.sqrt(dx * dx + dy * dy)
      const strength = Math.max(0, 1 - d / maxDistance)
      const sx = A.x * w
      const sy = A.y * h
      const ex = B.x * w
      const ey = B.y * h
      const paletteItem = palette[i % palette.length]
      const grad = ctx.createLinearGradient(sx, sy, ex, ey)
      grad.addColorStop(0, paletteItem.start)
      grad.addColorStop(1, paletteItem.end)

      ctx.strokeStyle = grad
      ctx.lineWidth = 1
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }

    const palmIndices = [0, 5, 9, 13, 17]
    const drawPalmLines = (hand: any, color: string) => {
      for (let i = 0; i < palmIndices.length - 1; i++) {
        const P = hand.landmarks[palmIndices[i]]
        const Q = hand.landmarks[palmIndices[i + 1]]
        if (!P || !Q) continue
        drawSolidLine(P.x * w, P.y * h, Q.x * w, Q.y * h, 1, color)
      }
    }

    drawPalmLines(a, '#00f5ff')
    drawPalmLines(b, '#ff4da6')

    for (let i = 0; i < palmIndices.length; i++) {
      const A = a.landmarks[palmIndices[i]]
      const B = b.landmarks[palmIndices[i]]
      if (!A || !B) continue
      drawSolidLine(A.x * w, A.y * h, B.x * w, B.y * h, 1, '#7c68ff')
    }

    for (let i = 0; i < a.landmarks.length; i++) {
      for (let j = 0; j < b.landmarks.length; j++) {
        const A = a.landmarks[i]
        const B = b.landmarks[j]
        const dx = A.x - B.x
        const dy = A.y - B.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < maxDistance * 0.55) {
          const strength = 1 - d / (maxDistance * 0.55)
          const sx = A.x * w
          const sy = A.y * h
          const ex = B.x * w
          const ey = B.y * h
          ctx.strokeStyle = `rgba(255,77,166,${0.3 * strength})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(ex, ey)
          ctx.stroke()
        }
      }
    }

    ctx.restore()
  }
}

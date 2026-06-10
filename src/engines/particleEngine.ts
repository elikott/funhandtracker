type Landmark = { x: number; y: number }

export default class ParticleEngine {
  particles: any[] = []

  step(ctx: CanvasRenderingContext2D, hands: any[], w: number, h: number) {
    // spawn around fingertips
    hands.forEach(hand => {
      const tips = [4,8,12,16,20]
      tips.forEach((i: number) => {
        const p = hand.landmarks[i]
        if (!p) return
        if (Math.random() < 0.12) {
          this.particles.push({ x: p.x * w, y: p.y * h, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6, life: 60 })
        }
      })
    })

    // update and draw
    for (let i = this.particles.length-1; i >= 0; i--) {
      const P = this.particles[i]
      P.x += P.vx
      P.y += P.vy
      P.vy += 0.01
      P.life -= 1
      const alpha = Math.max(0, P.life / 60)
      ctx.beginPath()
      ctx.fillStyle = `rgba(255,77,166,${alpha})`
      ctx.arc(P.x, P.y, 2 + (1-alpha)*2, 0, Math.PI*2)
      ctx.fill()
      if (P.life <= 0) this.particles.splice(i,1)
    }
  }
}

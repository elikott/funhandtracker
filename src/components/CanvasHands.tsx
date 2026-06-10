import React, { useEffect, useRef, useState } from 'react'
import useHandTracker, { HandResult } from '../hooks/useHandTracker'
import ParticleEngine from '../engines/particleEngine'
import EnergyEngine from '../engines/energyEngine'

type CameraMode = 'off' | 'small' | 'large'

type Props = {
  showParticles: boolean
  gravityOn: boolean
  energyOn: boolean
  cameraMode: CameraMode
}

const CanvasHands: React.FC<Props> = ({ showParticles, gravityOn, energyOn, cameraMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { videoRef, loading, error, hands } = useHandTracker()
  const particleRef = useRef<ParticleEngine | null>(null)
  const energyRef = useRef<EnergyEngine | null>(null)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    particleRef.current = new ParticleEngine()
    energyRef.current = new EnergyEngine()
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const ctx = canvasRef.current?.getContext('2d')!

    function draw() {
      raf = requestAnimationFrame(draw)
      const now = performance.now()
      const dt = now - last
      last = now
      setFps(Math.round(1000 / Math.max(1, dt)))

      if (!canvasRef.current || !ctx) return
      const w = canvasRef.current.width = window.innerWidth
      const h = canvasRef.current.height = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      // background glow or transparent overlay when large preview is enabled
      if (cameraMode === 'large') {
        ctx.fillStyle = 'rgba(2,6,23,0.08)'
      } else {
        ctx.fillStyle = 'rgba(2,6,23,0.3)'
      }
      ctx.fillRect(0, 0, w, h)

      // draw hands
      hands.forEach((hand: HandResult, idx: number) => {
        // landmarks
        hand.landmarks.forEach((lm, i) => {
          const x = lm.x * w
          const y = lm.y * h
          const color = ['#00f5ff', '#9b59ff', '#ff4da6', '#00aaff'][i % 4]
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = 12
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
        })

        // connections
        const connections = hand.connections
        ctx.lineWidth = 2
        ctx.globalCompositeOperation = 'lighter'
        connections.forEach(([a, b]) => {
          const A = hand.landmarks[a]
          const B = hand.landmarks[b]
          ctx.beginPath()
          const grad = ctx.createLinearGradient(A.x * w, A.y * h, B.x * w, B.y * h)
          grad.addColorStop(0, '#00f5ff')
          grad.addColorStop(1, '#9b59ff')
          ctx.strokeStyle = grad
          ctx.moveTo(A.x * w, A.y * h)
          ctx.lineTo(B.x * w, B.y * h)
          ctx.stroke()
        })

      })

      // energy web
      if (energyOn && hands.length === 2 && energyRef.current) {
        energyRef.current.step(ctx, hands, w, h)
      }

      // particles
      if (showParticles && particleRef.current) {
        particleRef.current.step(ctx, hands, w, h)
      }

      const handsEl = document.getElementById('hands')
      if (handsEl) handsEl.textContent = String(hands.length)
      const fpsEl = document.getElementById('fps')
      if (fpsEl) fpsEl.textContent = String(fps)

    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [hands, showParticles, energyOn, fps, gravityOn])

  return (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute object-cover ${cameraMode === 'off' ? 'hidden' : cameraMode === 'small' ? 'right-3 bottom-3 w-40 h-24 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.45)]' : 'inset-0 w-full h-full'}`}
        style={{
          opacity: cameraMode === 'large' ? 1 : 1,
          zIndex: cameraMode === 'large' ? 0 : 10,
          pointerEvents: 'none'
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {loading && <div className="absolute inset-0 flex items-center justify-center text-white">Loading model...</div>}
      {error && <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4">
        <div className="font-bold">Camera error</div>
        <div className="mt-2 text-sm max-w-xl text-center">{error}</div>
        <div className="mt-3 text-xs opacity-80">If you allowed camera access, try reloading the page and ensure the browser tab has camera permission.</div>
      </div>}
    </div>
  )
}

export default CanvasHands

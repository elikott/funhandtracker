import { useEffect, useRef, useState } from 'react'
import type { Hands as HandsType } from '@mediapipe/hands'
import '@mediapipe/hands'

export type HandResult = {
  landmarks: { x: number; y: number; z?: number }[]
  connections: number[][]
}

const defaultConnections = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20]
]

export default function useHandTracker() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const handsRef = useRef<HandsType | null>(null)
  const cameraRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [hands, setHands] = useState<HandResult[]>([])

  useEffect(() => {
    let mounted = true
    const onResults = (results: any) => {
      if (!mounted) return
      if (!modelLoaded) {
        setModelLoaded(true)
        setError(null)
        setLoading(false)
      }
      const arr: HandResult[] = []
      if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const lm = results.multiHandLandmarks[i]
          arr.push({ landmarks: lm.map((p: any) => ({ x: p.x, y: p.y, z: p.z })), connections: defaultConnections })
        }
      }
      setHands(arr)
    }

    const setup = async () => {
      const video = videoRef.current
      if (!video) {
        setError('Video element is not ready.')
        setLoading(false)
        return
      }

      try {
        const HandsClass = typeof window !== 'undefined' ? (window as any).Hands : undefined
        if (!HandsClass) {
          throw new Error('MediaPipe Hands could not be loaded on window')
        }
        handsRef.current = new HandsClass({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
        handsRef.current.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        })
        handsRef.current.onResults(onResults)
      } catch (err: any) {
        console.error('Failed to initialize MediaPipe Hands', err)
        if (!mounted) return
        setError('Model initialization failed: ' + String(err?.message || err))
        setLoading(false)
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        if (!mounted) return
        setError('Camera API not supported in this browser.')
        setLoading(false)
        return
      }

      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        video.srcObject = stream
        video.playsInline = true
        await video.play()
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
      } catch (err: any) {
        console.error('getUserMedia error', err)
        if (!mounted) return
        setError('Camera access denied or unavailable: ' + String(err?.message || err))
        setLoading(false)
        return
      }

      // drive frames with requestAnimationFrame; don't treat frame-send errors as fatal
      let rafId: number | null = null
      const loop = async () => {
        try {
          if (handsRef.current && video.readyState >= 2) await handsRef.current.send({ image: video })
        } catch (e) {
          // ignore per-frame errors
        }
        rafId = requestAnimationFrame(loop)
      }
      loop()
      cameraRef.current = { stop: () => { if (rafId) cancelAnimationFrame(rafId) } }
      // keep loading=true until first onResults arrives; fallback timeout
      const fallback = setTimeout(() => {
        if (!modelLoaded) {
          setLoading(false)
        }
      }, 8000)
      ;(cameraRef.current as any).fallbackTimer = fallback
    }

    setup()
    return () => {
      mounted = false
      try {
        cameraRef.current?.stop?.()
        if ((cameraRef.current as any)?.fallbackTimer) clearTimeout((cameraRef.current as any).fallbackTimer)
        ;(handsRef.current as any)?.close?.()
        const v = videoRef.current
        if (v && v.srcObject) {
          const s = v.srcObject as MediaStream
          s.getTracks().forEach(t => t.stop())
          v.srcObject = null
        }
      } catch (e) {
        console.warn('cleanup error', e)
      }
    }
  }, [])

  return { videoRef, loading, error, hands }
}

import React from 'react'

type CameraMode = 'off' | 'small' | 'large'

type Props = {
  fpsRange?: any
  showParticles: boolean
  setShowParticles: (v: boolean) => void
  gravityOn: boolean
  setGravityOn: (v: boolean) => void
  energyOn: boolean
  setEnergyOn: (v: boolean) => void
  cameraMode: CameraMode
  setCameraMode: (mode: CameraMode) => void
}

export default function UIOverlay(props: Props) {
  return (
    <div className="absolute top-4 left-4 z-50 space-y-2">
      <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 text-sm max-w-md">
        <div className="flex flex-wrap items-center gap-3">
          <div>FPS: <span id="fps">--</span></div>
          <div>Hands: <span id="hands">0</span></div>
          <button
            className="ml-2 px-2 py-1 bg-neonCyan/10 rounded hover:bg-neonCyan/20"
            onClick={() => document.documentElement.requestFullscreen()}
          >
            Fullscreen
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={props.showParticles} onChange={e => props.setShowParticles(e.target.checked)} /> Particles</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={props.gravityOn} onChange={e => props.setGravityOn(e.target.checked)} /> Gravity</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={props.energyOn} onChange={e => props.setEnergyOn(e.target.checked)} /> Energy Web</label>
        </div>
        <div className="mt-3">
          <div className="text-xs uppercase tracking-widest text-neonCyan/80 mb-1">Camera preview</div>
          <div className="flex flex-wrap gap-2">
            {(['off', 'small', 'large'] as CameraMode[]).map(mode => (
              <button
                key={mode}
                className={`px-3 py-1 rounded text-sm border ${props.cameraMode === mode ? 'border-neonCyan bg-neonCyan/15' : 'border-white/10 hover:border-neonCyan/40'}`}
                onClick={() => props.setCameraMode(mode)}
              >
                {mode === 'off' ? 'Hidden' : mode === 'small' ? 'Small' : 'Large'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

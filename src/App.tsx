import React, { useState } from 'react'
import CanvasHands from './components/CanvasHands'
import UIOverlay from './components/UIOverlay'

type CameraMode = 'off' | 'small' | 'large'

export default function App() {
  const [showParticles, setShowParticles] = useState(true)
  const [gravityOn, setGravityOn] = useState(true)
  const [energyOn, setEnergyOn] = useState(true)
  const [cameraMode, setCameraMode] = useState<CameraMode>('small')

  return (
    <div className="w-screen h-screen relative text-white overflow-hidden">
      <CanvasHands
        showParticles={showParticles}
        gravityOn={gravityOn}
        energyOn={energyOn}
        cameraMode={cameraMode}
      />
      <UIOverlay
        fpsRange={{}}
        showParticles={showParticles}
        setShowParticles={setShowParticles}
        gravityOn={gravityOn}
        setGravityOn={setGravityOn}
        energyOn={energyOn}
        setEnergyOn={setEnergyOn}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
      />
    </div>
  )
}

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { FallingLogos } from './manifesto/FallingLogos'
import { ParticleField } from './manifesto/ParticleField'
import { CursorParticles } from './manifesto/CursorParticles'
import { ModelParticles } from './manifesto/ModelParticles'

export const ManifestoScene = ({
  isActive = false,
  modelPath = '/models/kayao_tecla.glb',
}) => (
  <Canvas
    gl={{ alpha: true, antialias: true }}
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, 10], fov: 75 }}
  >
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 5, 5]} intensity={1} />
    <directionalLight position={[-3, -3, 3]} intensity={0.4} />

    {/* Particle layers — outside Physics for performance */}
    <ParticleField />
    <CursorParticles />
    <ModelParticles />

    {/* Physics world — paused when section is not in viewport */}
    <Suspense fallback={null}>
      <Physics gravity={[0, -3.5, 0]} paused={!isActive}>
        <FallingLogos modelPath={modelPath} />
      </Physics>
    </Suspense>
  </Canvas>
)

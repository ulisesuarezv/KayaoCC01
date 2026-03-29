import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { FallingLogos } from './manifesto/FallingLogos'
import { ParticleField } from './manifesto/ParticleField'
import { ModelParticles } from './manifesto/ModelParticles'

const isMobile = window.innerWidth < 1024

const ManifestoScene = ({
  isActiveRef,
  physicsActive = false,
  modelPath = '/models/kayao_tecla.glb',
}) => (
  <Canvas
    gl={{ alpha: true, antialias: window.devicePixelRatio < 2 }}
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, isMobile ? 14 : 10], fov: isMobile ? 65 : 75 }}
  >
    <ambientLight intensity={0.9} />
    <directionalLight position={[5, 5, 5]} intensity={1.4} />
    <directionalLight position={[-3, -3, 3]} intensity={0.6} />

    {/* Particle layers — gated by isActiveRef (read in useFrame, zero re-renders) */}
    <ParticleField isActiveRef={isActiveRef} />
    <ModelParticles isActiveRef={isActiveRef} />

    {/* Physics world — paused via boolean prop (toggles on boundary crossing only) */}
    <Suspense fallback={null}>
      <Physics gravity={[0, -3.5, 0]} paused={!physicsActive}>
        <FallingLogos modelPath={modelPath} />
      </Physics>
    </Suspense>
  </Canvas>
)

export default ManifestoScene

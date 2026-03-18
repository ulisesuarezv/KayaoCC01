import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { KayaoSymbol } from './KayaoSymbol'

export const Scene = () => (
  <Canvas
    gl={{ alpha: true, antialias: true }}
    camera={{ position: [0, 0, 5], fov: 45 }}
  >
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={1.2} />
    <directionalLight position={[-3, -2, 4]} intensity={0.3} />
    <Environment preset="city" environmentIntensity={0.3} />
    <Suspense fallback={null}>
      {/* Positioned top-left, large — replaces the "K" placeholder */}
      <KayaoSymbol position={[-3.5, -0.5, 0]} scale={1.7} />
    </Suspense>
  </Canvas>
)

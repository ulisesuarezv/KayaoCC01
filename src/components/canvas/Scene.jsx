import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { KayaoSymbol } from './KayaoSymbol'

const isMobile = window.innerWidth < 1024

export const Scene = () => (
  <Canvas
    gl={{ alpha: true, antialias: window.devicePixelRatio < 2 }}
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, 5], fov: isMobile ? 55 : 45 }}
  >
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={1.2} />
    <directionalLight position={[-3, -2, 4]} intensity={0.3} />
    <Environment preset="city" environmentIntensity={0.3} resolution={64} />
    <Suspense fallback={null}>
      <KayaoSymbol
        position={isMobile ? [-0.8, -0.3, 0] : [-3.5, -0.5, 0]}
        scale={isMobile ? 1.2 : 1.7}
      />
    </Suspense>
  </Canvas>
)

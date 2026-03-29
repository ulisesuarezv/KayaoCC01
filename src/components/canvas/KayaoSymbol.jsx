import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { useAppStore } from '../../stores/useAppStore'

export const KayaoSymbol = (props) => {
  const meshRef = useRef(null)
  const { nodes, materials } = useGLTF('/models/simbolo_kayaoGOD-transformed.glb')
  const smoothProgress = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const dt = Math.min(delta, 0.05)
    const heroProgress = useAppStore.getState().sectionProgress.hero

    // Damp towards target — frame-rate independent smoothing
    smoothProgress.current = MathUtils.damp(smoothProgress.current, heroProgress, 6, dt)

    // Idle rotation
    meshRef.current.rotation.y += dt * 0.3
    // Scroll-driven tilt and depth shift (smoothed)
    meshRef.current.rotation.x = (Math.PI / 2) + smoothProgress.current * -0.5
    meshRef.current.position.z = smoothProgress.current * -2
  })

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={meshRef}
        geometry={nodes.material.geometry}
        material={materials['Material.001']}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

useGLTF.preload('/models/simbolo_kayaoGOD-transformed.glb')

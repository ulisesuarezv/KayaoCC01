import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '../../stores/useAppStore'

export const KayaoSymbol = (props) => {
  const meshRef = useRef(null)
  const { nodes, materials } = useGLTF('/models/simbolo_kayaoGOD-transformed.glb')

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const heroProgress = useAppStore.getState().sectionProgress.hero
    // Idle rotation
    meshRef.current.rotation.y += delta * 0.3
    // Scroll-driven tilt and depth shift
    meshRef.current.rotation.x = (Math.PI / 2) + heroProgress * -0.5
    meshRef.current.position.z = heroProgress * -2
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

import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export const PinLogo = ({ rotationSpeed = 0.5, ...props }) => {
  const groupRef = useRef(null)
  const { nodes, materials } = useGLTF('/models/pin_logo-transformed.glb')

  // Slow idle rotation
  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * rotationSpeed
  })

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh geometry={nodes.Pin_Disc.geometry} material={materials.Mat_Yellow} />
      <mesh geometry={nodes.Logo_Fill.geometry} material={materials.Mat_Black} />
    </group>
  )
}

useGLTF.preload('/models/pin_logo-transformed.glb')

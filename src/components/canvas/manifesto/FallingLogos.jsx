import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { emissionQueue } from './particleEvents'

const isMobile = window.innerWidth < 1024
const LOGO_COUNT = isMobile ? 16 : 40
const SPREAD_X = isMobile ? 12 : 28
const WALL_X = isMobile ? 8 : 16

const generateSpawns = (count) => {
  const spawns = []
  for (let i = 0; i < count; i++) {
    spawns.push({
      position: [
        (Math.random() - 0.5) * SPREAD_X,
        5 + Math.random() * 18,
        (Math.random() - 0.5) * 2,
      ],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      scale: 0.4 + Math.random() * 0.5,
    })
  }
  return spawns
}

const LogoInstance = ({ spawn, scene }) => {
  const cloned = useMemo(() => scene.clone(true), [scene])

  // Dispose cloned geometries/materials on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cloned.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose()
          child.material?.dispose()
        }
      })
    }
  }, [cloned])

  const handleCollision = (e) => {
    const contact = e.manifold?.solverContactPoint?.(0)
    if (contact) {
      emissionQueue.push({
        x: contact.x,
        y: contact.y,
        z: contact.z,
        time: performance.now(),
      })
    } else {
      // Fallback: use the body position
      const t = e.target?.translation?.()
      if (t) {
        emissionQueue.push({
          x: t.x,
          y: t.y,
          z: t.z,
          time: performance.now(),
        })
      }
    }
  }

  return (
    <RigidBody
      position={spawn.position}
      rotation={spawn.rotation}
      restitution={0.92}
      friction={0.2}
      linearDamping={0.08}
      angularDamping={0.15}
      colliders={false}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[0.5 * spawn.scale, 0.5 * spawn.scale, 0.15 * spawn.scale]} />
      <primitive object={cloned} scale={spawn.scale} />
    </RigidBody>
  )
}

// Invisible walls to contain the logos
const Walls = () => (
  <>
    {/* Floor */}
    <RigidBody type="fixed" position={[0, -6, 0]} restitution={0.9}>
      <CuboidCollider args={[20, 0.5, 5]} />
    </RigidBody>
    {/* Left wall */}
    <RigidBody type="fixed" position={[-WALL_X, 5, 0]} restitution={0.85}>
      <CuboidCollider args={[0.5, 20, 5]} />
    </RigidBody>
    {/* Right wall */}
    <RigidBody type="fixed" position={[WALL_X, 5, 0]} restitution={0.85}>
      <CuboidCollider args={[0.5, 20, 5]} />
    </RigidBody>
    {/* Front wall */}
    <RigidBody type="fixed" position={[0, 5, 3]} restitution={0.85}>
      <CuboidCollider args={[20, 20, 0.5]} />
    </RigidBody>
    {/* Back wall */}
    <RigidBody type="fixed" position={[0, 5, -3]} restitution={0.85}>
      <CuboidCollider args={[20, 20, 0.5]} />
    </RigidBody>
  </>
)

export const FallingLogos = ({ modelPath = '/models/kayao_tecla.glb' }) => {
  const { scene } = useGLTF(modelPath)
  const spawns = useMemo(() => generateSpawns(LOGO_COUNT), [])

  return (
    <>
      <Walls />
      {spawns.map((spawn, i) => (
        <LogoInstance key={i} spawn={spawn} scene={scene} />
      ))}
    </>
  )
}

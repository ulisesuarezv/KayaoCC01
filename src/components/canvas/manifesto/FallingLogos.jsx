import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { emissionQueue } from './particleEvents'

const LOGO_COUNT = 40

const generateSpawns = (count) => {
  const spawns = []
  for (let i = 0; i < count; i++) {
    spawns.push({
      position: [
        (Math.random() - 0.5) * 28,       // x: -14 to 14 (full viewport width)
        5 + Math.random() * 18,            // y: 5 to 23 (staggered drop)
        (Math.random() - 0.5) * 2,         // z: -1 to 1
      ],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      scale: 0.4 + Math.random() * 0.5,   // 0.4 to 0.9
    })
  }
  return spawns
}

const LogoInstance = ({ spawn, scene }) => {
  const cloned = useMemo(() => scene.clone(true), [scene])

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
      colliders="hull"
      onCollisionEnter={handleCollision}
    >
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
    <RigidBody type="fixed" position={[-16, 5, 0]} restitution={0.85}>
      <CuboidCollider args={[0.5, 20, 5]} />
    </RigidBody>
    {/* Right wall */}
    <RigidBody type="fixed" position={[16, 5, 0]} restitution={0.85}>
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

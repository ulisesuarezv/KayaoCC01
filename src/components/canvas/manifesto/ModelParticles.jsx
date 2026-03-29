import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { emissionQueue } from './particleEvents'
import { COLORS, pickColor, generateRadius } from './particleUtils'

const isMobile = window.innerWidth < 1024
const POOL_SIZE = isMobile ? 80 : 200
const GRAVITY = -1.5
const DAMPING = 0.98
const MIN_LIFE = 1.0
const MAX_LIFE = 2.2
const CIRCLE_SEGMENTS = isMobile ? 16 : 24

// Scratch object reused every frame
const _obj = new THREE.Object3D()

export const ModelParticles = ({ isActiveRef }) => {
  const meshRef = useRef(null)
  const nextSlot = useRef(0)
  const liveCount = useRef(0)
  // Per-particle: vx, vy, vz, life, maxLife, radius, px, py, pz
  const particleData = useRef(new Float32Array(POOL_SIZE * 9))

  // Initialize all instances as hidden
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    _obj.scale.setScalar(0)
    _obj.position.set(0, -100, 0)
    _obj.updateMatrix()

    for (let i = 0; i < POOL_SIZE; i++) {
      mesh.setMatrixAt(i, _obj.matrix)
      mesh.setColorAt(i, COLORS[0].color)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh || !isActiveRef?.current) return

    const pd = particleData.current
    const dt = Math.min(delta, 0.05)
    let colorDirty = false
    const queueLen = emissionQueue.length

    // Early exit: nothing to do
    if (liveCount.current === 0 && queueLen === 0) return

    // Consume collision events
    for (let q = 0; q < queueLen; q++) {
      const event = emissionQueue[q]
      const burstCount = 5 + Math.floor(Math.random() * 8) // 5-12 per collision

      for (let j = 0; j < burstCount; j++) {
        const idx = nextSlot.current
        nextSlot.current = (nextSlot.current + 1) % POOL_SIZE
        const i9 = idx * 9

        // If overwriting a live particle, don't double-count
        if (pd[i9 + 4] > 0 && pd[i9 + 3] < pd[i9 + 4]) {
          // Replacing a live particle — no net change to liveCount
        } else {
          liveCount.current++
        }

        const px = event.x + (Math.random() - 0.5) * 0.2
        const py = event.y + (Math.random() - 0.5) * 0.2
        const pz = event.z + (Math.random() - 0.5) * 0.2

        // Spherical random velocity
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const speed = 1.5 + Math.random() * 3.0

        pd[i9]     = Math.sin(phi) * Math.cos(theta) * speed // vx
        pd[i9 + 1] = Math.sin(phi) * Math.sin(theta) * speed // vy
        pd[i9 + 2] = Math.cos(phi) * speed                   // vz
        pd[i9 + 3] = 0                                       // life
        pd[i9 + 4] = MIN_LIFE + Math.random() * (MAX_LIFE - MIN_LIFE) // maxLife
        pd[i9 + 5] = generateRadius(0.04, 0.25)              // radius
        pd[i9 + 6] = px                                      // posX
        pd[i9 + 7] = py                                      // posY
        pd[i9 + 8] = pz                                      // posZ

        _obj.position.set(px, py, pz)
        _obj.scale.setScalar(pd[i9 + 5])
        _obj.updateMatrix()
        mesh.setMatrixAt(idx, _obj.matrix)

        mesh.setColorAt(idx, pickColor())
        colorDirty = true
      }
    }
    if (queueLen > 0) emissionQueue.length = 0

    // Update live particles
    for (let i = 0; i < POOL_SIZE; i++) {
      const i9 = i * 9

      // Skip never-emitted or already dead
      if (pd[i9 + 4] === 0) continue
      if (pd[i9 + 3] >= pd[i9 + 4]) continue

      pd[i9 + 3] += dt // life
      const lifeRatio = pd[i9 + 3] / pd[i9 + 4]

      if (lifeRatio >= 1) {
        _obj.scale.setScalar(0)
        _obj.position.set(0, -100, 0)
        _obj.updateMatrix()
        mesh.setMatrixAt(i, _obj.matrix)
        liveCount.current--
        continue
      }

      // Gravity + damping
      pd[i9 + 1] += GRAVITY * dt
      pd[i9]     *= DAMPING
      pd[i9 + 1] *= DAMPING
      pd[i9 + 2] *= DAMPING

      // Update position
      pd[i9 + 6] += pd[i9] * dt
      pd[i9 + 7] += pd[i9 + 1] * dt
      pd[i9 + 8] += pd[i9 + 2] * dt

      // Fade out via scale in last 50% of life
      const baseRadius = pd[i9 + 5]
      const fade = lifeRatio > 0.5 ? 1.0 - ((lifeRatio - 0.5) / 0.5) : 1.0

      _obj.position.set(pd[i9 + 6], pd[i9 + 7], pd[i9 + 8])
      _obj.scale.setScalar(baseRadius * fade)
      _obj.updateMatrix()
      mesh.setMatrixAt(i, _obj.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (colorDirty) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POOL_SIZE]} frustumCulled={false}>
      <circleGeometry args={[1, CIRCLE_SEGMENTS]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

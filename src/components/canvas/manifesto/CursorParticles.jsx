import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const POOL_SIZE = 4000
const EMITTER_COUNT = 6
const GRAVITY = -1.0
const DAMPING = 0.99
const MAX_LIFE = 3.0

// Generate circular sprite texture
const createSoftDot = () => {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export const CursorParticles = () => {
  const pointsRef = useRef(null)
  const cursorWorld = useRef(new THREE.Vector3(0, 0, 0.5))
  const prevCursor = useRef(new THREE.Vector3(0, 0, 0.5))
  const nextSlot = useRef(0)
  const { camera, gl } = useThree()

  // Per-particle data: vx, vy, vz, life, maxLife, active
  const particleData = useRef(null)

  const { positions, colors, alphas, dotMap, emitters } = useMemo(() => {
    const positions = new Float32Array(POOL_SIZE * 3)
    const colors = new Float32Array(POOL_SIZE * 3)
    const alphas = new Float32Array(POOL_SIZE)

    // All particles start dead far away
    for (let i = 0; i < POOL_SIZE; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = -100
      positions[i * 3 + 2] = 0
      alphas[i] = 0
    }

    // Emitter configs with unique frequencies/phases
    const emitters = []
    for (let e = 0; e < EMITTER_COUNT; e++) {
      emitters.push({
        freqX: 1.5 + e * 0.7,
        freqY: 1.2 + e * 0.5,
        phaseX: e * Math.PI * 0.33,
        phaseY: e * Math.PI * 0.25,
        ampX: 0.15 + e * 0.05,
        ampY: 0.1 + e * 0.04,
      })
    }

    return { positions, colors, alphas, dotMap: createSoftDot(), emitters }
  }, [])

  // Initialize particle data
  useMemo(() => {
    particleData.current = new Float32Array(POOL_SIZE * 5) // vx, vy, vz, life, maxLife
  }, [])

  // Cursor tracking — unproject to world Z=0.5
  useEffect(() => {
    const canvas = gl.domElement
    const handlePointer = (e) => {
      const rect = canvas.getBoundingClientRect()
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5)
      vec.unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      const dist = (0.5 - camera.position.z) / dir.z
      const worldPos = camera.position.clone().add(dir.multiplyScalar(dist))
      prevCursor.current.copy(cursorWorld.current)
      cursorWorld.current.copy(worldPos)
    }
    canvas.addEventListener('pointermove', handlePointer)
    return () => canvas.removeEventListener('pointermove', handlePointer)
  }, [camera, gl])

  useFrame((_, delta) => {
    if (!pointsRef.current || !particleData.current) return
    const posArr = pointsRef.current.geometry.attributes.position.array
    const colArr = pointsRef.current.geometry.attributes.color.array
    const alphaArr = pointsRef.current.geometry.attributes.alpha.array
    const pd = particleData.current
    const dt = Math.min(delta, 0.05) // Cap delta to avoid explosions

    // Calculate cursor velocity for emission rate
    const cursorVel = cursorWorld.current.distanceTo(prevCursor.current) / Math.max(dt, 0.001)
    const emitCount = Math.min(Math.floor(cursorVel * 3), 30) // More particles at higher speeds

    const time = performance.now() * 0.001

    // Emit new particles from sinusoidal emitters around cursor
    for (let e = 0; e < EMITTER_COUNT; e++) {
      const em = emitters[e]
      const particlesPerEmitter = Math.ceil(emitCount / EMITTER_COUNT)

      for (let j = 0; j < particlesPerEmitter; j++) {
        const idx = nextSlot.current
        nextSlot.current = (nextSlot.current + 1) % POOL_SIZE
        const i3 = idx * 3
        const i5 = idx * 5

        // Sinusoidal offset per emitter
        const offsetX = Math.sin(time * em.freqX + em.phaseX) * em.ampX
        const offsetY = Math.cos(time * em.freqY + em.phaseY) * em.ampY

        posArr[i3] = cursorWorld.current.x + offsetX + (Math.random() - 0.5) * 0.1
        posArr[i3 + 1] = cursorWorld.current.y + offsetY + (Math.random() - 0.5) * 0.1
        posArr[i3 + 2] = cursorWorld.current.z

        // Random velocity with slight bias toward cursor direction
        pd[i5] = (Math.random() - 0.5) * 1.2     // vx
        pd[i5 + 1] = Math.random() * 0.8 + 0.2   // vy (upward bias)
        pd[i5 + 2] = (Math.random() - 0.5) * 0.5 // vz
        pd[i5 + 3] = 0                            // life
        pd[i5 + 4] = MAX_LIFE * (0.5 + Math.random() * 0.5) // maxLife

        // Color: mix of yellow and green
        const isYellow = Math.random() < 0.6
        colArr[i3] = isYellow ? 0.984 : 0.298
        colArr[i3 + 1] = isYellow ? 1.0 : 0.58
        colArr[i3 + 2] = isYellow ? 0.455 : 0.506

        alphaArr[idx] = 1.0
      }
    }

    // Update all particles
    for (let i = 0; i < POOL_SIZE; i++) {
      const i3 = i * 3
      const i5 = i * 5

      if (alphaArr[i] <= 0) continue

      pd[i5 + 3] += dt // life
      const lifeRatio = pd[i5 + 3] / pd[i5 + 4]

      if (lifeRatio >= 1) {
        alphaArr[i] = 0
        posArr[i3 + 1] = -100
        continue
      }

      // Apply gravity + damping
      pd[i5 + 1] += GRAVITY * dt
      pd[i5] *= DAMPING
      pd[i5 + 1] *= DAMPING
      pd[i5 + 2] *= DAMPING

      posArr[i3] += pd[i5] * dt
      posArr[i3 + 1] += pd[i5 + 1] * dt
      posArr[i3 + 2] += pd[i5 + 2] * dt

      // Fade out in last 40% of life
      alphaArr[i] = lifeRatio > 0.6 ? 1.0 - ((lifeRatio - 0.6) / 0.4) : 1.0
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.color.needsUpdate = true
    pointsRef.current.geometry.attributes.alpha.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={POOL_SIZE}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={POOL_SIZE}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-alpha"
          count={POOL_SIZE}
          array={alphas}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={dotMap}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        sizeAttenuation
        onBeforeCompile={(shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            'attribute float alpha;\nvarying float vAlpha;\nvoid main() {\nvAlpha = alpha;'
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            'varying float vAlpha;\nvoid main() {'
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <premultiplied_alpha_fragment>',
            'gl_FragColor.a *= vAlpha;\n#include <premultiplied_alpha_fragment>'
          )
        }}
      />
    </points>
  )
}

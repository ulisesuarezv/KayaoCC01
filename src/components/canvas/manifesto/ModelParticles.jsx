import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { emissionQueue } from './particleEvents'

const POOL_SIZE = 5000
const GRAVITY = -1.5
const DAMPING = 0.98
const MIN_LIFE = 1.0
const MAX_LIFE = 2.2

// Generate a bright spark texture
const createSparkTexture = () => {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,255,200,0.8)')
  gradient.addColorStop(1, 'rgba(255,255,100,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export const ModelParticles = () => {
  const pointsRef = useRef(null)
  const nextSlot = useRef(0)
  const particleData = useRef(null)

  const { positions, colors, alphas, sparkMap } = useMemo(() => {
    const positions = new Float32Array(POOL_SIZE * 3)
    const colors = new Float32Array(POOL_SIZE * 3)
    const alphas = new Float32Array(POOL_SIZE)

    for (let i = 0; i < POOL_SIZE; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = -100
      positions[i * 3 + 2] = 0
      alphas[i] = 0
    }

    return { positions, colors, alphas, sparkMap: createSparkTexture() }
  }, [])

  useMemo(() => {
    particleData.current = new Float32Array(POOL_SIZE * 5) // vx, vy, vz, life, maxLife
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current || !particleData.current) return
    const posArr = pointsRef.current.geometry.attributes.position.array
    const colArr = pointsRef.current.geometry.attributes.color.array
    const alphaArr = pointsRef.current.geometry.attributes.alpha.array
    const pd = particleData.current
    const dt = Math.min(delta, 0.05)

    // Consume collision events from queue
    while (emissionQueue.length > 0) {
      const event = emissionQueue.shift()
      const burstCount = 15 + Math.floor(Math.random() * 20) // 15-35 particles per collision

      for (let j = 0; j < burstCount; j++) {
        const idx = nextSlot.current
        nextSlot.current = (nextSlot.current + 1) % POOL_SIZE
        const i3 = idx * 3
        const i5 = idx * 5

        posArr[i3] = event.x + (Math.random() - 0.5) * 0.2
        posArr[i3 + 1] = event.y + (Math.random() - 0.5) * 0.2
        posArr[i3 + 2] = event.z + (Math.random() - 0.5) * 0.2

        // Spherical random velocity (radial from emission point)
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const speed = 1.5 + Math.random() * 3.0
        pd[i5] = Math.sin(phi) * Math.cos(theta) * speed
        pd[i5 + 1] = Math.sin(phi) * Math.sin(theta) * speed
        pd[i5 + 2] = Math.cos(phi) * speed
        pd[i5 + 3] = 0
        pd[i5 + 4] = MIN_LIFE + Math.random() * (MAX_LIFE - MIN_LIFE)

        // Color: bright yellow-white sparks
        const warmth = 0.5 + Math.random() * 0.5
        colArr[i3] = 1.0
        colArr[i3 + 1] = 0.95 * warmth + 0.05
        colArr[i3 + 2] = 0.3 * warmth

        alphaArr[idx] = 1.0
      }
    }

    // Update all particles
    for (let i = 0; i < POOL_SIZE; i++) {
      const i3 = i * 3
      const i5 = i * 5

      if (alphaArr[i] <= 0) continue

      pd[i5 + 3] += dt
      const lifeRatio = pd[i5 + 3] / pd[i5 + 4]

      if (lifeRatio >= 1) {
        alphaArr[i] = 0
        posArr[i3 + 1] = -100
        continue
      }

      // Gravity + damping
      pd[i5 + 1] += GRAVITY * dt
      pd[i5] *= DAMPING
      pd[i5 + 1] *= DAMPING
      pd[i5 + 2] *= DAMPING

      posArr[i3] += pd[i5] * dt
      posArr[i3 + 1] += pd[i5 + 1] * dt
      posArr[i3 + 2] += pd[i5 + 2] * dt

      // Fade out in last 50% of life
      alphaArr[i] = lifeRatio > 0.5 ? 1.0 - ((lifeRatio - 0.5) / 0.5) : 1.0
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
        size={0.1}
        map={sparkMap}
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

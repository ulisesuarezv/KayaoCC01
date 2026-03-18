import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 1200

// Generate a small circular texture via canvas
const createCircleTexture = () => {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export const ParticleField = () => {
  const pointsRef = useRef(null)

  const { positions, params, colors, circleMap } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    // 12 params per particle: baseX, baseY, baseZ, freqX, freqY, freqZ, phaseX, phaseY, phaseZ, ampX, ampY, ampZ
    const params = new Float32Array(PARTICLE_COUNT * 12)

    const colorYellow = new THREE.Color('#FBFF74')
    const colorGreen = new THREE.Color('#4C9481')

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const i12 = i * 12

      // Base positions — spread wide
      const bx = (Math.random() - 0.5) * 20
      const by = (Math.random() - 0.5) * 14
      const bz = (Math.random() - 0.5) * 8

      positions[i3] = bx
      positions[i3 + 1] = by
      positions[i3 + 2] = bz

      // Store base + oscillation params
      params[i12] = bx
      params[i12 + 1] = by
      params[i12 + 2] = bz
      params[i12 + 3] = 0.2 + Math.random() * 0.5  // freqX
      params[i12 + 4] = 0.15 + Math.random() * 0.4  // freqY
      params[i12 + 5] = 0.1 + Math.random() * 0.3   // freqZ
      params[i12 + 6] = Math.random() * Math.PI * 2  // phaseX
      params[i12 + 7] = Math.random() * Math.PI * 2  // phaseY
      params[i12 + 8] = Math.random() * Math.PI * 2  // phaseZ
      params[i12 + 9] = 0.3 + Math.random() * 0.8   // ampX
      params[i12 + 10] = 0.2 + Math.random() * 0.6  // ampY
      params[i12 + 11] = 0.15 + Math.random() * 0.4 // ampZ

      // 60% yellow, 40% green
      const color = Math.random() < 0.6 ? colorYellow : colorGreen
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    return { positions, params, colors, circleMap: createCircleTexture() }
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array
    const t = clock.elapsedTime

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const i12 = i * 12
      arr[i3] = params[i12] + Math.sin(t * params[i12 + 3] + params[i12 + 6]) * params[i12 + 9]
      arr[i3 + 1] = params[i12 + 1] + Math.cos(t * params[i12 + 4] + params[i12 + 7]) * params[i12 + 10]
      arr[i3 + 2] = params[i12 + 2] + Math.sin(t * params[i12 + 5] + params[i12 + 8]) * params[i12 + 11]
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        map={circleMap}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        sizeAttenuation
      />
    </points>
  )
}

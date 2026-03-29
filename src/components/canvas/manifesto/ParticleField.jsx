import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pickColor, generateRadius } from './particleUtils'

const isMobile = window.innerWidth < 1024
const CIRCLE_COUNT = isMobile ? 60 : 160
const CIRCLE_SEGMENTS = isMobile ? 16 : 32

// Scratch object used only during initialization
const _obj = new THREE.Object3D()

// Pre-generate particle data at module scope (avoids React Compiler purity rules)
const _generateParticleData = () => {
  const params = new Float32Array(CIRCLE_COUNT * 12)
  const radii = new Float32Array(CIRCLE_COUNT)

  for (let i = 0; i < CIRCLE_COUNT; i++) {
    const i12 = i * 12

    params[i12]     = (Math.random() - 0.5) * (isMobile ? 14 : 26)  // baseX
    params[i12 + 1] = (Math.random() - 0.5) * (isMobile ? 18 : 14)  // baseY (taller on portrait)
    params[i12 + 2] = (Math.random() - 0.5) * 4   // baseZ

    params[i12 + 3] = 0.2 + Math.random() * 0.5   // freqX
    params[i12 + 4] = 0.15 + Math.random() * 0.4  // freqY
    params[i12 + 5] = 0.1 + Math.random() * 0.3   // freqZ

    params[i12 + 6] = Math.random() * Math.PI * 2 // phaseX
    params[i12 + 7] = Math.random() * Math.PI * 2 // phaseY
    params[i12 + 8] = Math.random() * Math.PI * 2 // phaseZ

    params[i12 + 9]  = 0.3 + Math.random() * 0.8  // ampX
    params[i12 + 10] = 0.2 + Math.random() * 0.6  // ampY
    params[i12 + 11] = 0.1 + Math.random() * 0.3  // ampZ

    radii[i] = generateRadius(0.03, 1.2)
  }

  return { params, radii }
}

const particleData = _generateParticleData()

export const ParticleField = ({ isActiveRef }) => {
  const meshRef = useRef(null)
  const { params, radii } = particleData

  // Set initial matrices (with scale baked in) and colors
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < CIRCLE_COUNT; i++) {
      const i12 = i * 12
      const r = radii[i]

      _obj.position.set(params[i12], params[i12 + 1], params[i12 + 2])
      _obj.scale.setScalar(r)
      _obj.updateMatrix()
      mesh.setMatrixAt(i, _obj.matrix)
      mesh.setColorAt(i, pickColor())
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor.needsUpdate = true
  }, [params, radii])

  // Oscillation animation — writes directly to instance matrix buffer
  // Only updates position columns (indices 12,13,14 per 4x4 matrix)
  // Scale is baked in during init and never changes, so we skip updateMatrix()
  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh || !isActiveRef?.current) return

    const t = clock.elapsedTime
    const buf = mesh.instanceMatrix.array

    for (let i = 0; i < CIRCLE_COUNT; i++) {
      const i12 = i * 12
      const i16 = i * 16

      // Compute oscillated position
      const x = params[i12]     + Math.sin(t * params[i12 + 3] + params[i12 + 6]) * params[i12 + 9]
      const y = params[i12 + 1] + Math.cos(t * params[i12 + 4] + params[i12 + 7]) * params[i12 + 10]
      const z = params[i12 + 2] + Math.sin(t * params[i12 + 5] + params[i12 + 8]) * params[i12 + 11]

      // Write directly to translation column of the 4x4 column-major matrix
      buf[i16 + 12] = x
      buf[i16 + 13] = y
      buf[i16 + 14] = z
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CIRCLE_COUNT]} frustumCulled={false} renderOrder={-1}>
      <circleGeometry args={[1, CIRCLE_SEGMENTS]} />
      <meshBasicMaterial toneMapped={false} depthWrite={false} />
    </instancedMesh>
  )
}

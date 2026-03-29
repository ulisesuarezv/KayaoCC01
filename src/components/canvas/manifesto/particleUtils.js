import * as THREE from 'three'

export const COLORS = [
  { color: new THREE.Color('#4C9481'), weight: 0.40 },
  { color: new THREE.Color('#FBFF74'), weight: 0.35 },
  { color: new THREE.Color('#FFFFFF'), weight: 0.25 },
]

// Weighted random color pick
export const pickColor = () => {
  const r = Math.random()
  let cumulative = 0
  for (const { color, weight } of COLORS) {
    cumulative += weight
    if (r <= cumulative) return color
  }
  return COLORS[0].color
}

// Power-law distribution: many small, few large
export const generateRadius = (min, max, exponent = 2.5) =>
  min * Math.pow(max / min, Math.pow(Math.random(), exponent))

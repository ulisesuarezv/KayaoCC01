import { useRef, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export const useMagnetic = ({
  strength = 30,
  duration = 0.4,
  ease = 'power3.out',
} = {}) => {
  const ref = useRef(null)
  const quickX = useRef(null)
  const quickY = useRef(null)

  useGSAP(() => {
    if (!ref.current) return
    quickX.current = gsap.quickTo(ref.current, 'x', { duration, ease })
    quickY.current = gsap.quickTo(ref.current, 'y', { duration, ease })
  })

  const onMouseMove = useCallback((e) => {
    if (!ref.current || !quickX.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    quickX.current(dx * strength)
    quickY.current(dy * strength)
  }, [strength])

  const onMouseLeave = useCallback(() => {
    quickX.current?.(0)
    quickY.current?.(0)
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}

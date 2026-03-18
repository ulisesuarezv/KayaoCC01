import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'

export const useLenis = () => {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    })

    lenisRef.current = lenis

    gsap.ticker.lagSmoothing(0)

    const update = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}

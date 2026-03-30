import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '../stores/useAppStore'

export const useLenis = () => {
  const lenisRef = useRef(null)
  const isPreloaderDone = useAppStore((s) => s.isPreloaderDone)

  useEffect(() => {
    if (!isPreloaderDone) return

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

    // Recalculate all ScrollTrigger positions after Lenis is ready
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [isPreloaderDone])

  return lenisRef
}

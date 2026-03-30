import { useRef, useState, useEffect, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useProgress } from '@react-three/drei'
import { useAppStore } from '../../stores/useAppStore'

// SVG circle constants
const CIRCLE_RADIUS = 28
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
const MIN_DISPLAY_MS = 3500

export const Preloader = () => {
  const containerRef = useRef(null)
  const centerRef = useRef(null)
  const studioRef = useRef(null)

  const betaRef = useRef(null)
  const webRef = useRef(null)
  const circleRef = useRef(null)
  const circleBgRef = useRef(null)
  const circleWrapRef = useRef(null)
  const hasExited = useRef(false)
  const mountTime = useRef(Date.now())

  const [fontLoaded, setFontLoaded] = useState(false)

  const { progress, active } = useProgress()

  // ── Lock scroll completely ─────────────────────────────────────────────────
  useEffect(() => {
    const shell = document.getElementById('preloader-shell')
    if (shell) shell.remove()

    // Lock both html and body to prevent any scroll
    const html = document.documentElement
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Block wheel + touch scroll on the preloader overlay
    const prevent = (e) => e.preventDefault()
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', prevent, { passive: false })
      container.addEventListener('touchmove', prevent, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', prevent)
        container.removeEventListener('touchmove', prevent)
      }
    }
  }, [])

  // ── Font readiness ─────────────────────────────────────────────────────────
  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true))
  }, [])

  // ── Enter animation + stacked reveals + circle fill ─────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 1. "kayao studio" fades up into view
    tl.fromTo(
      studioRef.current,
      { opacity: 0, yPercent: 40 },
      { opacity: 1, yPercent: 0, duration: 0.9 },
      0.2
    )

    // 5. Bottom-left info fades in
    tl.fromTo(
      [betaRef.current, webRef.current],
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
      0.5
    )

    // 6. Circle progress appears
    tl.fromTo(
      circleWrapRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5 },
      0.7
    )

    // 7. Circle fills over the preloader duration
    tl.to(
      circleRef.current,
      {
        strokeDashoffset: 0,
        duration: MIN_DISPLAY_MS / 1000,
        ease: 'power1.inOut',
      },
      0.8
    )
  }, { scope: containerRef })

  // ── Exit sequence ──────────────────────────────────────────────────────────
  const triggerExit = useCallback(() => {
    if (hasExited.current) return
    hasExited.current = true

    // Ensure circle is fully filled before exit
    if (circleRef.current) {
      gsap.set(circleRef.current, { strokeDashoffset: 0 })
    }

    const tl = gsap.timeline()

    // 1. Fade all elements out
    tl.to(
      [centerRef.current, betaRef.current, webRef.current, circleWrapRef.current],
      { opacity: 0, y: -15, stagger: 0.04, duration: 0.3, ease: 'power2.in' }
    )

    // 2. Clip-path wipe upward
    tl.to(
      containerRef.current,
      { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power3.inOut' },
      '-=0.05'
    )

    // 3. Signal completion + unlock scroll
    tl.call(() => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      useAppStore.getState().setPreloaderDone()
    })
  }, [])

  // ── Readiness gate ─────────────────────────────────────────────────────────
  useEffect(() => {
    const modelDone = progress >= 100 && !active

    if (!fontLoaded || !modelDone) return

    const elapsed = Date.now() - mountTime.current
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)

    const timer = setTimeout(triggerExit, remaining)
    return () => clearTimeout(timer)
  }, [fontLoaded, progress, active, triggerExit])

  // ── Fallback: 7-second hard timeout ────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(triggerExit, 7000)
    return () => clearTimeout(timer)
  }, [triggerExit])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-dark touch-none"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      {/* ── Center stack: kayao studio + Turn it now + phone animation ── */}
      <div
        ref={centerRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
      >
        <h1
          ref={studioRef}
          className="font-sleigh font-900 text-lime leading-[0.9] select-none text-[clamp(2.5rem,8vw,8rem)] opacity-0"
        >
          kayao studio
        </h1>
      </div>

      {/* ── Bottom-left info ── */}
      <div className="absolute bottom-[4vw] left-[3vw] flex flex-col gap-1">
        <p
          ref={betaRef}
          className="font-sleigh font-300 text-lime/80 text-[clamp(0.875rem,1.5vw,1.5rem)] leading-snug opacity-0"
        >
          Esta experiencia se encuentra en desarrollo.
        </p>
        <p
          ref={webRef}
          className="font-sleigh font-300 text-white text-[clamp(0.65rem,1vw,1rem)] leading-snug opacity-0"
        >
          Beta v0.8
        </p>
      </div>

      {/* ── Circle progress — bottom-right ── */}
      <div
        ref={circleWrapRef}
        className="absolute bottom-[4vw] right-[3vw] opacity-0"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="rotate-[-90deg]"
        >
          {/* Background circle track */}
          <circle
            ref={circleBgRef}
            cx="32"
            cy="32"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.15"
            strokeWidth="4"
          />
          {/* Progress fill circle */}
          <circle
            ref={circleRef}
            cx="32"
            cy="32"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE}
          />
        </svg>
      </div>
    </div>
  )
}

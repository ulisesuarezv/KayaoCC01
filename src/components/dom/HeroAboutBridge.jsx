import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Cycle: primary → secondary → tertiary
const COLORS = ['#4C9481', '#000000', '#FBFF74']
const RECT_COUNT = 15
const colorSequence = Array.from({ length: RECT_COUNT }, (_, i) => COLORS[i % 3])

// Pre-compute target scales — largest first, each one slightly smaller
const targetScales = Array.from({ length: RECT_COUNT }, (_, i) =>
  Math.max(0.97 - i * 0.045, 0.2)
)

export const HeroAboutBridge = () => {
  const containerRef = useRef(null)
  const rectRefs = useRef([])

  useGSAP(() => {
    const container = containerRef.current
    const rects = rectRefs.current.filter(Boolean)

    // Find the Hero and About pinned ScrollTrigger instances
    const allSTs = ScrollTrigger.getAll()
    const heroST = allSTs.find((st) => st.trigger?.dataset?.section === 'hero' && st.pin)
    const aboutST = allSTs.find((st) => st.trigger?.dataset?.section === 'about' && st.pin)

    if (!heroST || !aboutST) return

    gsap.set(rects, { scale: 0 })

    const parseEase = gsap.parseEase('power2.out')
    let wasVisible = false

    const update = () => {
      const aboutP = aboutST.progress

      // Hide instantly when About starts — never cover About content
      if (aboutP > 0) {
        if (wasVisible) {
          container.style.opacity = '0'
          container.style.visibility = 'hidden'
          wasVisible = false
        }
        return
      }

      // Bridge scroll range: from Hero progress 0.75 to About start
      const bridgeStart = heroST.start + (heroST.end - heroST.start) * 0.75
      const bridgeEnd = aboutST.start
      const scrollY = ScrollTrigger.getById(heroST.vars.id)
        ? window.scrollY
        : window.scrollY
      const currentScroll = window.scrollY

      if (currentScroll < bridgeStart) {
        if (wasVisible) {
          container.style.opacity = '0'
          container.style.visibility = 'hidden'
          wasVisible = false
        }
        return
      }

      // Show bridge
      container.style.opacity = '1'
      container.style.visibility = 'visible'
      wasVisible = true

      // Compute bridge progress (0 → 1) across the full gap
      const totalRange = bridgeEnd - bridgeStart
      const bridgeP = Math.min(Math.max((currentScroll - bridgeStart) / totalRange, 0), 1)

      // Each rect is staggered across bridgeP, each takes ~30% of the range to scale up
      const stagger = 1 / RECT_COUNT
      const animDuration = 0.3 // each rect animates over 30% of bridgeP

      for (let i = 0; i < rects.length; i++) {
        const rectStart = i * stagger
        const rectEnd = rectStart + animDuration

        let s = 0
        if (bridgeP >= rectEnd) {
          s = targetScales[i]
        } else if (bridgeP > rectStart) {
          const raw = (bridgeP - rectStart) / animDuration
          s = parseEase(raw) * targetScales[i]
        }
        gsap.set(rects[i], { scale: s })
      }
    }

    gsap.ticker.add(update)

    return () => {
      gsap.ticker.remove(update)
    }
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 15, opacity: 0, visibility: 'hidden' }}
    >
      {Array.from({ length: RECT_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => (rectRefs.current[i] = el)}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundColor: colorSequence[i],
            transformOrigin: '100% 100%',
          }}
        />
      ))}
    </div>
  )
}

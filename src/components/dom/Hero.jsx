import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionWrapper } from '../layout/SectionWrapper'
import { Scene } from '../canvas/Scene'
import { useAppStore } from '../../stores/useAppStore'

export const Hero = () => {
  const sectionRef = useRef(null)
  const limeZoneRef = useRef(null)
  const creativeRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const sceneRef = useRef(null)
  const introRef = useRef(null)

  const isPreloaderDone = useAppStore((s) => s.isPreloaderDone)

  useGSAP(() => {
    // === ENTRANCE (paused — played when preloader completes) ===
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true })
    intro
      .fromTo(creativeRef.current,
        { yPercent: 30, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1 },
        0.3
      )
      .fromTo(titleRef.current,
        { xPercent: 15, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 1 },
        0.5
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.8
      )
    introRef.current = intro

    // === ZOOM TRANSITION to About (pinned, scrub-driven) ===
    const zoom = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=220vh',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          useAppStore.getState().setSectionProgress('hero', self.progress)
        },
      },
    })

    // Phase 1 (0 → 0.45): Fade out 3D + texts BEFORE zoom
    zoom.fromTo(sceneRef.current,
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in', duration: 0.42 },
      0
    )
    zoom.fromTo(titleRef.current,
      { opacity: 1, xPercent: 0 },
      { opacity: 0, xPercent: -15, ease: 'power2.in', duration: 0.4 },
      0.02
    )
    zoom.fromTo(subtitleRef.current,
      { opacity: 1, y: 0 },
      { opacity: 0, y: -10, ease: 'power2.in', duration: 0.38 },
      0
    )
    zoom.fromTo(creativeRef.current,
      { opacity: 1, yPercent: 0 },
      { opacity: 0, yPercent: 15, ease: 'power2.in', duration: 0.4 },
      0.03
    )

    // Phase 2: Lime zone scales to fill viewport (starts with fade-outs)
    zoom.fromTo(limeZoneRef.current,
      { scale: 1 },
      { scale: 2.2, ease: 'power2.inOut', duration: 0.7 },
      0.05
    )
    // Minimal hold at full zoom ~0.75 → 1.0

    // Release compositor layers for faded-out elements
    zoom.set([sceneRef.current, titleRef.current, subtitleRef.current, creativeRef.current], {
      willChange: 'auto',
    }, 0.5)
  }, { scope: sectionRef })

  // Play entrance animation after preloader exits
  useEffect(() => {
    if (isPreloaderDone && introRef.current) {
      introRef.current.play()
    }
  }, [isPreloaderDone])

  return (
    <SectionWrapper id="hero" className="relative flex flex-col" ref={sectionRef}>
      {/* Upper zone -- lime, ~55% — scales to fill viewport on scroll */}
      <div
        ref={limeZoneRef}
        className="relative bg-lime flex-[0_0_55%] overflow-hidden z-10 will-change-transform"
        style={{ transformOrigin: 'top center' }}
      >
        <div ref={sceneRef} className="absolute inset-0 pointer-events-none will-change-transform">
          <Scene />
        </div>
      </div>

      {/* Lower zone -- dark, ~45% — covered by lime zoom */}
      <div className="relative bg-dark flex-[0_0_45%] overflow-hidden z-0">
        {/* "creative" massive text -- fills width, cut by bottom edge */}
        <p
          ref={creativeRef}
          className="absolute bottom-[-0.35em] max-lg:bottom-[-0.1em] left-0 w-full font-sleigh font-900 text-lime leading-[0.85] text-[clamp(16rem,32vw,35rem)] max-lg:text-[clamp(3.5rem,16vw,10rem)] select-none whitespace-nowrap text-center will-change-transform"
        >
          creative
        </p>
      </div>

      {/* "kayao studio" — sits on lime, subtitle at the boundary */}
      <div className="absolute bottom-[45%] right-[-2%] max-lg:right-[4%] max-lg:left-[3%] text-right z-20 translate-y-[30%]">
        <h1
          ref={titleRef}
          className="font-sleigh font-900 text-dark leading-[0.85] text-[clamp(1.4rem,8vw,9rem)] will-change-transform"
        >
          kayao studio
        </h1>
        <p
          ref={subtitleRef}
          className="font-sleigh font-200 text-lime text-[clamp(0.45rem,1vw,1rem)] mt-3 tracking-[0.1em] uppercase"
        >
          development | UX&UI | webGL | design | web&amp;app
        </p>
      </div>
    </SectionWrapper>
  )
}

import { useRef, useState, useCallback, lazy, Suspense } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Lazy load ManifestoScene — defers Three.js, Rapier WASM, and particle code
const ManifestoScene = lazy(() => import('../canvas/ManifestoScene'))

export const Manifesto = () => {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const kayaoRef = useRef(null)
  const creativeRef = useRef(null)
  const titleRef = useRef(null)
  const bigTextRef = useRef(null)
  // Ref for particle gating (read in useFrame — no re-renders)
  const isActiveRef = useRef(false)
  // State only for Physics paused prop (toggles on boundary crossing only)
  const [physicsActive, setPhysicsActive] = useState(false)
  const activateSection = useCallback((active) => {
    isActiveRef.current = active
    setPhysicsActive(active)
  }, [])

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        scrub: 0.4,
        // onUpdate only writes to ref — no setState, no re-render
        onUpdate: (self) => {
          if (self.progress > 0.02) {
            isActiveRef.current = true
          }
        },
        // Boundary events toggle both ref + state (fires once per crossing)
        onLeave: () => activateSection(false),
        onLeaveBack: () => activateSection(false),
        onEnter: () => activateSection(true),
        onEnterBack: () => activateSection(true),
      },
    })

    // Phase 1: Fade out "kayao" and "creative development."
    tl.to(kayaoRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.4,
    }, 0.2)

    tl.to(creativeRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.4,
    }, 0.2)

    // Phase 2: Reveal "nuestro manifesto" title block
    tl.fromTo(titleRef.current, {
      opacity: 0,
      y: -30,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
    }, 0.5)

    // Phase 3: Reveal big centered text
    tl.fromTo(bigTextRef.current, {
      opacity: 0,
      scale: 0.92,
    }, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
    }, 0.6)
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      data-section="manifesto"
      className="relative h-[350vh] w-screen"
    >
      {/* Pinned viewport */}
      <div ref={pinRef} className="h-screen w-screen overflow-hidden bg-dark relative">

        {/* 3D Canvas — physics logos + particles */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <ManifestoScene isActiveRef={isActiveRef} physicsActive={physicsActive} />
          </Suspense>
        </div>

        {/* "kayao" left side -- horizontal orientation */}
        <p
          ref={kayaoRef}
          className="absolute top-[35%] left-[3%] max-lg:left-[5%] font-sleigh font-200 text-white text-[clamp(1.5rem,6vw,6rem)] leading-none z-10 pointer-events-none"
        >
          kayao
        </p>

        {/* "creative development." bottom right */}
        <p
          ref={creativeRef}
          className="absolute bottom-[8%] right-[5%] font-sleigh font-300 text-white/80 text-[clamp(0.875rem,1.5vw,1.5rem)] text-right leading-snug z-10 pointer-events-none"
        >
          creative
          <br />
          development.
        </p>

        {/* "nuestro manifesto" -- hidden initially, revealed on scroll */}
        <div ref={titleRef} className="absolute top-[8%] right-[5%] max-lg:right-[4%] max-w-[420px] max-lg:max-w-[80vw] max-lg:landscape:max-w-[45vw] max-lg:landscape:top-[5%] opacity-0 z-10 pointer-events-none">
          <h2 className="font-sleigh font-900 text-white text-[clamp(2rem,4vw,4rem)] max-lg:text-[clamp(2.5rem,8vw,3.5rem)] max-lg:landscape:text-[clamp(1.4rem,4vh,2.2rem)] leading-[0.9] mb-6 max-lg:mb-4 max-lg:landscape:mb-2">
            nuestro
            <br />
            manifesto
          </h2>
          <p className="font-sleigh font-200 text-lime text-[clamp(0.75rem,1vw,1rem)] max-lg:text-[clamp(0.7rem,2.5vw,0.95rem)] max-lg:landscape:text-[clamp(0.6rem,1.5vh,0.8rem)] leading-relaxed max-lg:mb-6 max-lg:landscape:mb-2">
            Kayao desarrolla web&apps inmersivas mediante experiencias
            personalizadas que explotan tu marca.
          </p>
        </div>

        {/* Big centered statement -- hidden initially */}
        <p
          ref={bigTextRef}
          className="absolute top-[28%] left-[8%] right-[8%] max-lg:top-[38%] max-lg:left-[4%] max-lg:right-[4%] max-lg:landscape:top-[30%] max-lg:landscape:left-[5%] max-lg:landscape:right-[5%] font-sleigh font-900 text-white text-[clamp(1.2rem,4.5vw,4.5rem)] max-lg:text-[clamp(1.4rem,5.5vw,2.8rem)] max-lg:landscape:text-[clamp(0.9rem,3.5vh,1.5rem)] leading-[1.15] text-center opacity-0 z-10 pointer-events-none"
        >
          Diseño, interacción y tecnología que convierten. Creamos experiencias
          digitales elegantes y fluidas que transmiten calidad, conectan con tu
          audiencia y generan resultados reales.
        </p>
      </div>
    </section>
  )
}

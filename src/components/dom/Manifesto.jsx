import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ManifestoScene } from '../canvas/ManifestoScene'

gsap.registerPlugin(ScrollTrigger)

export const Manifesto = () => {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const kayaoRef = useRef(null)
  const creativeRef = useRef(null)
  const titleRef = useRef(null)
  const bigTextRef = useRef(null)
  const [isPhysicsActive, setIsPhysicsActive] = useState(false)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        scrub: 1,
        onUpdate: (self) => {
          // Activate physics when section enters viewport
          if (self.progress > 0.02) {
            setIsPhysicsActive(true)
          }
        },
        onLeave: () => setIsPhysicsActive(false),
        onLeaveBack: () => setIsPhysicsActive(false),
        onEnter: () => setIsPhysicsActive(true),
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
          <ManifestoScene isActive={isPhysicsActive} />
        </div>

        {/* "kayao" left side -- horizontal orientation */}
        <p
          ref={kayaoRef}
          className="absolute top-[35%] left-[3%] font-sleigh font-200 text-white text-[clamp(3rem,6vw,6rem)] leading-none z-10 pointer-events-none"
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
        <div ref={titleRef} className="absolute top-[8%] right-[5%] max-w-[420px] opacity-0 z-10 pointer-events-none">
          <h2 className="font-sleigh font-900 text-white text-[clamp(2rem,4vw,4rem)] leading-[0.9] mb-6">
            nuestro
            <br />
            manifesto
          </h2>
          <p className="font-sleigh font-200 text-white/60 text-[clamp(0.75rem,1vw,1rem)] leading-relaxed">
            Kayao desarrolla web&apps inmersivas mediante experiencias
            personalizadas que explotan tu marca.
          </p>
        </div>

        {/* Big centered statement -- hidden initially */}
        <p
          ref={bigTextRef}
          className="absolute top-[28%] left-[8%] right-[8%] font-sleigh font-900 text-white text-[clamp(2rem,4.5vw,4.5rem)] leading-[1.15] text-center opacity-0 z-10 pointer-events-none"
        >
          Diseño, interacción y tecnología que convierten. Creamos experiencias
          digitales elegantes y fluidas que transmiten calidad, conectan con tu
          audiencia y generan resultados reales.
        </p>
      </div>
    </section>
  )
}

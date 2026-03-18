import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionWrapper } from '../layout/SectionWrapper'
import { Scene } from '../canvas/Scene'
import { useAppStore } from '../../stores/useAppStore'

gsap.registerPlugin(ScrollTrigger)

export const Hero = () => {
  const sectionRef = useRef(null)
  const creativeRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const sceneRef = useRef(null)

  useGSAP(() => {
    // === ENTRANCE (one-shot on load) ===
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
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

    // === EXIT (scrub-driven on scroll) ===
    const exit = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        onUpdate: (self) => {
          useAppStore.getState().setSectionProgress('hero', self.progress)
        },
      },
    })

    exit
      .to(creativeRef.current, {
        yPercent: 50,
        scale: 1.15,
        opacity: 0,
        ease: 'power2.in',
      }, 0)
      .to(titleRef.current, {
        xPercent: -30,
        opacity: 0,
        ease: 'power2.in',
      }, 0.1)
      .to(subtitleRef.current, {
        y: -20,
        opacity: 0,
        ease: 'power2.in',
      }, 0)
      .to(sceneRef.current, {
        scale: 0.85,
        opacity: 0,
        ease: 'power1.in',
      }, 0)
  }, { scope: sectionRef })

  return (
    <SectionWrapper id="hero" className="relative flex flex-col" ref={sectionRef}>
      {/* Upper zone -- lime, ~55% — 3D model embedded here */}
      <div className="relative bg-lime flex-[0_0_55%] overflow-hidden">
        <div ref={sceneRef} className="absolute inset-0 pointer-events-none will-change-transform">
          <Scene />
        </div>
      </div>

      {/* Lower zone -- dark, ~45% */}
      <div className="relative bg-dark flex-[0_0_45%] overflow-hidden">
        {/* "creative" massive text -- fills width, cut by bottom edge */}
        <p
          ref={creativeRef}
          className="absolute bottom-[-0.35em] left-0 w-full font-sleigh font-900 text-lime leading-[0.85] text-[clamp(16rem,32vw,35rem)] select-none whitespace-nowrap text-center will-change-transform"
        >
          creative
        </p>
      </div>

      {/* "kayao studio" — sits on lime, subtitle at the boundary */}
      <div className="absolute bottom-[45%] right-[-2%] text-right z-10 translate-y-[30%]">
        <h1
          ref={titleRef}
          className="font-sleigh font-900 text-dark leading-[0.85] text-[clamp(3.5rem,8vw,9rem)] whitespace-nowrap will-change-transform"
        >
          kayao studio
        </h1>
        <p
          ref={subtitleRef}
          className="font-sleigh font-200 text-lime text-[clamp(0.65rem,1vw,1rem)] mt-3 tracking-[0.15em] uppercase"
        >
          development | UX&UI | webGL | design | web&amp;app
        </p>
      </div>
    </SectionWrapper>
  )
}

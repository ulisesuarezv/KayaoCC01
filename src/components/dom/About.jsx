import { useRef, useState, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionWrapper } from '../layout/SectionWrapper'
import { useMagnetic } from '../../hooks/useMagnetic'
import { useAppStore } from '../../stores/useAppStore'

gsap.registerPlugin(ScrollTrigger)

const services = [
  { num: 1, label: 'webGL', statement: 'Entornos 3D para brindarte la mejor experiencia' },
  { num: 2, label: 'Full Stack', statement: 'Desarrollamos soluciones integrales y escalables' },
  { num: 3, label: 'UX/UI', statement: 'Experiencias que cautiven a tus clientes' },
  { num: 4, label: 'SEO', statement: 'Mejoramos tu presencia en linea, y aumentamos el trafico' },
]

export const About = () => {
  const sectionRef = useRef(null)
  const circleRef = useRef(null)
  const circleInnerRef = useRef(null)
  const circleNumRef = useRef(null)
  const circleLabelRef = useRef(null)
  const titleRef = useRef(null)
  const statementRef = useRef(null)
  const servicesRef = useRef(null)
  const studioNuestroRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const magnetic = useMagnetic({ strength: 40, duration: 0.5 })

  // Animate service change
  const handleServiceChange = useCallback((newIndex) => {
    if (newIndex === activeIndex) return
    const tl = gsap.timeline()
    tl.to([circleNumRef.current, circleLabelRef.current], {
      opacity: 0, y: -10, duration: 0.2, ease: 'power2.in',
    })
    tl.call(() => setActiveIndex(newIndex))
    tl.fromTo([circleNumRef.current, circleLabelRef.current],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 },
    )
    tl.fromTo(statementRef.current,
      { opacity: 0.3, y: 5 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      '<0.1'
    )
  }, [activeIndex])

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        end: 'bottom 20%',
        scrub: 0.6,
        onUpdate: (self) => {
          useAppStore.getState().setSectionProgress('about', self.progress)
        },
      },
    })

    // --- ENTRANCE (progress 0 → 0.5) ---
    tl.fromTo(circleRef.current,
      { scale: 0, opacity: 0, rotate: -15 },
      { scale: 1, opacity: 1, rotate: 0, ease: 'back.out(1.4)', duration: 0.25 },
      0
    )
    tl.fromTo(titleRef.current,
      { xPercent: 25, opacity: 0 },
      { xPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.2 },
      0.05
    )
    tl.fromTo(statementRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power3.out', duration: 0.2 },
      0.12
    )
    tl.fromTo(servicesRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.03, ease: 'power2.out', duration: 0.15 },
      0.18
    )
    // "STUDIO NUESTRO" parallax
    tl.fromTo(studioNuestroRef.current,
      { xPercent: -5 },
      { xPercent: 5, ease: 'none', duration: 1 },
      0
    )

    // --- EXIT (progress 0.5 → 1) ---
    tl.to(servicesRef.current.children, {
      y: -30, opacity: 0, stagger: 0.02, ease: 'power2.in', duration: 0.12,
    }, 0.55)
    tl.to(statementRef.current, {
      y: -50, opacity: 0, ease: 'power2.in', duration: 0.18,
    }, 0.6)
    tl.to(titleRef.current, {
      xPercent: -20, opacity: 0, ease: 'power2.in', duration: 0.18,
    }, 0.65)
    tl.to(circleRef.current, {
      scale: 0.6, opacity: 0, y: -80, ease: 'power3.in', duration: 0.25,
    }, 0.7)
  }, { scope: sectionRef })

  return (
    <SectionWrapper id="about" className="bg-lime" ref={sectionRef}>
      {/* "STUDIO NUESTRO" cut by top edge — parallax horizontal */}
      <p
        ref={studioNuestroRef}
        className="absolute top-[-0.15em] left-[-3%] font-sleigh font-900 text-dark text-[clamp(8rem,14vw,18rem)] leading-none select-none whitespace-nowrap pointer-events-none will-change-transform"
      >
        STUDIO NUESTRO
      </p>

      {/* Teal circle — magnetic hover wrapper */}
      <div
        ref={magnetic.ref}
        onMouseMove={magnetic.onMouseMove}
        onMouseLeave={(e) => {
          magnetic.onMouseLeave(e)
          gsap.to(circleInnerRef.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' })
        }}
        onMouseEnter={() => {
          gsap.to(circleInnerRef.current, { scale: 1.08, duration: 0.3, ease: 'power2.out' })
        }}
        className="absolute left-[5%] top-[15%] will-change-transform"
      >
        <div
          ref={(el) => {
            circleRef.current = el
            circleInnerRef.current = el
          }}
          className="w-[clamp(180px,25vw,320px)] aspect-square rounded-full bg-teal flex flex-col items-center justify-center will-change-transform cursor-pointer"
        >
          <span
            ref={circleNumRef}
            className="font-sleigh font-900 text-dark text-[clamp(2.5rem,5vw,5.5rem)] leading-none"
          >
            {services[activeIndex].num}
          </span>
          <span
            ref={circleLabelRef}
            className="font-sleigh font-300 text-dark/80 text-[clamp(0.65rem,1vw,0.9rem)] tracking-[0.2em] uppercase mt-1"
          >
            {services[activeIndex].label}
          </span>
        </div>
      </div>

      {/* Giant statement */}
      <p
        ref={statementRef}
        className="absolute left-[5%] right-[3%] top-[48%] font-sleigh font-900 text-dark text-[clamp(3rem,5.5vw,5.5rem)] leading-[1.05] text-right will-change-transform"
      >
        {services[activeIndex].statement}
      </p>

      {/* Right block -- studio title + tagline */}
      <div ref={titleRef} className="absolute right-[6%] top-[22%] w-[48%] flex flex-col will-change-transform">
        <div className="text-right">
          <h2 className="font-sleigh text-dark text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.9]">
            <span className="font-200">Kayao</span>
            <br />
            <span className="font-900">STUDIO</span>
          </h2>
          <p className="font-sleigh font-300 text-teal text-[clamp(0.8rem,1.1vw,1.1rem)] mt-3 leading-relaxed">
            Transformamos la estética en estrategia.
          </p>
        </div>
      </div>

      {/* Services list — ALL services, active highlighted */}
      <div ref={servicesRef} className="absolute right-[3%] top-[70%] w-[55%]">
        {services.map((s, i) => (
          <div
            key={s.num}
            onMouseEnter={() => handleServiceChange(i)}
            className={`cursor-pointer transition-opacity duration-200 ${i === activeIndex ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <div className="w-full h-px bg-dark/20" />
            <div className="flex items-baseline justify-end gap-4 py-3">
              <span className="font-sleigh font-300 text-dark/60 text-[clamp(0.7rem,1vw,0.9rem)] tracking-[0.2em] uppercase">
                {s.label}
              </span>
              <span className="font-sleigh font-900 text-dark text-[clamp(1.2rem,2vw,2rem)]">
                {s.num}
              </span>
            </div>
            {i === services.length - 1 && <div className="w-full h-px bg-dark/20" />}
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}

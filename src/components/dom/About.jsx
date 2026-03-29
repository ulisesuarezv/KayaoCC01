import { useRef, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionWrapper } from '../layout/SectionWrapper'
import { useMagnetic } from '../../hooks/useMagnetic'
import { useAppStore } from '../../stores/useAppStore'

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
  const { ref: magneticRef, onMouseMove: magneticMove, onMouseLeave: magneticLeave } = useMagnetic({ strength: 40, duration: 0.5 })
  const activeIndexRef = useRef(0)
  const serviceItemRefs = useRef([])

  // Swap content directly in the DOM — zero React re-renders
  const handleServiceChange = useCallback((newIndex) => {
    if (newIndex === activeIndexRef.current) return

    const prev = activeIndexRef.current
    activeIndexRef.current = newIndex
    const service = services[newIndex]

    // Update highlight classes directly
    const prevItem = serviceItemRefs.current[prev]
    const nextItem = serviceItemRefs.current[newIndex]
    if (prevItem) prevItem.style.opacity = '0.4'
    if (nextItem) nextItem.style.opacity = '1'

    // Animate out circle content + swap text + animate in
    gsap.to([circleNumRef.current, circleLabelRef.current], {
      opacity: 0, y: -8, duration: 0.12, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        circleNumRef.current.textContent = service.num
        circleLabelRef.current.textContent = service.label
        gsap.fromTo([circleNumRef.current, circleLabelRef.current],
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out', stagger: 0.04, overwrite: true },
        )
      },
    })

    // Statement — crossfade
    gsap.to(statementRef.current, {
      opacity: 0.3, y: 4, duration: 0.1, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        statementRef.current.textContent = service.statement
        gsap.to(statementRef.current, {
          opacity: 1, y: 0, duration: 0.18, ease: 'power2.out', overwrite: true,
        })
      },
    })
  }, [])

  useGSAP(() => {
    // ALL elements hidden — directional reveals matching Hero style
    gsap.set(studioNuestroRef.current, { opacity: 0, yPercent: -20 })
    gsap.set(magneticRef.current, { opacity: 0, yPercent: 25 })
    gsap.set(circleRef.current, { opacity: 0, yPercent: 25 })
    gsap.set(titleRef.current, { opacity: 0, xPercent: 15 })
    gsap.set(statementRef.current, { opacity: 0, y: 30 })
    gsap.set(servicesRef.current.children, { opacity: 0, y: 20 })

    // Pinned timeline — section stays fixed, no Y scroll visible
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=450vh',
        pin: true,
        scrub: 0.4,
        onUpdate: (self) => {
          useAppStore.getState().setSectionProgress('about', self.progress)
        },
      },
    })

    // --- ENTRANCE — staggered reveals, all visible by ~0.48 ---
    // 1) "STUDIO NUESTRO" background text (ambient, enters early)
    tl.to(studioNuestroRef.current,
      { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.28 },
      0
    )
    // 2) Kayao Studio title block — first content element
    tl.to(titleRef.current,
      { xPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.28 },
      0.03
    )
    // 3) Teal circle
    tl.to(magneticRef.current,
      { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.26 },
      0.12
    )
    tl.to(circleRef.current,
      { yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.26 },
      0.12
    )
    // 4) Services list 1-2-3-4
    tl.to(servicesRef.current.children,
      { y: 0, opacity: 1, stagger: 0.03, ease: 'power3.out', duration: 0.22 },
      0.22
    )
    // 5) Statement — last to arrive
    tl.to(statementRef.current,
      { y: 0, opacity: 1, ease: 'power3.out', duration: 0.25 },
      0.32
    )

    // "STUDIO NUESTRO" parallax (runs through hold period)
    tl.fromTo(studioNuestroRef.current,
      { xPercent: -5 },
      { xPercent: 5, ease: 'none', duration: 0.65 },
      0.35
    )

    // --- EXIT (0.86 → 1) — all elements leave together ---
    tl.to([titleRef.current, statementRef.current, servicesRef.current, circleRef.current, magneticRef.current, studioNuestroRef.current], {
      opacity: 0, y: -40, ease: 'power2.in', duration: 0.14,
    }, 0.86)
  }, { scope: sectionRef })

  return (
    <SectionWrapper id="about" className="bg-lime" ref={sectionRef}>
      {/* "STUDIO NUESTRO" cut by top edge — parallax horizontal */}
      <p
        ref={studioNuestroRef}
        className="absolute top-[-0.15em] left-[-3%] max-lg:left-[0%] font-sleigh font-900 text-dark text-[clamp(2rem,14vw,18rem)] leading-none select-none whitespace-nowrap pointer-events-none will-change-transform"
      >
        STUDIO NUESTRO
      </p>

      {/* Teal circle — magnetic hover wrapper */}
      <div
        ref={magneticRef}
        onMouseMove={magneticMove}
        onMouseLeave={(e) => {
          magneticLeave(e)
          gsap.to(circleInnerRef.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)', overwrite: true })
        }}
        onMouseEnter={() => {
          gsap.to(circleInnerRef.current, { scale: 1.08, duration: 0.3, ease: 'power2.out', overwrite: true })
        }}
        className="absolute left-[5%] top-[15%] max-lg:left-[8%] max-lg:top-[10%] z-10 will-change-transform"
      >
        <div
          ref={(el) => {
            circleRef.current = el
            circleInnerRef.current = el
          }}
          className="w-[clamp(180px,25vw,320px)] max-lg:w-[clamp(120px,30vw,180px)] aspect-square rounded-full bg-teal flex flex-col items-center justify-center will-change-transform cursor-pointer"
        >
          <span
            ref={circleNumRef}
            className="font-sleigh font-900 text-dark text-[clamp(2.5rem,5vw,5.5rem)] leading-none"
          >
            {services[0].num}
          </span>
          <span
            ref={circleLabelRef}
            className="font-sleigh font-300 text-dark/80 text-[clamp(0.65rem,1vw,0.9rem)] tracking-[0.2em] uppercase mt-1"
          >
            {services[0].label}
          </span>
        </div>
      </div>

      {/* Giant statement */}
      <p
        ref={statementRef}
        className="absolute left-[5%] right-[3%] top-[48%] max-lg:top-[45%] max-lg:left-[3%] max-lg:right-[3%] font-sleigh font-900 text-dark text-[clamp(1.1rem,3.2vw,5.5rem)] leading-[1.05] text-right will-change-transform"
      >
        {services[0].statement}
      </p>

      {/* Right block -- studio title + tagline */}
      <div ref={titleRef} className="absolute right-[6%] top-[22%] w-[48%] max-lg:w-[50%] max-lg:top-[12%] max-lg:right-[4%] flex flex-col will-change-transform">
        <div className="text-right">
          <h2 className="font-sleigh text-dark text-[clamp(1.4rem,5.5vw,6rem)] leading-[0.9]">
            <span style={{ fontWeight: 800, letterSpacing: '-0.08em' }}>Kayao</span>
            <br />
            <span className="font-900">STUDIO</span>
          </h2>
          <p className="font-sleigh font-300 text-teal text-[clamp(0.8rem,1.1vw,1.1rem)] mt-3 leading-relaxed">
            Transformamos la estética en estrategia.
          </p>
        </div>
      </div>

      {/* Services list — ALL services, active highlighted */}
      <div ref={servicesRef} className="absolute right-[3%] top-[70%] max-lg:top-[66%] w-[55%] max-lg:w-[92%] max-lg:right-[4%]">
        {services.map((s, i) => (
          <div
            key={s.num}
            ref={(el) => (serviceItemRefs.current[i] = el)}
            onMouseEnter={() => handleServiceChange(i)}
            className="cursor-pointer"
            style={{ opacity: i === 0 ? 1 : 0.4, transition: 'opacity 0.2s' }}
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

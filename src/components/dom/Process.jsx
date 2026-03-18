import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', title: 'Estudio & Research', desc: 'Construimos entornos tridimensionales que viven en el navegador. Tus productos se pueden explorar, rotar, descubrir, en tiempo real, sin plugins, sin fricción, directamente en la web.' },
  { num: '02', title: 'Diseno & Propuesta', desc: 'Conceptualizamos la experiencia visual y la arquitectura de interaccion.' },
  { num: '03', title: 'Desarrollo Creativo', desc: 'Construimos con WebGL, animaciones y codigo a medida.' },
  { num: '04', title: 'Lanzamiento', desc: 'Optimizamos, testeamos y lanzamos al mundo.' },
]

export const Process = () => {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)
  const procesoRef = useRef(null)
  const circleQuickY = useRef([])
  const circleScales = useRef([])

  useGSAP(() => {
    const track = trackRef.current
    const scrollDistance = track.scrollWidth

    // Horizontal scroll tween — saved for containerAnimation
    const horizontalTween = gsap.to(track, {
      x: -(scrollDistance),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        scrub: 1,
      },
    })

    // "PROCESO" vertical parallax
    gsap.fromTo(procesoRef.current, {
      yPercent: -10,
    }, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    })

    // Content entry for each circle + hover quickTo setup
    const circles = track.children
    for (let i = 0; i < circles.length; i++) {
      const circle = circles[i]
      const contentEls = circle.querySelectorAll('[data-animate]')

      // Content fades/slides in when circle enters viewport center
      gsap.fromTo(contentEls, {
        opacity: 0,
        y: 40,
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        ease: 'power3.out',
        duration: 0.6,
        scrollTrigger: {
          trigger: circle,
          containerAnimation: horizontalTween,
          start: 'left 75%',
          end: 'left 40%',
          scrub: false,
          toggleActions: 'play reverse play reverse',
        },
      })

      // Hover quickTo for Y displacement + scale
      circleQuickY.current[i] = gsap.quickTo(circle, 'y', {
        duration: 0.4,
        ease: 'power3.out',
      })
      circleScales.current[i] = gsap.quickTo(circle, 'scale', {
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, { scope: sectionRef })

  const handleCircleEnter = (i) => {
    circleScales.current[i]?.(1.04)
  }

  const handleCircleLeave = (i) => {
    circleQuickY.current[i]?.(0)
    circleScales.current[i]?.(1)
  }

  const handleCircleMove = (e, i) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cy = rect.top + rect.height / 2
    const dy = (e.clientY - cy) / (rect.height / 2)
    circleQuickY.current[i]?.(dy * 15)
  }

  return (
    <section
      ref={sectionRef}
      data-section="process"
      className="relative h-[400vh] w-screen"
    >
      {/* Pinned viewport */}
      <div ref={pinRef} className="h-screen w-screen overflow-hidden bg-lime relative">
        {/* "PROCESO" vertical giant -- left edge, parallax */}
        <p
          ref={procesoRef}
          className="absolute top-[50%] left-[0%] -translate-y-1/2 font-sleigh font-900 text-dark text-[clamp(8rem,18vw,16rem)] leading-[0.65] tracking-[-0.08em] select-none pointer-events-none z-10 will-change-transform"
          style={{ writingMode: 'vertical-rl' }}
        >
          PROCESO
        </p>

        {/* Horizontal track -- circles slide left on scroll */}
        <div
          ref={trackRef}
          className="absolute top-0 left-[calc(100vw-110vh)] h-full flex items-center gap-[5vw] will-change-transform"
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative shrink-0 h-[110%] aspect-square rounded-full bg-teal cursor-pointer will-change-transform"
              onMouseEnter={() => handleCircleEnter(i)}
              onMouseLeave={() => handleCircleLeave(i)}
              onMouseMove={(e) => handleCircleMove(e, i)}
            >
              {/* Number -- top area */}
              <span
                data-animate
                className="absolute top-[8%] left-[50%] -translate-x-1/3 font-sleigh font-900 text-dark text-[clamp(6rem,14vw,14rem)] leading-none select-none"
              >
                {step.num}.
              </span>

              {/* Title -- left of number */}
              <h3
                data-animate
                className="absolute top-[22%] left-[12%] font-sleigh font-700 text-dark text-[clamp(1rem,2vw,2rem)] leading-tight"
              >
                {step.title}
              </h3>

              {/* Description -- center-left */}
              <p
                data-animate
                className="absolute top-[52%] left-[15%] max-w-[55%] font-sleigh font-200 text-dark/80 text-[clamp(0.7rem,1vw,1rem)] leading-relaxed"
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

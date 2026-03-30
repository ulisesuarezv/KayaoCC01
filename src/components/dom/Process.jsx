import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const steps = [
  { num: '01', title: 'Estudio&Research', desc: 'Analizamos tu negocio, tu público y tus objetivos para entender qué necesitas realmente. No disenamos por estética, disenamos con intención: crear una experiencia que conecte con tus clientes y funcione desde el primer momento.' },
  { num: '02', title: 'Diseno&Propuesta', desc: 'Transformamos la idea en una propuesta visual clara y atractiva. Disenamos una web moderna, intuitiva y alineada con tu marca, cuidando cada detalle para que destaque y genere confianza desde el primer vistazo.' },
  { num: '03', title: 'Desarrollo & testing', desc: 'Convertimos el diseno en una web real, rápida y funcional. Probamos cada detalle para asegurarnos de que todo funciona perfectamente en cualquier dispositivo, garantizando una experiencia fluida para tus usuarios.' },
  { num: '04', title: 'Lanzamiento & mantenimiento Web', desc: 'Publicamos tu web y la dejamos lista para funcionar desde el primer día. Además, te acompanamos con mantenimiento y mejoras continuas para que tu web crezca contigo y siga dando resultados.' },
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
        scrub: 0.4,
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
        scrub: 0.4,
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
          start: 'left 80%',
          end: 'right 80%',
          scrub: false,
          toggleActions: 'play none none reverse',
        },
      })

      // Hover quickTo for Y displacement + scale
      circleQuickY.current[i] = gsap.quickTo(circle, 'y', {
        duration: 0.4,
        ease: 'power3.out',
      })
      circleScales.current[i] = gsap.quickTo(circle, 'scale', {
        duration: 0.5,
        ease: 'power3.out',
      })
    }
  }, { scope: sectionRef })

  const handleCircleEnter = (i) => {
    circleScales.current[i]?.(0.6)
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
          className="absolute top-[50%] left-[0%] -translate-y-1/2 max-lg:top-[2vh] max-lg:left-[50%] max-lg:-translate-x-1/2 max-lg:translate-y-0 font-sleigh font-900 text-dark text-[clamp(8rem,18vw,16rem)] max-lg:text-[clamp(4rem,25vw,9rem)] leading-[0.65] tracking-[-0.08em] select-none pointer-events-none z-10 [writing-mode:vertical-rl] max-lg:[writing-mode:horizontal-tb] will-change-transform"
        >
          PROCESO
        </p>

        {/* Horizontal track -- circles slide left on scroll */}
        <div
          ref={trackRef}
          className="absolute top-0 left-[calc(100vw-110vh)] max-lg:left-[10vw] h-full flex items-center gap-[5vw] max-lg:gap-[8vw] will-change-transform"
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative shrink-0 h-[110%] max-lg:h-auto max-lg:w-[min(110vw,110vh)] aspect-square rounded-full bg-teal cursor-pointer will-change-transform overflow-hidden"
              onMouseEnter={() => handleCircleEnter(i)}
              onMouseLeave={() => handleCircleLeave(i)}
              onMouseMove={(e) => handleCircleMove(e, i)}
            >
              {/* Number -- top area */}
              <span
                data-animate
                className="absolute top-[8%] left-[50%] -translate-x-1/3 max-lg:left-[50%] max-lg:-translate-x-1/2 font-sleigh font-900 text-white text-[clamp(6rem,14vw,14rem)] max-lg:text-[clamp(3rem,12vw,5rem)] leading-none select-none"
              >
                {step.num}.
              </span>

              {/* Title -- left of number */}
              <h3
                data-animate
                className="absolute top-[22%] left-[12%] max-lg:top-[20%] max-lg:left-[15%] max-lg:right-[15%] font-sleigh font-700 text-dark text-[clamp(0.9rem,2vw,2rem)] max-lg:text-[clamp(0.85rem,3.5vw,1.4rem)] leading-tight"
              >
                {step.title}
              </h3>

              {/* Description -- center-left */}
              <p
                data-animate
                className="absolute top-[52%] left-[15%] max-lg:top-[38%] max-lg:left-[15%] max-lg:right-[15%] max-w-[55%] max-lg:max-w-none font-sleigh font-200 text-dark/80 text-[clamp(0.75rem,1.4vw,1.35rem)] max-lg:text-[clamp(0.7rem,2.8vw,1rem)] leading-relaxed"
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

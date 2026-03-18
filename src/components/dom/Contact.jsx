import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const navItems = ['HOME', 'NOSOTROS', 'MANIFESTO', 'CONTACT']

export const Contact = () => {
  const sectionRef = useRef(null)
  const marqueeRef = useRef(null)
  const titleRef = useRef(null)
  const navRef = useRef(null)
  const lowerRef = useRef(null)
  const linkRefs = useRef([])
  const linkQuickX = useRef([])
  const linkQuickY = useRef([])

  useGSAP(() => {
    // Title -- clip-path reveal from bottom to top
    gsap.fromTo(titleRef.current, {
      clipPath: 'inset(100% 0% 0% 0%)',
      opacity: 0,
    }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'top 20%',
        scrub: 0.6,
      },
    })

    // Nav links -- stagger in from below
    gsap.fromTo(navRef.current.children, {
      y: 30,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 50%',
        end: 'top 15%',
        scrub: 0.5,
      },
    })

    // Lower lime zone -- scaleY reveal
    gsap.fromTo(lowerRef.current, {
      scaleY: 0,
    }, {
      scaleY: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 0.5,
      },
    })

    // Parallax marquee (existing behavior)
    gsap.fromTo(marqueeRef.current, {
      xPercent: 10,
    }, {
      xPercent: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })

    // Nav link magnetic quickTo setup
    linkRefs.current.forEach((el, i) => {
      if (!el) return
      linkQuickX.current[i] = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3.out' })
      linkQuickY.current[i] = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3.out' })
    })
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      data-section="contact"
      className="relative h-screen min-h-screen w-screen flex flex-col overflow-hidden"
    >
      {/* Upper zone -- dark ~50% */}
      <div className="relative bg-dark flex-[0_0_50%] flex items-end">
        {/* "Kayao Studio" -- clip-path reveal */}
        <h2
          ref={titleRef}
          className="absolute top-[8%] right-[6%] font-sleigh font-900 text-lime text-[clamp(4rem,10vw,10rem)] leading-[0.85] text-right will-change-transform"
        >
          Kayao
          <br />
          Studio
        </h2>

        {/* Nav links -- magnetic hover */}
        <nav ref={navRef} className="absolute bottom-[8%] left-[5%] flex flex-col gap-2">
          {navItems.map((item, i) => (
            <a
              key={item}
              ref={(el) => (linkRefs.current[i] = el)}
              href={`#${item.toLowerCase()}`}
              className="font-sleigh font-700 text-lime/70 text-[clamp(0.8rem,1.2vw,1.1rem)] tracking-[0.15em] uppercase hover:text-lime transition-colors duration-300 inline-block will-change-transform"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
                const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
                linkQuickX.current[i]?.(dx * 8)
                linkQuickY.current[i]?.(dy * 5)
              }}
              onMouseLeave={() => {
                linkQuickX.current[i]?.(0)
                linkQuickY.current[i]?.(0)
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* Parallax marquee strip -- boundary between dark and lime */}
      <div className="relative z-10 shrink-0 overflow-visible bg-lime">
        <p
          ref={marqueeRef}
          className="font-sleigh font-900 text-dark text-[clamp(3rem,7vw,7rem)] leading-none whitespace-nowrap select-none pointer-events-none will-change-transform"
        >
          development. | UX&UI | webGL. | design | web&app | development. | UX&UI | webGL. | design | web&app
        </p>
      </div>

      {/* Lower zone -- lime, scaleY reveal */}
      <div
        ref={lowerRef}
        className="relative bg-lime flex-1"
        style={{ transformOrigin: 'bottom' }}
      />
    </section>
  )
}

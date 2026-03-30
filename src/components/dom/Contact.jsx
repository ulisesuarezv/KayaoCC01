import { useRef, useCallback, Suspense } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { useAppStore } from '../../stores/useAppStore'

const navItems = [
  { label: 'HOME', section: 'hero' },
  { label: 'NOSOTROS', section: 'about' },
  { label: 'MANIFESTO', section: 'manifesto' },
  { label: 'PROCESO', section: 'process' },
  { label: 'CONTACT', section: 'contact' },
]

const FooterK = () => {
  const meshRef = useRef(null)
  const { nodes, materials } = useGLTF('/models/simbolo_kayaoGOD-transformed.glb')

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += Math.min(delta, 0.05) * 0.35
  })

  return (
    <mesh
      ref={meshRef}
      geometry={nodes.material.geometry}
      material={materials['Material.001']}
      rotation={[Math.PI / 2, 0, 0]}
    />
  )
}

export const Contact = () => {
  const sectionRef = useRef(null)
  const marqueeRef = useRef(null)
  const titleRef = useRef(null)
  const navRef = useRef(null)
  const lowerRef = useRef(null)
  const linkRefs = useRef([])
  const linkQuickX = useRef([])
  const linkQuickY = useRef([])

  const scrollToSection = useCallback((sectionId) => {
    const lenis = useAppStore.getState().lenis

    // Hero — always scroll to absolute top
    if (sectionId === 'hero') {
      if (lenis) lenis.scrollTo(0, { duration: 1.2 })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const target = document.querySelector(`[data-section="${sectionId}"]`)
    if (!target) return

    // Pinned sections need an offset to land past entrance animations
    const pinnedOffsets = {
      manifesto: window.innerHeight * 0.5,
    }
    const offset = pinnedOffsets[sectionId] || 0

    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2, offset })
    } else {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

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

    // Continuous parallax marquee — infinite loop, paused when off-screen
    const marqueeTween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      ease: 'none',
      duration: 12,
      repeat: -1,
    })
    marqueeTween.pause()

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => marqueeTween.play(),
      onLeave: () => marqueeTween.pause(),
      onEnterBack: () => marqueeTween.play(),
      onLeaveBack: () => marqueeTween.pause(),
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
          className="absolute top-[8%] right-[6%] max-lg:right-[6%] max-lg:left-[5%] font-sleigh font-900 text-lime text-[clamp(1.5rem,8vw,10rem)] max-lg:text-[clamp(4rem,18vw,8rem)] leading-[0.85] tracking-[-0.05em] text-right will-change-transform"
        >
          Kayao
          <br />
          Studio
        </h2>

        {/* Instagram link -- aligned with title */}
        <a
          href="https://www.instagram.com/kayao.studio"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[8%] right-[6%] font-sleigh font-200 text-teal text-[clamp(0.65rem,1vw,1rem)] max-sm:text-[0.85rem] tracking-[0.15em] uppercase hover:text-white transition-colors duration-300"
        >
          IG | X
        </a>

        {/* Nav links -- magnetic hover */}
        <nav ref={navRef} className="absolute bottom-[8%] left-[5%] flex flex-col gap-1">
          {navItems.map(({ label, section }, i) => (
            <button
              key={label}
              ref={(el) => (linkRefs.current[i] = el)}
              onClick={() => scrollToSection(section)}
              className="font-sleigh font-700 text-lime/70 text-[clamp(0.8rem,1.2vw,1.1rem)] max-sm:text-[0.9rem] tracking-[0.15em] uppercase hover:text-lime transition-colors duration-300 inline-block will-change-transform cursor-pointer text-left"
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
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Parallax marquee strip -- boundary between dark and lime */}
      <div className="relative z-10 shrink-0 overflow-visible bg-lime">
        <p
          ref={marqueeRef}
          className="font-sleigh font-900 text-dark text-[clamp(1.5rem,7vw,7rem)] max-lg:text-[clamp(2.5rem,12vw,5rem)] leading-none whitespace-nowrap select-none pointer-events-none will-change-transform"
        >
          development. | UX&UI | webGL. | design | web&app | development. | UX&UI | webGL. | design | web&app
        </p>
      </div>

      {/* Lower zone -- lime, scaleY reveal + 3D K */}
      <div
        ref={lowerRef}
        className="relative bg-lime flex-1 overflow-hidden"
        style={{ transformOrigin: 'bottom' }}
      >
        <Canvas
          gl={{ alpha: true, antialias: window.devicePixelRatio < 2 }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, window.innerWidth < 1024 ? 5.5 : 4.5], fov: 45 }}
          className="!absolute inset-0"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-3, -2, 4]} intensity={0.3} />
          <Environment preset="city" environmentIntensity={0.2} resolution={64} />
          <Suspense fallback={null}>
            <FooterK />
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}

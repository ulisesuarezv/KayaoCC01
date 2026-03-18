import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '../../hooks/useLenis'
import { useAppStore } from '../../stores/useAppStore'
import { Hero } from '../dom/Hero'
import { About } from '../dom/About'
import { Manifesto } from '../dom/Manifesto'
import { Process } from '../dom/Process'
import { Contact } from '../dom/Contact'

gsap.registerPlugin(ScrollTrigger)

const sections = ['hero', 'about', 'manifesto', 'process', 'contact']

export const PageLayout = () => {
  const mainRef = useRef(null)
  useLenis()

  useGSAP(() => {
    // Global scroll progress tracking
    ScrollTrigger.create({
      trigger: mainRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        useAppStore.getState().setScrollProgress(self.progress)
      },
    })

    // Per-section active detection
    sections.forEach((name, i) => {
      const el = document.querySelector(`[data-section="${name}"]`)
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            useAppStore.getState().setCurrentSection(i)
          }
        },
      })
    })
  }, { scope: mainRef })

  return (
    <main ref={mainRef}>
      <Hero />
      <About />
      <Manifesto />
      <Process />
      <Contact />
    </main>
  )
}

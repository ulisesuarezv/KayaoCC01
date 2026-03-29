import { create } from 'zustand'

// Mutable object — mutated in-place to avoid GC pressure on 60fps scroll callbacks.
// Components that need per-section progress should read via getState().sectionProgress[name]
// inside useFrame/callbacks, NOT via selector (it won't trigger re-renders by design).
const sectionProgress = {
  hero: 0,
  about: 0,
  manifesto: 0,
  process: 0,
  contact: 0,
}

export const useAppStore = create((set) => ({
  currentSection: 0,
  scrollProgress: 0,
  isTransitioning: false,
  sectionProgress,
  setCurrentSection: (section) => set({ currentSection: section }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  // Mutate in place — no set() call, no new object, no re-render, no GC
  setSectionProgress: (name, progress) => {
    sectionProgress[name] = progress
  },
}))

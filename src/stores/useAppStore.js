import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentSection: 0,
  scrollProgress: 0,
  isTransitioning: false,
  sectionProgress: {
    hero: 0,
    about: 0,
    manifesto: 0,
    process: 0,
    contact: 0,
  },
  setCurrentSection: (section) => set({ currentSection: section }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  setSectionProgress: (name, progress) =>
    set((state) => ({
      sectionProgress: { ...state.sectionProgress, [name]: progress },
    })),
}))

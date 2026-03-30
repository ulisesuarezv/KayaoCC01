import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles/index.css'
import { App } from './App.jsx'

gsap.registerPlugin(ScrollTrigger)

// Force scroll to top on every page load/refresh
history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(<App />)

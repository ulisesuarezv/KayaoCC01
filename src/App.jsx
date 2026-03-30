import { Preloader } from './components/dom/Preloader'
import { PageLayout } from './components/layout/PageLayout'
import { useAppStore } from './stores/useAppStore'

export const App = () => {
  const isPreloaderDone = useAppStore((s) => s.isPreloaderDone)

  return (
    <>
      {!isPreloaderDone && <Preloader />}
      <PageLayout />
    </>
  )
}

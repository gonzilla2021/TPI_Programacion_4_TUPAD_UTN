import { useEffect } from 'react'
import { Avisos } from './shared/components/Avisos'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)
  // El usuario guardado en el navegador se confirma con la cookie del servidor.
  useEffect(() => {
    void checkSession()
  }, [checkSession])
  return (
    <>
      <AppRouter />
      <Avisos />
    </>
  )
}

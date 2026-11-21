import { Link, useNavigate } from 'react-router-dom'
import { Formulario } from '../../../shared/components/Formulario'
import { useAuthStore } from '../../../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  return (
    <section className="auth card">
      <h1>Iniciar sesión</h1>
      <p>Entrá para confirmar y consultar tus pedidos.</p>
      <Formulario
        iniciales={{ username: '', password: '' }}
        campos={[
          { nombre: 'username', etiqueta: 'Usuario', requerido: true },
          { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', requerido: true },
        ]}
        texto="Ingresar"
        enviar={async (datos) => {
          await login(datos.username, datos.password)
          navigate('/')
        }}
      />
      <p>
        ¿Todavía no tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </section>
  )
}

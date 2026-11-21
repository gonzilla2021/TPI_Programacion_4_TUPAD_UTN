import { avisarExito } from '../../../store/noticeStore'
import { Link, useNavigate } from 'react-router-dom'
import { Formulario } from '../../../shared/components/Formulario'
import { authApi } from '../api/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  return (
    <section className="auth card">
      <h1>Crear cuenta</h1>
      <Formulario
        iniciales={{ username: '', full_name: '', email: '', password: '' }}
        campos={[
          { nombre: 'username', etiqueta: 'Usuario', requerido: true },
          { nombre: 'full_name', etiqueta: 'Nombre completo', requerido: true },
          { nombre: 'email', etiqueta: 'Email', tipo: 'email', requerido: true },
          {
            nombre: 'password',
            etiqueta: 'Contraseña',
            tipo: 'password',
            requerido: true,
            minLength: 8,
            maxLength: 72,
          },
        ]}
        texto="Registrarme"
        enviar={async (datos) => {
          await authApi.registrar({
            username: datos.username,
            full_name: datos.full_name,
            email: datos.email,
            password: datos.password,
          })
          avisarExito('Cuenta creada correctamente. Ya podés iniciar sesión.')
          navigate('/login')
        }}
      />
      <p>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </section>
  )
}

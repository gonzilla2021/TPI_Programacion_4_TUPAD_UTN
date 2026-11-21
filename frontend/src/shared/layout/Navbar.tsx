import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'
import { EstadoError } from '../components/EstadoError'

export function Navbar() {
  const { usuario, logout } = useAuthStore()
  const cantidad = useCartStore((s) => s.items.reduce((total, item) => total + item.cantidad, 0))

  const navigate = useNavigate()
  const [error, setError] = useState<unknown>(null)
  const [saliendo, setSaliendo] = useState(false)

  async function cerrarSesion() {
    setError(null)
    setSaliendo(true)

    try {
      await logout()
      navigate('/login')
    } catch (err) {
      setError(err)
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Navegación principal">
        <NavLink className="brand" to="/">
          Food Store
          <span>Comidas y pedidos</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end>
            Catálogo
          </NavLink>

          <NavLink to="/carrito">
            Carrito
            <span className="cart-count">{cantidad}</span>
          </NavLink>

          {usuario && (
            <>
              <NavLink to="/mis-pedidos">Mis pedidos</NavLink>

              {usuario.role === 'admin' && <NavLink to="/admin/resumen">Administración</NavLink>}
            </>
          )}
        </div>

        <div className="nav-account">
          {usuario ? (
            <>
              <div className="nav-user">
                <span className="nav-user-name">{usuario.full_name}</span>

                <span className={`role-badge role-${usuario.role}`}>
                  {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>

              <Button
                type="button"
                className="secondary nav-logout"
                disabled={saliendo}
                onClick={cerrarSesion}
              >
                {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
              </Button>
            </>
          ) : (
            <>
              <NavLink className="nav-login" to="/login">
                Ingresar
              </NavLink>

              <NavLink className="button" to="/register">
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {error !== null && <EstadoError error={error} />}
    </header>
  )
}

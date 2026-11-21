import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { useAuthStore } from '../../store/authStore'

export function MainLayout() {
  const location = useLocation()
  const admin = useAuthStore((s) => s.usuario?.role === 'admin')
  return (
    <>
      <Navbar />
      <main className="container">
        {admin && location.pathname.startsWith('/admin') && (
          <nav className="admin-nav" aria-label="Administración">
            <NavLink to="/admin/resumen">Resumen</NavLink>
            <NavLink to="/admin/categorias">Categorías</NavLink>
            <NavLink to="/admin/productos">Productos</NavLink>
            <NavLink to="/admin/pedidos">Pedidos</NavLink>
            <NavLink to="/admin/usuarios">Usuarios</NavLink>
          </nav>
        )}
        <Outlet />
      </main>
      <footer>Food Store · Pedidos de comida</footer>
    </>
  )
}

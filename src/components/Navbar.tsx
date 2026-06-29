import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import type { CurrentUser } from '../api/api'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    if (token) {
      api.currentUser().then(setUser).catch(() => setUser(null))
    } else {
      setUser(null)
    }
  }, [token])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('bookingIds')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/search" className="navbar-brand">✈ Fly Away Travel</Link>
      <div className="navbar-links">
        {token ? (
          <>
            <Link to="/search">Buscar Vuelos</Link>
            <Link to="/my-bookings">Mis Reservas</Link>
            {user && <span className="navbar-user">Hola, {user.firstName}</span>}
            <button onClick={logout} className="btn-logout">Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}

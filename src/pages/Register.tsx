import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.email || !form.firstName || !form.lastName || !form.password) {
      setError('Todos los campos son obligatorios.')
      return
    }
    setLoading(true)
    try {
      await api.register(form)
      setSuccess('Registro exitoso. Redirigiendo al login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
          <label>Nombre</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Alice" />
          <label>Apellido</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" />
          <label>Contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 chars, mayúscula y dígito" />
          {error && <p className="msg-error">{error}</p>}
          {success && <p className="msg-success">{success}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
        </form>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  )
}

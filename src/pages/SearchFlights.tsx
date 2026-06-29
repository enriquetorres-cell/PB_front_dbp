import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import type { Flight } from '../api/api'

export default function SearchFlights() {
  const navigate = useNavigate()
  const isAuthenticated = !!localStorage.getItem('token')

  const [params, setParams] = useState({ flightNumber: '', airlineName: '', estDepartureTimeFrom: '', estDepartureTimeTo: '' })
  const [flights, setFlights] = useState<Flight[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingMsg, setBookingMsg] = useState<Record<number, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams({ ...params, [e.target.name]: e.target.value })
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.searchFlights(params)
      setFlights(result.items)
      setSearched(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar')
    } finally {
      setLoading(false)
    }
  }

  async function handleBook(flightId: number) {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setBookingMsg({ ...bookingMsg, [flightId]: '' })
    try {
      const { id } = await api.bookFlight(flightId)
      const ids: number[] = JSON.parse(localStorage.getItem('bookingIds') ?? '[]')
      ids.push(id)
      localStorage.setItem('bookingIds', JSON.stringify(ids))
      setBookingMsg({ ...bookingMsg, [flightId]: `Reserva exitosa. ID: ${id}` })
    } catch (err: unknown) {
      setBookingMsg({ ...bookingMsg, [flightId]: err instanceof Error ? err.message : 'Error al reservar' })
    }
  }

  function fmt(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div className="page-container">
      <h1>Buscar Vuelos</h1>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-row">
          <div className="field">
            <label>Número de vuelo</label>
            <input name="flightNumber" value={params.flightNumber} onChange={handleChange} placeholder="Ej: LA123" />
          </div>
          <div className="field">
            <label>Aerolínea</label>
            <input name="airlineName" value={params.airlineName} onChange={handleChange} placeholder="Ej: LATAM" />
          </div>
          <div className="field">
            <label>Salida desde</label>
            <input name="estDepartureTimeFrom" type="datetime-local" value={params.estDepartureTimeFrom} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Salida hasta</label>
            <input name="estDepartureTimeTo" type="datetime-local" value={params.estDepartureTimeTo} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
      </form>

      {error && <p className="msg-error">{error}</p>}

      {searched && (
        flights.length === 0 ? (
          <p className="empty-msg">No se encontraron vuelos para los filtros ingresados.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Aerolínea</th>
                  <th>Salida</th>
                  <th>Llegada</th>
                  <th>Asientos</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f) => (
                  <tr key={f.id}>
                    <td>{f.flightNumber}</td>
                    <td>{f.airlineName}</td>
                    <td>{fmt(f.estDepartureTime)}</td>
                    <td>{fmt(f.estArrivalTime)}</td>
                    <td>{f.availableSeats}</td>
                    <td>
                      <button className="btn-book" onClick={() => handleBook(f.id)}>Reservar</button>
                      {bookingMsg[f.id] && (
                        <span className={bookingMsg[f.id].startsWith('Reserva') ? 'msg-success' : 'msg-error'}>
                          {' '}{bookingMsg[f.id]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

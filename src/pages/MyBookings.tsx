import { useEffect, useState } from 'react'
import { api } from '../api/api'
import type { Booking } from '../api/api'

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids: number[] = JSON.parse(localStorage.getItem('bookingIds') ?? '[]')
    Promise.all(ids.map((id) => api.getBooking(id).catch(() => null)))
      .then((results) => setBookings(results.filter(Boolean) as Booking[]))
      .finally(() => setLoading(false))
  }, [])

  function fmt(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
  }

  if (loading) return <div className="page-container"><p>Cargando reservas...</p></div>

  return (
    <div className="page-container">
      <h1>Mis Reservas</h1>
      {bookings.length === 0 ? (
        <p className="empty-msg">No tienes reservas aún. ¡Busca un vuelo y reserva!</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vuelo</th>
                <th>Aerolínea</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Fecha reserva</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>{b.flightNumber}</td>
                  <td>—</td>
                  <td>{fmt(b.estDepartureTime)}</td>
                  <td>{fmt(b.estArrivalTime)}</td>
                  <td>{fmt(b.bookingDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

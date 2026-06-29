const BASE = '/api'

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(options.headers ?? {}) },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // Spring ProblemDetail uses "detail", fallback to other fields
    throw new Error(body.detail ?? body.message ?? body.error ?? `Error ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}

export interface RegisterInput { email: string; firstName: string; lastName: string; password: string }
export interface LoginInput { email: string; password: string }
export interface FlightSearchParams { flightNumber?: string; airlineName?: string; estDepartureTimeFrom?: string; estDepartureTimeTo?: string }
export interface Flight { id: number; airlineName: string; flightNumber: string; estDepartureTime: string; estArrivalTime: string; availableSeats: number }
export interface Booking { id: number; bookingDate: string; flightId: number; flightNumber: string; estDepartureTime: string; estArrivalTime: string; customerId: number; customerFirstName: string; customerLastName: string }
export interface CurrentUser { id: number; username: string; email: string; firstName: string; lastName: string; role: string }

export const api = {
  register: (data: RegisterInput) =>
    request<{ id: number }>('/users/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginInput) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  currentUser: () =>
    request<CurrentUser>('/users/current'),

  searchFlights: (params: FlightSearchParams) => {
    const qs = new URLSearchParams()
    if (params.flightNumber) qs.set('flightNumber', params.flightNumber)
    if (params.airlineName) qs.set('airlineName', params.airlineName)
    if (params.estDepartureTimeFrom) qs.set('estDepartureTimeFrom', toISO(params.estDepartureTimeFrom))
    if (params.estDepartureTimeTo) qs.set('estDepartureTimeTo', toISO(params.estDepartureTimeTo))
    return request<{ items: Flight[] }>(`/flights/search?${qs.toString()}`)
  },

  bookFlight: (flightId: number) =>
    request<{ id: number }>('/flights/book', { method: 'POST', body: JSON.stringify({ flightId }) }),

  getBooking: (id: number) =>
    request<Booking>(`/flights/book/${id}`),
}

function toISO(localDatetime: string): string {
  if (!localDatetime) return localDatetime
  // datetime-local gives "2026-12-01T10:00" — add seconds and Z
  if (localDatetime.length === 16) return localDatetime + ':00Z'
  if (!localDatetime.endsWith('Z')) return localDatetime + 'Z'
  return localDatetime
}

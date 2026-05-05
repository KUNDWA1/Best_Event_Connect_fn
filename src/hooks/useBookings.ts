import { useState, useEffect, useCallback } from 'react'
import {
  BackendBookingStatus,
  Booking,
  CreateBookingPayload,
  cancelBooking,
  createBooking,
  deleteBooking as deleteBookingRequest,
  getBookings,
  updateBooking as updateBookingRequest,
  updateBookingStatus as updateBookingStatusRequest,
} from '../services/api'

interface UseBookingsOptions {
  userId?: string
  vendorId?: string
  enabled?: boolean
}

interface UseBookingsResult {
  bookings: Booking[]
  loading: boolean
  error: string | null
  addBooking: (bookingData: CreateBookingPayload) => Promise<void>
  removeBooking: (bookingId: string) => Promise<void>
  deleteBooking: (bookingId: string) => Promise<void>
  updateBooking: (booking: Booking) => Promise<void>
  setBookingStatus: (bookingId: string, status: Booking['status'] | BackendBookingStatus) => Promise<void>
  refetch: () => Promise<void>
}

const toBookingStatus = (value: unknown): Booking['status'] => {
  if (typeof value !== 'string') {
    return 'pending'
  }

  const normalized = value.trim().toLowerCase()

  if (
    normalized === 'confirmed' ||
    normalized === 'confirm' ||
    normalized === 'accepted' ||
    normalized === 'approved'
  ) {
    return 'confirmed'
  }

  if (
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'rejected' ||
    normalized === 'declined'
  ) {
    return 'cancelled'
  }

  if (normalized === 'pending') {
    return 'pending'
  }

  return 'pending'
}

const normalizeBookingRecord = (raw: unknown): Booking | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }

  const record = raw as {
    id?: string | number
    vendorId?: string
    packageId?: string
    plannerId?: string
    userId?: string
    vendorName?: string
    vendor?: { businessName?: string; name?: string }
    service?: string
    category?: string
    eventId?: string
    eventName?: string
    event?: { id?: string; title?: string; userId?: string }
    package?: {
      id?: string
      vendorId?: string
      category?: string
      title?: string
      description?: string
      vendor?: { businessName?: string; name?: string }
    }
    bookingDate?: string
    startDate?: string
    endDate?: string
    date?: string
    timeSlot?: string
    price?: number | string
    priceOffered?: number | string
    amount?: number | string
    status?: string
    createdAt?: string
    updatedAt?: string
    message?: string
    notes?: string
  }

  if (!record.id) {
    return null
  }

  const vendorName =
    record.vendorName ||
    record.vendor?.businessName ||
    record.vendor?.name ||
    record.package?.vendor?.businessName ||
    record.package?.vendor?.name ||
    (record.package?.category ? `${record.package.category} Vendor` : 'Vendor')

  return {
    id: String(record.id),
    vendorId: record.vendorId || record.package?.vendorId,
    packageId: record.packageId || record.package?.id,
    plannerId: record.plannerId,
    userId: record.userId || record.event?.userId,
    vendorName,
    service: record.service || record.package?.title || 'Service Package',
    category: record.category || record.package?.category,
    eventId: record.eventId || record.event?.id,
    eventName: record.eventName || record.event?.title || 'Event',
    bookingDate:
      record.bookingDate ||
      record.startDate ||
      record.date ||
      new Date().toISOString(),
    timeSlot: record.timeSlot || 'full-day',
    price: Number(record.priceOffered ?? record.price ?? record.amount ?? 0),
    status: toBookingStatus(record.status),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt,
    notes: record.notes || record.message,
  }
}

const normalizeBookings = (raw: unknown): Booking[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => normalizeBookingRecord(item))
      .filter((item): item is Booking => Boolean(item))
  }

  if (
    typeof raw === 'object' &&
    raw !== null &&
    Array.isArray((raw as { bookings?: Booking[] }).bookings)
  ) {
    return normalizeBookings((raw as { bookings: Booking[] }).bookings)
  }

  if (
    typeof raw === 'object' &&
    raw !== null &&
    Array.isArray((raw as { items?: Booking[] }).items)
  ) {
    return normalizeBookings((raw as { items: Booking[] }).items)
  }

  return []
}

const normalizeSingleBooking = (raw: unknown): Booking | null => {
  if (Array.isArray(raw)) {
    return normalizeBookingRecord(raw[0])
  }

  if (typeof raw === 'object' && raw !== null) {
    const direct = normalizeBookingRecord(raw)
    if (direct) {
      return direct
    }
  }

  const nested = normalizeBookings(raw)
  return nested[0] || null
}

const mergeUniqueBookings = (...groups: Booking[][]): Booking[] => {
  const byId = new Map<string, Booking>()

  groups.flat().forEach((booking) => {
    const existing = byId.get(booking.id)
    byId.set(booking.id, existing ? { ...existing, ...booking } : booking)
  })

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )
}

const filterBookingsByScope = (
  allBookings: Booking[],
  scope?: { userId?: string; vendorId?: string }
): Booking[] => {
  if (scope?.vendorId) {
    return allBookings.filter((booking) => booking.vendorId === scope.vendorId)
  }

  if (scope?.userId) {
    return allBookings.filter(
      (booking) => booking.userId === scope.userId || booking.plannerId === scope.userId
    )
  }

  return allBookings
}

export function useBookings(options?: UseBookingsOptions): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    if (options?.enabled === false) {
      setBookings([])
      setError(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (options?.vendorId) {
        try {
          const response = await getBookings({ vendorId: options.vendorId })
          const scopedBookings = normalizeBookings(response.data)

          if (scopedBookings.length > 0) {
            setBookings(scopedBookings)
            return
          }
        } catch {
          // Fall back to unscoped list below.
        }

        const fallbackResponse = await getBookings()
        const allBookings = normalizeBookings(fallbackResponse.data)
        setBookings(filterBookingsByScope(allBookings, { vendorId: options.vendorId }))
        return
      }

      if (options?.userId) {
        const [plannerResult, userResult] = await Promise.allSettled([
          getBookings({ plannerId: options.userId }),
          getBookings({ userId: options.userId }),
        ])

        const plannerBookings =
          plannerResult.status === 'fulfilled'
            ? normalizeBookings(plannerResult.value.data)
            : []
        const userBookings =
          userResult.status === 'fulfilled'
            ? normalizeBookings(userResult.value.data)
            : []

        const scopedBookings = mergeUniqueBookings(plannerBookings, userBookings)

        if (scopedBookings.length > 0) {
          setBookings(scopedBookings)
          return
        }

        // Fallback for APIs that do not support plannerId/userId filters.
        const fallbackResponse = await getBookings()
        const allBookings = normalizeBookings(fallbackResponse.data)
        setBookings(filterBookingsByScope(allBookings, { userId: options.userId }))
        return
      }

      const response = await getBookings()
      setBookings(normalizeBookings(response.data))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings'
      setError(errorMessage)
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [options?.enabled, options?.userId, options?.vendorId])

  useEffect(() => {
    fetchBookings()
    
    // Refetch when window regains focus
    const handleFocus = () => {
      fetchBookings()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchBookings])

  const addBooking = useCallback(async (bookingData: CreateBookingPayload) => {
    try {
      const response = await createBooking(bookingData)
      const createdBooking = normalizeSingleBooking(response.data)

      if (createdBooking) {
        setBookings((prev) => [createdBooking, ...prev])
        return
      }

      await fetchBookings()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking'
      throw new Error(errorMessage)
    }
  }, [fetchBookings])

  const removeBooking = useCallback(async (bookingId: string) => {
    try {
      const response = await cancelBooking(bookingId)
      const cancelled = normalizeSingleBooking(response.data)

      if (cancelled) {
        setBookings((prev) => prev.map((booking) => (booking.id === cancelled.id ? cancelled : booking)))
        return
      }

      await fetchBookings()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking'
      throw new Error(errorMessage)
    }
  }, [fetchBookings])

  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
      await deleteBookingRequest(bookingId)
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking'
      throw new Error(errorMessage)
    }
  }, [])

  const updateBooking = useCallback(async (booking: Booking) => {
    try {
      const { id, ...payload } = booking
      const response = await updateBookingRequest(id, payload)
      const updatedBooking = normalizeSingleBooking(response.data)

      if (updatedBooking) {
        setBookings((prev) => prev.map((item) => (item.id === updatedBooking.id ? updatedBooking : item)))
        return
      }

      setBookings((prev) => prev.map((item) => (item.id === booking.id ? booking : item)))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking'
      throw new Error(errorMessage)
    }
  }, [])

  const setBookingStatus = useCallback(
    async (bookingId: string, status: Booking['status'] | BackendBookingStatus) => {
      try {
        const response = await updateBookingStatusRequest(bookingId, status)
        const updatedBooking = normalizeSingleBooking(response.data)
        const requestedStatus = toBookingStatus(status)

        if (updatedBooking) {
          setBookings((prev) =>
            prev.map((item) => {
              if (item.id !== updatedBooking.id) {
                return item
              }

              // Some APIs return stale booking objects immediately after status update.
              const merged = {
                ...item,
                ...updatedBooking,
              }

              return {
                ...merged,
                status:
                  updatedBooking.status === 'pending' && requestedStatus !== 'pending'
                    ? requestedStatus
                    : updatedBooking.status,
              }
            })
          )
          return
        }

        setBookings((prev) =>
          prev.map((item) =>
            item.id === bookingId
              ? {
                  ...item,
                  status: requestedStatus,
                }
              : item
          )
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update booking status'
        throw new Error(errorMessage)
      }
    },
    []
  )

  const refetch = useCallback(async () => {
    await fetchBookings()
  }, [fetchBookings])

  return {
    bookings,
    loading,
    error,
    addBooking,
    removeBooking,
    deleteBooking,
    updateBooking,
    setBookingStatus,
    refetch,
  }
}

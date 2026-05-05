import { useState, useEffect, useCallback } from 'react'
import { getEvents, getEventsByAccess, getPublicEvents, Event, ApiResponse } from '../services/api'

type AppUserRole = 'vendor' | 'planner' | 'admin'

interface UseEventsOptions {
  role?: AppUserRole
  userId?: string
  scopeToCurrentUser?: boolean
  publicOnly?: boolean
}

interface UseEventsResult {
  events: Event[]
  loading: boolean
  error: string | null
  fetchEvents: (filters?: Record<string, unknown>) => Promise<void>
  refetch: () => Promise<void>
}

export function useEvents(options?: UseEventsOptions): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async (filters?: Record<string, unknown>) => {
    try {
      setLoading(true)
      setError(null)

      const response: ApiResponse<Event[]> = options?.scopeToCurrentUser
        ? await getEventsByAccess({
            role: options.role || 'planner',
            userId: options.userId,
            extraFilters: filters,
          })
        : options?.publicOnly
          ? await getPublicEvents(filters)
        : await getEvents(filters)

      setEvents(response.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events'
      setError(errorMessage)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }, [options?.publicOnly, options?.role, options?.scopeToCurrentUser, options?.userId])

  useEffect(() => {
    fetchEvents()
    
    // Refetch when window regains focus
    const handleFocus = () => {
      fetchEvents()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchEvents])

  const refetch = useCallback(async () => {
    await fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    fetchEvents,
    refetch,
  }
}

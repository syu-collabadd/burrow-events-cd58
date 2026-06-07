import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Event, EventCategory } from '../types'

interface UseEventsOptions {
  categories?: EventCategory[]
  timeFilter?: 'today' | 'this-week' | 'this-weekend' | 'all'
  status?: 'approved' | 'pending' | 'rejected'
}

export function useEvents(opts: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from('events').select('*')

    const status = opts.status ?? 'approved'
    query = query.eq('status', status)

    if (opts.categories && opts.categories.length > 0) {
      query = query.in('category', opts.categories)
    }

    const now = new Date()
    if (opts.timeFilter === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      query = query.gte('start_time', start.toISOString()).lte('start_time', end.toISOString())
    } else if (opts.timeFilter === 'this-week') {
      const end = new Date(now)
      end.setDate(end.getDate() + 7)
      query = query.gte('start_time', now.toISOString()).lte('start_time', end.toISOString())
    } else if (opts.timeFilter === 'this-weekend') {
      const day = now.getDay()
      const daysUntilSat = (6 - day + 7) % 7 || 7
      const sat = new Date(now)
      sat.setDate(now.getDate() + daysUntilSat)
      sat.setHours(0, 0, 0, 0)
      const sun = new Date(sat)
      sun.setDate(sat.getDate() + 1)
      sun.setHours(23, 59, 59, 999)
      query = query.gte('start_time', sat.toISOString()).lte('start_time', sun.toISOString())
    }

    query = query.order('start_time', { ascending: true })

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setEvents(data ?? [])
    }
    setLoading(false)
  }, [opts.categories?.join(','), opts.timeFilter, opts.status])

  useEffect(() => {
    fetchEvents()

    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data } = await supabase.from('events').select('*').eq('id', id).single()
  return data
}

export async function submitEvent(event: Omit<Event, 'id' | 'status' | 'created_at' | 'submitted_by'>, userId: string) {
  return supabase.from('events').insert({
    ...event,
    submitted_by: userId,
    status: 'pending',
  })
}

export async function updateEventStatus(id: string, status: 'approved' | 'rejected') {
  return supabase.from('events').update({ status }).eq('id', id)
}

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Event, FollowedLocation } from '../types'

export function useSavedEvents(userId: string | null) {
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set())
  const [savedEvents, setSavedEvents] = useState<Event[]>([])
  const [followedLocations, setFollowedLocations] = useState<FollowedLocation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSaved = useCallback(async () => {
    if (!userId) {
      setSavedEventIds(new Set())
      setSavedEvents([])
      setFollowedLocations([])
      return
    }
    setLoading(true)
    const [savedRes, locRes] = await Promise.all([
      supabase
        .from('saved_events')
        .select('event_id, events(*)')
        .eq('user_id', userId),
      supabase
        .from('followed_locations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ])
    const ids = new Set<string>()
    const evts: Event[] = []
    for (const row of savedRes.data ?? []) {
      ids.add(row.event_id)
      if (row.events) evts.push(row.events as unknown as Event)
    }
    setSavedEventIds(ids)
    setSavedEvents(evts)
    setFollowedLocations(locRes.data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  async function toggleSave(eventId: string) {
    if (!userId) return
    if (savedEventIds.has(eventId)) {
      await supabase.from('saved_events').delete().eq('user_id', userId).eq('event_id', eventId)
      setSavedEventIds(prev => { const s = new Set(prev); s.delete(eventId); return s })
      setSavedEvents(prev => prev.filter(e => e.id !== eventId))
    } else {
      await supabase.from('saved_events').insert({ user_id: userId, event_id: eventId })
      setSavedEventIds(prev => new Set([...prev, eventId]))
      fetchSaved()
    }
  }

  async function followLocation(loc: Omit<FollowedLocation, 'id' | 'user_id' | 'created_at'>) {
    if (!userId) return
    await supabase.from('followed_locations').insert({ ...loc, user_id: userId })
    fetchSaved()
  }

  async function unfollowLocation(id: string) {
    if (!userId) return
    await supabase.from('followed_locations').delete().eq('id', id)
    setFollowedLocations(prev => prev.filter(l => l.id !== id))
  }

  return { savedEventIds, savedEvents, followedLocations, loading, toggleSave, followLocation, unfollowLocation }
}

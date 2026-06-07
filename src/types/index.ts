export type EventCategory = 'music' | 'sports' | 'food' | 'arts' | 'community' | 'other'
export type EventStatus = 'pending' | 'approved' | 'rejected'

export interface Event {
  id: string
  name: string
  description: string | null
  category: EventCategory
  start_time: string
  end_time: string | null
  latitude: number
  longitude: number
  location_name: string
  venue_name: string | null
  image_url: string | null
  submitted_by: string | null
  status: EventStatus
  created_at: string
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface SavedEvent {
  user_id: string
  event_id: string
  saved_at: string
  event?: Event
}

export interface FollowedLocation {
  id: string
  user_id: string
  location_name: string
  latitude: number
  longitude: number
  created_at: string
}

export const CATEGORIES: { value: EventCategory; label: string; color: string; emoji: string }[] = [
  { value: 'music',     label: 'Music',     color: '#a855f7', emoji: '🎵' },
  { value: 'sports',    label: 'Sports',    color: '#3b82f6', emoji: '⚽' },
  { value: 'food',      label: 'Food',      color: '#f97316', emoji: '🍕' },
  { value: 'arts',      label: 'Arts',      color: '#ec4899', emoji: '🎨' },
  { value: 'community', label: 'Community', color: '#22c55e', emoji: '🤝' },
  { value: 'other',     label: 'Other',     color: '#64748b', emoji: '📍' },
]

export function getCategoryMeta(category: EventCategory) {
  return CATEGORIES.find(c => c.value === category) ?? CATEGORIES[5]
}

export function formatEventTime(start: string, end?: string | null): string {
  const s = new Date(start)
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
  const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  const dateStr = s.toLocaleDateString('en-US', dateOpts)
  const startStr = s.toLocaleTimeString('en-US', timeOpts)
  if (!end) return `${dateStr} · ${startStr}`
  const e = new Date(end)
  const endStr = e.toLocaleTimeString('en-US', timeOpts)
  return `${dateStr} · ${startStr} – ${endStr}`
}

import { X, Bookmark, BookmarkCheck, MapPin, Clock, Tag, Heart, ExternalLink } from 'lucide-react'
import type { Event, FollowedLocation } from '../../types'
import { getCategoryMeta, formatEventTime } from '../../types'

interface EventDetailProps {
  event: Event
  isSaved: boolean
  isAuthenticated: boolean
  followedLocations: FollowedLocation[]
  onClose: () => void
  onToggleSave: (eventId: string) => void
  onFollowLocation: (loc: Omit<FollowedLocation, 'id' | 'user_id' | 'created_at'>) => void
  onUnfollowLocation: (id: string) => void
  onSignInRequired: () => void
}

export function EventDetail({
  event,
  isSaved,
  isAuthenticated,
  followedLocations,
  onClose,
  onToggleSave,
  onFollowLocation,
  onUnfollowLocation,
  onSignInRequired,
}: EventDetailProps) {
  const meta = getCategoryMeta(event.category)

  const followedLoc = followedLocations.find(
    l => l.location_name === event.location_name
  )
  const isFollowed = Boolean(followedLoc)

  function handleFollowToggle() {
    if (!isAuthenticated) { onSignInRequired(); return }
    if (isFollowed && followedLoc) {
      onUnfollowLocation(followedLoc.id)
    } else {
      onFollowLocation({
        location_name: event.location_name,
        latitude: event.latitude,
        longitude: event.longitude,
      })
    }
  }

  function handleSave() {
    if (!isAuthenticated) { onSignInRequired(); return }
    onToggleSave(event.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Image / color header */}
        <div
          className="relative h-36 sm:h-48 shrink-0"
          style={{ background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)` }}
        >
          {event.image_url && (
            <img
              src={event.image_url}
              alt={event.name}
              className="w-full h-full object-cover opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: meta.color + '33', color: meta.color, border: `1px solid ${meta.color}44` }}
            >
              {meta.emoji} {meta.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-xl font-bold text-white mb-1 leading-tight">{event.name}</h2>

          <div className="space-y-2.5 mt-3 mb-4">
            <div className="flex items-start gap-2.5 text-slate-400 text-sm">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
              <span>{formatEventTime(event.start_time, event.end_time)}</span>
            </div>
            <div className="flex items-start gap-2.5 text-slate-400 text-sm">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
              <div>
                {event.venue_name && (
                  <p className="text-slate-200 font-medium">{event.venue_name}</p>
                )}
                <p>{event.location_name}</p>
              </div>
            </div>
            {event.category && (
              <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                <Tag className="w-4 h-4 shrink-0 text-teal-500" />
                <span>{meta.label}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4">
              {event.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 p-4 border-t border-slate-800 flex gap-3">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isSaved
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-teal-500/50 hover:text-teal-400'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={handleFollowToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isFollowed
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-pink-500/50 hover:text-pink-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFollowed ? 'fill-current' : ''}`} />
            {isFollowed ? 'Following' : 'Follow venue'}
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Maps
          </a>
        </div>
      </div>
    </div>
  )
}

import { Bookmark, BookmarkCheck, Clock, MapPin } from 'lucide-react'
import type { Event } from '../../types'
import { getCategoryMeta, formatEventTime } from '../../types'

interface EventCardProps {
  event: Event
  isSaved: boolean
  isAuthenticated: boolean
  onSelect: (event: Event) => void
  onToggleSave: (eventId: string) => void
  compact?: boolean
}

export function EventCard({ event, isSaved, isAuthenticated, onSelect, onToggleSave, compact }: EventCardProps) {
  const meta = getCategoryMeta(event.category)

  return (
    <div
      onClick={() => onSelect(event)}
      className={`group relative bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl cursor-pointer transition-all ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category color dot */}
        <div
          className={`shrink-0 rounded-lg flex items-center justify-center text-base ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
          style={{ backgroundColor: meta.color + '22', border: `1px solid ${meta.color}44` }}
        >
          {meta.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-slate-100 group-hover:text-white truncate leading-tight ${compact ? 'text-sm' : ''}`}>
            {event.name}
          </h3>
          <div className={`flex items-center gap-1 text-slate-500 mt-0.5 ${compact ? 'text-xs' : 'text-xs'}`}>
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{formatEventTime(event.start_time, event.end_time)}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{event.venue_name ?? event.location_name}</span>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={e => { e.stopPropagation(); onToggleSave(event.id) }}
            className="shrink-0 text-slate-600 hover:text-teal-400 transition-colors p-1 -mr-1"
            title={isSaved ? 'Unsave' : 'Save event'}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 text-teal-400" />
              : <Bookmark className="w-4 h-4" />
            }
          </button>
        )}
      </div>

      {/* Category badge */}
      <div
        className={`absolute top-3 right-3 ${compact ? 'hidden' : 'hidden sm:flex'} items-center`}
      />
    </div>
  )
}

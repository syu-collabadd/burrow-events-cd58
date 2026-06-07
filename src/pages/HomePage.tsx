import { useState, useCallback } from 'react'
import { ChevronUp, ChevronDown, Loader2, MapPin } from 'lucide-react'
import { MapView } from '../components/Map/MapView'
import { FilterPanel } from '../components/Filters/FilterPanel'
import { EventCard } from '../components/Events/EventCard'
import { EventDetail } from '../components/Events/EventDetail'
import { useEvents } from '../hooks/useEvents'
import type { Event, EventCategory, FollowedLocation } from '../types'

type TimeFilter = 'all' | 'today' | 'this-week' | 'this-weekend'

interface HomePageProps {
  userId: string | null
  savedEventIds: Set<string>
  followedLocations: FollowedLocation[]
  onToggleSave: (id: string) => void
  onFollowLocation: (loc: Omit<FollowedLocation, 'id' | 'user_id' | 'created_at'>) => void
  onUnfollowLocation: (id: string) => void
  onSignInRequired: () => void
}

export function HomePage({
  userId,
  savedEventIds,
  followedLocations,
  onToggleSave,
  onFollowLocation,
  onUnfollowLocation,
  onSignInRequired,
}: HomePageProps) {
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([])
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [sheetExpanded, setSheetExpanded] = useState(false)

  const { events, loading } = useEvents({
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    timeFilter,
  })

  const handleEventSelect = useCallback((event: Event) => {
    setSelectedEvent(event)
    setSheetExpanded(false)
  }, [])

  return (
    <div className="relative w-full h-full flex">
      {/* Map — fills everything */}
      <div className="absolute inset-0">
        <MapView
          events={events}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-400 text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading events…
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex absolute right-0 top-0 bottom-0 z-20 w-80 flex-col pointer-events-none">
        <div className="flex flex-col h-full pointer-events-auto pt-16 pb-4 pr-4">
          <div className="flex-1 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <FilterPanel
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              eventCount={events.length}
            />
            <div className="flex-1 overflow-y-auto border-t border-slate-800">
              {events.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <MapPin className="w-8 h-8 text-slate-700" />
                  <p className="text-slate-500 text-sm">No events found for these filters</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isSaved={savedEventIds.has(event.id)}
                      isAuthenticated={Boolean(userId)}
                      onSelect={handleEventSelect}
                      onToggleSave={onToggleSave}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div
        className={`lg:hidden absolute left-0 right-0 bottom-0 z-20 bg-slate-900/98 backdrop-blur border-t border-slate-800 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          sheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-76px)]'
        }`}
        style={{ maxHeight: '75vh' }}
      >
        {/* Sheet handle */}
        <div
          className="flex flex-col items-center pt-2 pb-1 cursor-pointer"
          onClick={() => setSheetExpanded(e => !e)}
        >
          <div className="w-10 h-1 rounded-full bg-slate-700 mb-2" />
          <div className="flex items-center justify-between w-full px-4 pb-2">
            <span className="text-sm font-semibold text-slate-200">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </span>
            {sheetExpanded
              ? <ChevronDown className="w-4 h-4 text-slate-500" />
              : <ChevronUp className="w-4 h-4 text-slate-500" />
            }
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 60px)' }}>
          <FilterPanel
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            eventCount={events.length}
          />

          <div className="border-t border-slate-800 px-3 pb-4 pt-2 space-y-2">
            {events.length === 0 && !loading ? (
              <p className="text-slate-500 text-sm text-center py-4">No events match your filters</p>
            ) : (
              events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSaved={savedEventIds.has(event.id)}
                  isAuthenticated={Boolean(userId)}
                  onSelect={e => { handleEventSelect(e); setSheetExpanded(false) }}
                  onToggleSave={onToggleSave}
                  compact
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          isSaved={savedEventIds.has(selectedEvent.id)}
          isAuthenticated={Boolean(userId)}
          followedLocations={followedLocations}
          onClose={() => setSelectedEvent(null)}
          onToggleSave={onToggleSave}
          onFollowLocation={onFollowLocation}
          onUnfollowLocation={onUnfollowLocation}
          onSignInRequired={onSignInRequired}
        />
      )}
    </div>
  )
}

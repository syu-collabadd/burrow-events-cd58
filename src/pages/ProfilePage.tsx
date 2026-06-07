import { User, Bookmark, Heart, LogOut, MapPin, Clock, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Event, FollowedLocation, Profile } from '../types'
import type { User as SupaUser } from '@supabase/supabase-js'
import { getCategoryMeta, formatEventTime } from '../types'

interface ProfilePageProps {
  user: SupaUser | null
  profile: Profile | null
  savedEvents: Event[]
  followedLocations: FollowedLocation[]
  onToggleSave: (id: string) => void
  onUnfollowLocation: (id: string) => void
  onSignOut: () => void
}

export function ProfilePage({
  user,
  profile,
  savedEvents,
  followedLocations,
  onToggleSave,
  onUnfollowLocation,
  onSignOut,
}: ProfilePageProps) {
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-12 h-12 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">Sign in to see your profile</h2>
        <p className="text-slate-500 text-sm mb-6">Save events and follow locations to track what matters to you.</p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-xl text-sm transition-colors"
        >
          Browse events
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">My Profile</h1>
        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* User card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <User className="w-7 h-7 text-teal-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{profile?.username ?? 'Explorer'}</p>
            <p className="text-slate-500 text-sm">{user.email}</p>
            {profile?.role === 'admin' && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Saved events */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-teal-400" />
            <h2 className="text-slate-200 font-semibold">Saved Events</h2>
            <span className="text-xs text-slate-600 ml-auto">{savedEvents.length}</span>
          </div>

          {savedEvents.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <p className="text-slate-500 text-sm">No saved events yet. Tap the bookmark icon on any event.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedEvents.map(event => {
                const meta = getCategoryMeta(event.category)
                return (
                  <div
                    key={event.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: meta.color + '22', border: `1px solid ${meta.color}44` }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-100 font-semibold text-sm truncate">{event.name}</p>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatEventTime(event.start_time, event.end_time)}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {event.venue_name ?? event.location_name}
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleSave(event.id)}
                      className="shrink-0 text-teal-400 hover:text-slate-400 transition-colors"
                      title="Unsave"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Followed locations */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-pink-400" />
            <h2 className="text-slate-200 font-semibold">Followed Locations</h2>
            <span className="text-xs text-slate-600 ml-auto">{followedLocations.length}</span>
          </div>

          {followedLocations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <p className="text-slate-500 text-sm">No followed locations yet. Follow venues from event detail pages.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {followedLocations.map(loc => (
                <div
                  key={loc.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="flex-1 text-slate-200 text-sm font-medium truncate">{loc.location_name}</p>
                  <button
                    onClick={() => onUnfollowLocation(loc.id)}
                    className="text-pink-400 hover:text-slate-400 transition-colors"
                    title="Unfollow"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit CTA */}
        <Link
          to="/submit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:text-teal-300 rounded-xl text-sm font-medium transition-all"
        >
          <MapPin className="w-4 h-4" />
          Submit an event
        </Link>
      </div>
    </div>
  )
}

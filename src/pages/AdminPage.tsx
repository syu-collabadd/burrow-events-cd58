import { useState } from 'react'
import { ArrowLeft, Check, X, Shield, Clock, MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEvents, updateEventStatus } from '../hooks/useEvents'
import { getCategoryMeta, formatEventTime } from '../types'
import type { Profile } from '../types'

interface AdminPageProps {
  profile: Profile | null
}

export function AdminPage({ profile }: AdminPageProps) {
  const navigate = useNavigate()
  const { events: pending, loading, refetch } = useEvents({ status: 'pending' })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-12 h-12 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">Admin only</h2>
        <p className="text-slate-500 text-sm mb-6">You don't have permission to view this page.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-xl text-sm transition-colors"
        >
          Back to map
        </button>
      </div>
    )
  }

  async function handleAction(eventId: string, action: 'approved' | 'rejected') {
    setActionLoading(eventId)
    const { error } = await updateEventStatus(eventId, action)
    setActionLoading(null)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage(action === 'approved' ? 'Event approved and live on the map!' : 'Event rejected.')
      refetch()
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">{pending.length} pending event{pending.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading submissions…
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Check className="w-10 h-10 text-teal-500/50" />
            <p className="text-slate-400 font-medium">No pending submissions</p>
            <p className="text-slate-600 text-sm">New events will appear here for review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(event => {
              const meta = getCategoryMeta(event.category)
              const isProcessing = actionLoading === event.id
              return (
                <div
                  key={event.id}
                  className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-opacity ${
                    isProcessing ? 'opacity-50' : ''
                  }`}
                >
                  {/* Event header */}
                  <div className="p-4 border-b border-slate-800">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: meta.color + '22', border: `1px solid ${meta.color}44` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm">{event.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatEventTime(event.start_time, event.end_time)}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <MapPin className="w-3 h-3" />
                          {event.venue_name ? `${event.venue_name} · ` : ''}{event.location_name}
                        </div>
                      </div>
                      <span
                        className="shrink-0 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: meta.color + '22', color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-slate-400 text-xs leading-relaxed">{event.description}</p>
                    </div>
                  )}

                  {/* Location coordinates */}
                  <div className="px-4 py-2.5 border-b border-slate-800 flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Lat: <span className="text-slate-400 font-mono">{event.latitude.toFixed(4)}</span></span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Lng: <span className="text-slate-400 font-mono">{event.longitude.toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 flex gap-2">
                    <button
                      onClick={() => handleAction(event.id, 'rejected')}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(event.id, 'approved')}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:text-teal-300 text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

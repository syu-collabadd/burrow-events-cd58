import { useState } from 'react'
import { ArrowLeft, CheckCircle, AlertCircle, MapPin, Calendar, Tag, FileText, Clock, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { submitEvent } from '../hooks/useEvents'
import { CATEGORIES, type EventCategory } from '../types'
import type { User as SupaUser } from '@supabase/supabase-js'

interface SubmitEventPageProps {
  user: SupaUser | null
  onSignInRequired: () => void
}

interface FormData {
  name: string
  description: string
  category: EventCategory
  start_time: string
  end_time: string
  latitude: string
  longitude: string
  location_name: string
  venue_name: string
  image_url: string
}

const DEFAULT_FORM: FormData = {
  name: '',
  description: '',
  category: 'other',
  start_time: '',
  end_time: '',
  latitude: '',
  longitude: '',
  location_name: '',
  venue_name: '',
  image_url: '',
}

export function SubmitEventPage({ user, onSignInRequired }: SubmitEventPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function update(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { onSignInRequired(); return }

    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Please enter valid latitude (−90 to 90) and longitude (−180 to 180) coordinates.')
      return
    }

    setLoading(true)
    const { error: err } = await submitEvent(
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        latitude: lat,
        longitude: lng,
        location_name: form.location_name.trim(),
        venue_name: form.venue_name.trim() || null,
        image_url: form.image_url.trim() || null,
      },
      user.id,
    )
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setForm(DEFAULT_FORM)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-12 h-12 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">Sign in to submit an event</h2>
        <p className="text-slate-500 text-sm mb-6">Create a free account to add events to the map.</p>
        <button
          onClick={onSignInRequired}
          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-xl text-sm transition-colors"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Submit an Event</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Event submitted!</h2>
              <p className="text-slate-400 text-sm max-w-xs">
                Your event is pending review. It'll appear on the map once an admin approves it.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSuccess(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                Submit another
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-sm font-semibold transition-colors"
              >
                Back to map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" /> Event name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Jazz Night at The Blue Room"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5" /> Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update('category', cat.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      form.category === cat.value
                        ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date/time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Start *
                </label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={e => update('start_time', e.target.value)}
                  required
                  className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  <Clock className="w-3.5 h-3.5" /> End
                </label>
                <input
                  type="datetime-local"
                  value={form.end_time}
                  onChange={e => update('end_time', e.target.value)}
                  min={form.start_time}
                  className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" /> Venue name
              </label>
              <input
                type="text"
                value={form.venue_name}
                onChange={e => update('venue_name', e.target.value)}
                placeholder="e.g. The Blue Room"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" /> Address / Location *
              </label>
              <input
                type="text"
                value={form.location_name}
                onChange={e => update('location_name', e.target.value)}
                placeholder="e.g. 123 Main St, Brooklyn, NY"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={e => update('latitude', e.target.value)}
                  placeholder="40.7128"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={e => update('longitude', e.target.value)}
                  placeholder="-74.0060"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600 -mt-3">
              Tip: right-click any location in Google Maps → "What's here?" to get coordinates.
            </p>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" /> Description
              </label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Tell people what to expect…"
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors resize-none"
              />
            </div>

            {/* Image */}
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={e => update('image_url', e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 pb-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-900 rounded-xl text-sm font-semibold transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit for review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

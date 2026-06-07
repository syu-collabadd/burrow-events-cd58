import { MapPin, Menu, X, User, PlusCircle, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { Profile } from '../../types'
import type { User as SupaUser } from '@supabase/supabase-js'

interface HeaderProps {
  user: SupaUser | null
  profile: Profile | null
  isAdmin: boolean
  onSignInClick: () => void
  onSignOut: () => void
}

export function Header({ user, profile, isAdmin, onSignInClick, onSignOut }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/' || location.pathname === '/burrow-events-cd58/'

  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 pointer-events-none">
      <Link
        to="/"
        className="flex items-center gap-2 pointer-events-auto select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg">
          <MapPin className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-lg text-white tracking-tight hidden sm:block">Burrow Events</span>
      </Link>

      <div className="flex items-center gap-2 pointer-events-auto">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>
        )}

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 backdrop-blur border border-amber-500/30 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}

        <Link
          to="/submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 text-slate-900 hover:bg-teal-400 text-sm font-semibold transition-colors shadow-lg"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Event</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => user ? setMenuOpen(m => !m) : onSignInClick()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-200 hover:text-white text-sm font-medium transition-colors"
          >
            {user ? (
              <>
                <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                  <User className="w-3 h-3 text-teal-400" />
                </div>
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          {menuOpen && user && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm text-slate-200 font-medium truncate">{profile?.username ?? user.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <Link
                to="/submit"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Event
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { onSignOut(); setMenuOpen(false) }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors border-t border-slate-800"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

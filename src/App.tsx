import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { AuthModal } from './components/Auth/AuthModal'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { SubmitEventPage } from './pages/SubmitEventPage'
import { AdminPage } from './pages/AdminPage'
import { useAuth } from './hooks/useAuth'
import { useSavedEvents } from './hooks/useSavedEvents'

function AppInner() {
  const [showAuth, setShowAuth] = useState(false)
  const { user, profile, loading, isAdmin, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth()
  const { savedEventIds, savedEvents, followedLocations, toggleSave, followLocation, unfollowLocation } = useSavedEvents(user?.id ?? null)

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center animate-pulse">
            <span className="text-xl">📍</span>
          </div>
          <p className="text-slate-600 text-sm">Loading Burrow Events…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Header
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onSignInClick={() => setShowAuth(true)}
        onSignOut={signOut}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              userId={user?.id ?? null}
              savedEventIds={savedEventIds}
              followedLocations={followedLocations}
              onToggleSave={toggleSave}
              onFollowLocation={followLocation}
              onUnfollowLocation={unfollowLocation}
              onSignInRequired={() => setShowAuth(true)}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              user={user}
              profile={profile}
              savedEvents={savedEvents}
              followedLocations={followedLocations}
              onToggleSave={toggleSave}
              onUnfollowLocation={unfollowLocation}
              onSignOut={signOut}
            />
          }
        />
        <Route
          path="/submit"
          element={
            <SubmitEventPage
              user={user}
              onSignInRequired={() => setShowAuth(true)}
            />
          }
        />
        <Route
          path="/admin"
          element={<AdminPage profile={profile} />}
        />
      </Routes>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSignInEmail={async (e, p) => {
            const res = await signInWithEmail(e, p)
            if (!res.error) setShowAuth(false)
            return { error: res.error }
          }}
          onSignUpEmail={async (e, p) => {
            const res = await signUpWithEmail(e, p)
            return { error: res.error }
          }}
          onSignInGoogle={() => { signInWithGoogle(); setShowAuth(false) }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/burrow-events-cd58">
      <AppInner />
    </BrowserRouter>
  )
}

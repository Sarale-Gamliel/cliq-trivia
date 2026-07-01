import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Auth from './Auth.jsx'
import Dashboard from './Dashboard.jsx'
import Footer from './Footer.jsx'
import PlayerApp from './PlayerApp.jsx'
import { supabase } from './supabaseClient'
import './index.css'

function DashboardPage({ session, isGuest, sessionChecked, onShowAuth }) {
  if (!sessionChecked) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0ddd8' }}>
      <div className="text-3xl font-black animate-pulse" style={{ color: '#ef9098', letterSpacing: '-0.05em' }}>
        CL<span style={{ color: '#1e1535' }}>I</span>Q
      </div>
    </div>
  );
  if (!session || isGuest) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen" style={{ background: '#f0ddd8' }} dir="rtl">
      <Dashboard
        session={session}
        isGuest={isGuest}
        onShowAuth={onShowAuth}
        onClose={() => window.location.href = '/'}
        onPlay={() => window.location.href = '/'}
      />
      <div className="px-4 md:px-6 lg:px-8 pb-8"><Footer /></div>
    </div>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { setIsGuest(false); setShowAuthModal(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join"           element={<PlayerApp />} />
        <Route path="/join/:roomCode" element={<PlayerApp />} />
        <Route path="/dashboard" element={
          <DashboardPage session={session} isGuest={isGuest} sessionChecked={sessionChecked} onShowAuth={() => setShowAuthModal(true)} />
        } />
        <Route path="/*" element={
          <>
            <App
              session={session}
              isGuest={isGuest}
              onExitGuest={() => setIsGuest(false)}
              onShowAuth={() => setShowAuthModal(true)}
            />
            {showAuthModal && !session && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" dir="rtl">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
                <div className="relative w-full max-w-md">
                  <Auth onGuestLogin={() => { setIsGuest(true); setShowAuthModal(false); }} compact />
                </div>
              </div>
            )}
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

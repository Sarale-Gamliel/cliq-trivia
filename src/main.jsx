import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Auth from './Auth.jsx'
import PlayerApp from './PlayerApp.jsx'
import { supabase } from './supabaseClient'
import './index.css'

function Root() {
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { setIsGuest(false); setShowAuthModal(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400" dir="rtl">
        טוען...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join"           element={<PlayerApp />} />
        <Route path="/join/:roomCode" element={<PlayerApp />} />
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
                <div
                  className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => setShowAuthModal(false)}
                />
                <div className="relative w-full max-w-md">
                  <Auth
                    onGuestLogin={() => { setIsGuest(true); setShowAuthModal(false); }}
                    compact
                  />
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

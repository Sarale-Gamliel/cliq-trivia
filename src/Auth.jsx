import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { LogIn, UserPlus, Eye, EyeOff, UserX } from 'lucide-react';

const C = {
  pink:      '#ef9098',
  pinkLight: '#f5c5be',
  peach:     '#fce5d8',
  mint:      '#c5d9d2',
  dark:      '#1e1535',
  mid:       '#6b6580',
  bg:        '#fffef9',
};

function Auth({ onGuestLogin, compact = false }) {
  const [isSignUp, setIsSignUp]         = useState(false);
  const [firstName, setFirstName]       = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState('');

  const handleSignUp = async () => {
    if (!firstName.trim()) { setMessage('נא להזין שם פרטי'); return; }
    setLoading(true); setMessage('');
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: firstName } },
    });
    if (error) setMessage('שגיאה בהרשמה: ' + error.message);
    else { setMessage('נרשמת בהצלחה! אפשר להתחבר עכשיו.'); setIsSignUp(false); }
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true); setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage('שגיאה בהתחברות: ' + error.message); setLoading(false); }
    else window.location.href = '/dashboard';
  };

  return (
    <div className={compact ? '' : 'min-h-screen flex items-center justify-center p-4'} dir="rtl"
      style={{ background: compact ? 'transparent' : C.bg }}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white"
        style={{ boxShadow: '0 20px 60px rgba(239,144,152,0.22)', border: `1px solid ${C.pinkLight}` }}>

        {/* 4-color ribbon */}
        <div className="h-1.5 flex">
          <div className="flex-1" style={{ background: C.mint }} />
          <div className="flex-1" style={{ background: C.peach }} />
          <div className="flex-1" style={{ background: C.pinkLight }} />
          <div className="flex-1" style={{ background: C.pink }} />
        </div>

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl" style={{ background: C.peach }}>
              <span className="text-3xl">🎤</span>
            </div>
            <h1 className="text-2xl font-black" style={{ color: C.dark }}>
              CL<span style={{ color: C.pink }}>I</span>Q TRIVIA
            </h1>
            <p className="text-sm" style={{ color: C.mid }}>
              {isSignUp ? 'יצירת חשבון חדש' : 'התחברי כדי לנהל את מאגרי השאלות שלך'}
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-bold block mb-1.5" style={{ color: C.mid }}>שם פרטי</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="השם שלך"
                  className="w-full rounded-xl px-4 py-3 text-sm transition focus:outline-none"
                  style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                  onFocus={e => e.target.style.borderColor = C.pink}
                  onBlur={e => e.target.style.borderColor = C.pinkLight}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: C.mid }}>אימייל</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl px-4 py-3 text-sm transition focus:outline-none"
                style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                onFocus={e => e.target.style.borderColor = C.pink}
                onBlur={e => e.target.style.borderColor = C.pinkLight}
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: C.mid }}>סיסמה</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pl-12 text-sm transition focus:outline-none"
                  style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                  onFocus={e => e.target.style.borderColor = C.pink}
                  onBlur={e => e.target.style.borderColor = C.pinkLight}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition"
                  style={{ color: C.mid }}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className="text-sm text-center rounded-xl p-3 font-medium"
              style={{ background: C.peach, color: '#8b3050', border: `1px solid ${C.pinkLight}` }}>
              {message}
            </div>
          )}

          {/* Primary action */}
          <button onClick={isSignUp ? handleSignUp : handleSignIn} disabled={loading}
            className="w-full text-white font-black py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            style={{
              background: `linear-gradient(135deg, ${C.pink}, #e05878)`,
              boxShadow: '0 8px 20px rgba(239,144,152,0.35)',
            }}>
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {isSignUp ? 'הרשמה' : 'התחברות'}
          </button>

          <div className="text-center text-sm" style={{ color: C.mid }}>
            {isSignUp ? 'כבר יש לך חשבון?' : 'אין לך עדיין חשבון?'}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
              className="font-bold transition" style={{ color: C.pink }}
              onMouseEnter={e => e.currentTarget.style.color = '#c05070'}
              onMouseLeave={e => e.currentTarget.style.color = C.pink}>
              {isSignUp ? 'התחברי' : 'הירשמי'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#f0ebe8' }} />
            <span className="text-xs font-bold" style={{ color: '#d0c8d0' }}>או</span>
            <div className="flex-1 h-px" style={{ background: '#f0ebe8' }} />
          </div>

          {/* Guest login */}
          <button onClick={onGuestLogin}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition text-sm hover:scale-[1.01]"
            style={{ background: C.peach, color: C.dark, border: `1px solid ${C.pinkLight}` }}
            onMouseEnter={e => e.currentTarget.style.background = C.pinkLight}
            onMouseLeave={e => e.currentTarget.style.background = C.peach}>
            <UserX className="h-4 w-4" />
            כנס כאורח
          </button>
          <p className="text-center text-xs -mt-2" style={{ color: '#c0b8c0' }}>
            ללא שמירת מאגר שאלות · לא נדרש מייל
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;

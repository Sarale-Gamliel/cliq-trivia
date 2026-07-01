import React, { useState } from 'react';
import { Sparkles, UserCircle, LogOut, Phone, Send, X, Menu, Star } from 'lucide-react';
import { supabase } from './supabaseClient';

const PHONE_NUMBER = "077-333-8748";
const WA_NUMBER    = "972559896806";

const C = {
  mint:      '#c5d9d2',
  peach:     '#fce5d8',
  pinkLight: '#f5c5be',
  pink:      '#ef9098',
  dark:      '#1e1535',
  mid:       '#6b6580',
  bg:        '#f0ddd8',
};

/* ─── Booking Modal ─── */
function BookingModal({ onClose }) {
  const [form, setForm] = useState({ name: '', event: '', date: '', guests: '', contact: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `שלום! אני מעוניין/ת בהזמנת משחק טריוויה לאירוע 🎉\n\nשם: ${form.name}\nסוג אירוע: ${form.event}\nתאריך: ${form.date}\nמשתתפים: ${form.guests}\nיצירת קשר: ${form.contact}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
    onClose();
  };

  const fields = [
    { key: 'name',    label: 'שם מלא',        placeholder: 'ישראל ישראלי',            type: 'text' },
    { key: 'event',   label: 'סוג אירוע',       placeholder: 'חתונה / בר מצווה / חברה', type: 'text' },
    { key: 'date',    label: 'תאריך האירוע',     placeholder: '',                        type: 'date' },
    { key: 'guests',  label: 'מספר משתתפים',     placeholder: '50–500',                  type: 'text' },
    { key: 'contact', label: 'טלפון / אימייל',   placeholder: '050-000-0000',            type: 'text' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(239,144,152,0.25)' }}>
        <div className="h-1.5 flex">
          <div className="flex-1" style={{ background: C.mint }} />
          <div className="flex-1" style={{ background: C.peach }} />
          <div className="flex-1" style={{ background: C.pinkLight }} />
          <div className="flex-1" style={{ background: C.pink }} />
        </div>
        <div className="p-5">
          <button onClick={onClose} className="absolute top-4 left-4 p-1.5 rounded-xl hover:bg-rose-50 transition" style={{ color: C.mid }}>
            <X className="h-4 w-4" />
          </button>
          <div className="text-center mb-4">
            <div className="inline-flex p-2.5 rounded-2xl mb-2" style={{ background: C.peach }}>
              <Star className="h-6 w-6" style={{ color: C.pink }} />
            </div>
            <h2 className="text-xl font-black" style={{ color: C.dark }}>טריוויה לאירוע שלכם! 🎉</h2>
            <p className="text-xs mt-0.5" style={{ color: C.mid }}>נבנה ביחד חוויה בלתי נשכחת</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold mb-1" style={{ color: C.mid }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm transition focus:outline-none"
                  style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                  onFocus={e => e.target.style.borderColor = C.pink}
                  onBlur={e => e.target.style.borderColor = C.pinkLight}
                />
              </div>
            ))}
            <button type="submit"
              className="relative w-full overflow-hidden text-white font-black py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg mt-1"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
              <Send className="h-4 w-4 relative" />
              <span className="relative">שלחו פנייה בוואטסאפ 💬</span>
            </button>
            <div className="flex items-center justify-center gap-2">
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 transition" style={{ color: '#10b981' }}>
                <Phone className="h-3 w-3" /> 055-989-6806
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Phone mockup — zip style with pink border + white card interior ─── */
function PhoneVisual() {
  const answers = [
    { n: '1', label: 'אפריקה',  bg: C.pink,      pct: 62 },
    { n: '2', label: 'אסיה',    bg: C.mint,      pct: 18 },
    { n: '3', label: 'אמריקה',  bg: '#a78bfa',   pct: 12 },
    { n: '4', label: 'אנטארקטיקה', bg: C.peach,  pct: 8  },
  ];
  const players = ['ש','מ','ד','ר','א','נ','י','ת'];
  return (
    <div className="relative mx-auto w-full max-w-sm select-none pointer-events-none">
      {/* Floating badges */}
      <div className="absolute -top-3 -right-5 z-10 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg animate-float"
        style={{ background: '#10b981', animationDelay: '0.3s', boxShadow: '0 4px 14px rgba(16,185,129,0.5)' }}>
        ✓ נכון!
      </div>
      <div className="absolute -bottom-3 -left-5 z-10 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg animate-float"
        style={{ background: C.pink, animationDelay: '0.9s', boxShadow: '0 4px 14px rgba(239,144,152,0.5)' }}>
        +750 נק׳
      </div>

      {/* Screen */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: C.dark, border: `2px solid rgba(239,144,152,0.25)`, boxShadow: `0 30px 70px rgba(30,21,53,0.55), 0 0 50px rgba(239,144,152,0.12)` }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-base font-black" style={{ color: C.pink, letterSpacing: '-0.05em' }}>
            CL<span className="text-white">I</span>Q
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
            <span className="text-[10px] font-black" style={{ color: '#10b981' }}>LIVE · שאלה 3/10</span>
          </div>
          {/* Timer */}
          <div className="h-8 w-8 flex items-center justify-center rounded-full"
            style={{ border: `2px solid ${C.pink}`, boxShadow: `0 0 10px rgba(239,144,152,0.4)` }}>
            <span className="text-sm font-black" style={{ color: C.pink }}>7</span>
          </div>
        </div>

        {/* Players row */}
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex -space-x-2 space-x-reverse">
            {players.map((p, i) => (
              <div key={i} className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 text-white"
                style={{ background: [C.pink, C.mint, '#a78bfa', C.peach, C.pinkLight, '#10b981', C.pink, C.mint][i], borderColor: C.dark }}>
                {p}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-white/50 mr-1">+36 מחייגים</span>
        </div>

        {/* Question */}
        <div className="px-4 pt-3 pb-2">
          <div className="rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <p className="font-black text-sm leading-snug text-white">מהי היבשת הגדולה ביותר בעולם לפי שטח יבשתי?</p>
          </div>
        </div>

        {/* Answers */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          {answers.map(a => (
            <div key={a.n} className="rounded-xl px-3 py-2.5 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${a.bg}40`, boxShadow: `0 0 10px ${a.bg}30` }}>
              <span className="h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 text-white"
                style={{ background: a.bg }}>
                {a.n}
              </span>
              <span className="text-xs font-bold text-white/90">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Answer distribution bar */}
        <div className="px-4 pb-1">
          <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
            {answers.map(a => (
              <div key={a.n} style={{ width: `${a.pct}%`, background: a.bg, opacity: 0.85 }} />
            ))}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            {answers.map(a => (
              <span key={a.n} className="text-[9px] font-bold" style={{ color: a.bg }}>{a.pct}%</span>
            ))}
          </div>
        </div>

        {/* Bottom scores */}
        <div className="flex gap-1.5 px-4 pb-3 pt-1 overflow-hidden">
          {[{n:'שרה',s:1240},{n:'דנה',s:980},{n:'מיכל',s:870}].map((p,i) => (
            <div key={i} className="flex-1 rounded-xl px-2 py-1.5 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[9px] text-white/50 font-medium">{p.n}</div>
              <div className="text-xs font-black" style={{ color: [C.pink, C.mint, '#a78bfa'][i] }}>{p.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Glow behind */}
      <div className="absolute -bottom-8 -left-8 -z-10 h-36 w-36 rounded-full blur-3xl" style={{ background: C.pink, opacity: 0.25 }} />
      <div className="absolute -top-8 -right-8 -z-10 h-36 w-36 rounded-full blur-3xl" style={{ background: C.mint, opacity: 0.25 }} />
    </div>
  );
}

/* ─── Main Header ─── */
function DemoModal({ onClose }) {
  const questions = [
    { q: 'מה הבירה הכי נמכרת בעולם?', opts: ['בדוויזר', 'היינקן', 'קורונה', 'גינס'], correct: 0 },
    { q: 'כמה צלעות יש לשושנית?', opts: ['4', '5', '6', '8'], correct: 2 },
    { q: 'מי כתב את "הנסיך הקטן"?', opts: ['וייל', 'אנטואן דה סנט-אקזופרי', 'קפקא', 'מאן'], correct: 1 },
  ];
  const [qi, setQi] = useState(0);
  const [picked, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const q = questions[qi];
  const done = qi >= questions.length;

  const handlePick = (i) => {
    if (picked !== null) return;
    setPick(i);
    if (i === q.correct) setScore(s => s + 750);
    setTimeout(() => { setPick(null); setQi(qi + 1); }, 1200);
  };

  const colors = ['#ef4444','#3b82f6','#f59e0b','#10b981'];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#1e1535' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="font-black text-white">🎮 נסה עכשיו — CLIQ Demo</span>
          <button onClick={onClose} className="text-white/50 hover:text-white transition text-xl">✕</button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <div className="text-2xl font-black text-white mb-2">סיימת!</div>
            <div className="text-3xl font-black mb-4" style={{ color: '#ef9098' }}>{score} נק׳</div>
            <p className="text-white/60 text-sm mb-6">זו בדיוק החוויה שיקבל הקהל שלך באירוע.</p>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl font-black text-white transition hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #ef9098, #c05070)' }}>
              אני רוצה לארגן אירוע!
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between text-xs text-white/50 mb-4">
              <span>שאלה {qi+1}/{questions.length}</span>
              <span style={{ color: '#ef9098' }}>{score} נק׳</span>
            </div>
            <div className="rounded-2xl p-4 text-center mb-5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="font-black text-white text-lg leading-snug">{q.q}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {q.opts.map((opt, i) => (
                <button key={i} onClick={() => handlePick(i)}
                  className="rounded-2xl p-3 text-white font-bold text-sm transition hover:scale-[1.03] active:scale-95"
                  style={{
                    background: picked === null ? colors[i] : i === q.correct ? '#10b981' : picked === i ? '#ef4444' : `${colors[i]}55`,
                    opacity: picked !== null && i !== q.correct && picked !== i ? 0.5 : 1,
                    transition: 'all 0.3s',
                  }}>
                  <div className="text-2xl font-black mb-1">{i+1}</div>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ userName, onHome, showHero = false, session, isGuest, onShowAuth, onOpenDashboard }) {
  const [showBooking, setShowBooking] = useState(false);
  const [showDemo, setShowDemo]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const navLinks = [
    { label: 'איך זה עובד',  href: '#steps',  icon: '⚡' },
    { label: 'סוגי אירועים', href: '#events', icon: '🎉' },
    { label: 'שאלות נפוצות', href: '#faq',    icon: '💬' },
  ];

  return (
    <>
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

      {/* ══ NAVBAR — only when no hero ══ */}
      {!showHero && (
      <header className="sticky top-0 z-50 w-full" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center gap-3 px-5 py-2.5 justify-between"
            style={{
              borderRadius: '9999px',
              border: '1px solid rgba(239,144,152,0.25)',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 2px 16px rgba(239,144,152,0.12)',
            }}>

            {/* Logo */}
            <button onClick={onHome} className="flex items-center gap-3 group shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm"
                style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)` }}>
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="text-xl font-black group-hover:opacity-80 transition-opacity"
                style={{ letterSpacing: '-0.05em', color: C.dark }}>
                CL<span style={{ color: C.pink }}>I</span>Q
              </span>
            </button>

            {/* Nav links — רק כשאין Hero */}
            {!showHero && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(link => (
                  <a key={link.href} href={link.href}
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all"
                    style={{ color: C.mid }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,144,152,0.12)'; e.currentTarget.style.color = C.pink; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.mid; }}>
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Actions — רק כשאין Hero */}
            {!showHero && (
              <div className="flex items-center gap-2 shrink-0">

              {/* כניסת מנחה */}
              <div className="relative group/host">
                <button onClick={onOpenDashboard}
                  className="inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-white px-5 py-2 transition-transform hover:scale-[1.03]"
                  style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 4px 14px rgba(239,144,152,0.3)' }}>
                  <UserCircle className="h-4 w-4" />
                  {session && !isGuest && userName ? userName : 'כניסת מנחה'}
                </button>
                {session && !isGuest && (
                  <div className="absolute top-full mt-2 left-0 bg-white border rounded-2xl overflow-hidden opacity-0 group-hover/host:opacity-100 pointer-events-none group-hover/host:pointer-events-auto transition-all z-50 min-w-[180px] shadow-xl"
                    style={{ borderColor: '#f0ebe8', boxShadow: '0 16px 40px rgba(239,144,152,0.18)' }}>
                    <div className="px-4 py-3 text-sm font-black text-center" style={{ color: C.dark, background: 'rgba(239,144,152,0.07)', borderBottom: '1px solid #f0ebe8' }}>
                      היי {userName} 👋
                    </div>
                    <div className="p-2">
                      <button onClick={() => supabase.auth.signOut()}
                        className="w-full flex items-center justify-center gap-2 font-bold py-2 rounded-xl text-xs transition"
                        style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}>
                        <LogOut className="h-4 w-4" /> התנתקות
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && showHero && (
            <div className="mt-2 flex flex-col gap-1 rounded-3xl p-3 md:hidden"
              style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(239,144,152,0.2)', backdropFilter: 'blur(12px)' }}>
              {navLinks.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium transition-colors"
                  style={{ color: C.dark }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,144,152,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {link.label}
                </a>
              ))}
              {!(session && !isGuest) && (
                <button onClick={() => { onShowAuth(); setMobileOpen(false); }}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-right transition"
                  style={{ color: C.pink }}>
                  כניסת מנחה
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      )}

      {/* ══ HERO ══ */}
      {showHero && (
        <section className="relative overflow-hidden" dir="rtl">

          {/* לוגו ענק מרוכז */}
          <div className="flex justify-center pt-3 pb-0">
            <button onClick={onHome} className="flex items-center gap-4 group">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
                style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 12px 32px rgba(239,144,152,0.4)' }}>
                <Sparkles className="h-10 w-10 text-white" />
              </span>
              <span className="text-6xl md:text-7xl font-black group-hover:opacity-90 transition-opacity"
                style={{ letterSpacing: '-0.04em', color: C.dark }}>
                CL<span style={{ color: C.pink }}>I</span>Q
              </span>
            </button>
          </div>
          {/* Soft color wash blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 right-0 h-96 w-96 rounded-full blur-3xl" style={{ background: C.peach, opacity: 0.55 }} />
            <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full blur-3xl" style={{ background: C.mint, opacity: 0.45 }} />
            <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-3xl" style={{ background: C.pinkLight, opacity: 0.3 }} />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-2 md:py-3 lg:grid-cols-2">

            {/* RIGHT: copy */}
            <div className="text-center lg:text-right space-y-5 lg:pr-24">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
                style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                ✨ טריוויה חיה לאירועים
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl" style={{ color: C.dark, letterSpacing: '-0.02em' }}>
                הופכים כל אירוע
                <br />
                <span style={{ color: C.pink }}>לחוויה אינטראקטיבית</span>
              </h1>

              <p className="mx-auto max-w-md text-lg leading-relaxed lg:mx-0" style={{ color: C.mid }}>
                יוצרים שעשועון חי, הקהל מצטרף מהטלפון — ועונה בזמן אמת. ללא התקנות, ללא סיבוך.
              </p>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-end text-sm">
                {['★★★★★', 'מאות משתתפים', 'כל גיל', 'כל אירוע'].map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full font-medium"
                    style={{ background: i === 0 ? '#fef3c7' : 'rgba(255,255,255,0.8)', color: i === 0 ? '#92400e' : C.mid, border: '1px solid rgba(239,144,152,0.2)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:justify-start justify-center">
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="relative overflow-hidden inline-flex items-center gap-2 rounded-2xl font-black px-8 py-4 text-white justify-center transition-transform hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 12px 28px rgba(16,185,129,0.3)', fontSize: '1.05rem' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current relative shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="relative">הזמנת אירוע</span>
                </a>
                <button onClick={onOpenDashboard}
                  className="inline-flex items-center gap-2 rounded-2xl font-black px-8 py-4 text-white justify-center transition-transform hover:scale-[1.03]"
                  style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 12px 28px rgba(239,144,152,0.3)', fontSize: '1.05rem' }}>
                  <UserCircle className="h-5 w-5" />
                  {session && !isGuest && userName ? `כניסה — ${userName}` : 'התחברות לחשבון'}
                </button>
              </div>
              <button onClick={() => setShowDemo(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold justify-center lg:justify-start transition hover:opacity-80"
                style={{ color: '#7c3aed' }}>
                🎮 נסה עכשיו בחינם ←
              </button>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {[
                  { label: 'חתונות',        bg: C.peach },
                  { label: 'בר / בת מצווה', bg: C.mint },
                  { label: 'אירועי חברה',   bg: C.pinkLight },
                  { label: 'ימי כיף',       bg: '#fef3c7' },
                  { label: 'ימי הולדת',     bg: '#e0f2fe' },
                ].map(({ label, bg }) => (
                  <span key={label} className="rounded-full px-4 py-1.5 text-sm font-medium" style={{ background: bg, color: C.dark }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* LEFT: Phone mockup */}
            <div className="hidden lg:flex items-center justify-center">
              <PhoneVisual />
            </div>

          </div>
        </section>
      )}
    </>
  );
}

export default Header;

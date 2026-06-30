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
    { n: '1', label: 'בדוויזר', bg: C.pink,      glow: 'rgba(239,144,152,0.6)' },
    { n: '2', label: 'היינקן',  bg: C.mint,      glow: 'rgba(197,217,210,0.6)' },
    { n: '3', label: 'קורונה',  bg: C.pinkLight, glow: 'rgba(245,197,190,0.6)' },
    { n: '4', label: 'גינס',    bg: C.peach,     glow: 'rgba(252,229,216,0.6)' },
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm select-none pointer-events-none">
      {/* Floating badges */}
      <div className="absolute -top-3 -right-4 z-10 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg animate-float"
        style={{ background: '#10b981', animationDelay: '0.3s', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
        ✓ נכון!
      </div>
      <div className="absolute -bottom-3 -left-4 z-10 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg animate-float"
        style={{ background: C.pink, animationDelay: '0.9s', boxShadow: '0 4px 12px rgba(239,144,152,0.4)' }}>
        +750 נק׳
      </div>

      {/* Screen frame */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: C.dark, border: `3px solid rgba(239,144,152,0.3)`, boxShadow: `0 30px 60px rgba(30,21,53,0.5), 0 0 40px rgba(239,144,152,0.15)` }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="flex items-center gap-1.5 text-[11px] font-black text-white/60">
            שאלה 3 / 10
          </span>
          <span className="text-base font-black" style={{ color: C.pink, letterSpacing: '-0.05em' }}>
            CL<span className="text-white">I</span>Q
          </span>
          <span className="flex items-center gap-1 text-[11px] font-black" style={{ color: '#10b981' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
            LIVE
          </span>
        </div>

        {/* Timer */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="relative h-14 w-14 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(239,144,152,0.12)', border: `2px solid ${C.pink}`, boxShadow: `0 0 16px rgba(239,144,152,0.3)` }}>
            <span className="text-2xl font-black" style={{ color: C.pink }}>7</span>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 pb-3">
          <div className="rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-black text-sm leading-snug text-white">מה הבירה הכי נמכרת בעולם?</p>
          </div>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
          {answers.map(a => (
            <div key={a.n} className="rounded-2xl px-3 py-3 flex items-center gap-2.5"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${a.bg}`, boxShadow: `0 0 12px ${a.glow}` }}>
              <span className="h-7 w-7 rounded-xl flex items-center justify-center text-sm font-black shrink-0 text-white"
                style={{ background: a.bg }}>
                {a.n}
              </span>
              <span className="text-xs font-bold text-white">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Player dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {[C.pink, C.mint, C.pinkLight, '#10b981', C.peach, C.pink].map((c, i) => (
            <div key={i} className="h-2 w-2 rounded-full" style={{ background: c, opacity: 0.8 }} />
          ))}
          <span className="text-white/40 text-[10px] mr-1">44 מחייגים</span>
        </div>
      </div>

      {/* Glow behind */}
      <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full blur-3xl" style={{ background: C.pink, opacity: 0.3 }} />
      <div className="absolute -top-6 -right-6 -z-10 h-32 w-32 rounded-full blur-3xl" style={{ background: C.mint, opacity: 0.3 }} />
    </div>
  );
}

/* ─── Main Header ─── */
function Header({ userName, onHome, showHero = false, session, isGuest, onShowAuth, onOpenDashboard }) {
  const [showBooking, setShowBooking] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const navLinks = [
    { label: 'איך זה עובד',    href: '#steps' },
    { label: 'סוגי אירועים',   href: '#events' },
    { label: 'שאלות נפוצות',   href: '#faq' },
  ];

  return (
    <>
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}

      {/* ══ NAVBAR — floating pill (zip design) ══ */}
      <header className="sticky top-0 z-50 w-full" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center gap-4 px-5 py-3"
            style={{
              borderRadius: '9999px',
              border: '1px solid rgba(239,144,152,0.25)',
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 2px 16px rgba(239,144,152,0.12)',
            }}>

            {/* RIGHT: Logo — flex-1 so center nav stays perfectly centered */}
            <div className="flex-1 flex items-center">
              <button onClick={onHome} className="flex items-center gap-2 group">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)` }}>
                  <Sparkles className="h-5 w-5 text-white" />
                </span>
                <span className="text-2xl font-black group-hover:opacity-80 transition-opacity" style={{ letterSpacing: '-0.05em', color: C.dark }}>
                  CL<span style={{ color: C.pink }}>I</span>Q
                </span>
              </button>
            </div>

            {/* CENTER: Nav links — always visible */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map(link => (
                <a key={link.href} href={link.href}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: C.mid }}
                  onMouseEnter={e => e.currentTarget.style.color = C.pink}
                  onMouseLeave={e => e.currentTarget.style.color = C.mid}>
                  {link.label}
                </a>
              ))}
            </nav>

            {/* LEFT: Actions — flex-1 justify-end mirrors the logo side */}
            <div className="flex-1 flex items-center justify-end gap-2">

              {/* כניסת מנחה / שם — always one button; hover shows logout when logged in */}
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

              {/* Mobile menu toggle (landing) */}
              {showHero && (
                <button onClick={() => setMobileOpen(v => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full md:hidden transition"
                  style={{ color: C.pink }}>
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
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

      {/* ══ HERO ══ */}
      {showHero && (
        <section className="relative overflow-hidden" dir="rtl">
          {/* Soft color wash blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 right-0 h-96 w-96 rounded-full blur-3xl" style={{ background: C.peach, opacity: 0.55 }} />
            <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full blur-3xl" style={{ background: C.mint, opacity: 0.45 }} />
            <div className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full blur-3xl" style={{ background: C.pinkLight, opacity: 0.3 }} />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 md:py-12 lg:grid-cols-2">

            {/* RIGHT: copy */}
            <div className="text-center lg:text-right space-y-5 lg:pr-24">
              <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl" style={{ color: C.dark, letterSpacing: '-0.02em' }}>
                חוויה בלתי נשכחת
                <br />
                <span style={{ color: C.pink }}>לכל אירוע</span>
              </h1>

              <p className="mx-auto max-w-md text-lg leading-relaxed lg:mx-0" style={{ color: C.mid }}>
                נכנסים בחיוג קצר, עונים בלייב, צוברים נקודות וחוויות.
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="relative overflow-hidden inline-flex items-center gap-2 rounded-full font-black px-7 py-4 text-white w-full sm:w-auto justify-center transition-transform hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 12px 28px rgba(16,185,129,0.3)' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                  <span className="relative text-xl leading-none">💬</span>
                  <span className="relative">לפרטים ב-WhatsApp</span>
                </a>
                <button onClick={() => setShowBooking(true)}
                  className="inline-flex items-center gap-2 rounded-full border px-7 py-4 text-base font-semibold w-full sm:w-auto justify-center transition-colors hover:opacity-80"
                  style={{ borderColor: 'rgba(239,144,152,0.3)', background: 'rgba(255,255,255,0.8)', color: C.pink }}>
                  הזמן אירוע
                </button>
              </div>

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

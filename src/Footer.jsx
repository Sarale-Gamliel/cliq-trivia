import React from 'react';
import { Mail, Phone } from 'lucide-react';

const WA_SVG = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const C = { dark: '#1e1535', mid: '#6b6580', pink: '#ef9098' };
const WA = '972559896806';

function Footer() {
  const columns = [
    {
      title: 'המוצר',
      links: [
        { label: 'איך זה עובד', href: '#steps' },
        { label: 'סוגי אירועים', href: '#events' },
        { label: 'שאלות נפוצות', href: '#faq' },
        { label: 'כניסת מנחה', href: '#', action: true },
      ],
    },
    {
      title: 'אירועים',
      links: [
        { label: 'חתונות', href: '#events' },
        { label: 'בר / בת מצווה', href: '#events' },
        { label: 'ימי גיבוש', href: '#events' },
        { label: 'ימי הולדת', href: '#events' },
        { label: 'אירועי חברה', href: '#events' },
      ],
    },
    {
      title: 'צרו קשר',
      links: [],
      contact: true,
    },
  ];

  return (
    <footer className="relative z-10 mt-16" dir="rtl">
      <div className="rounded-3xl overflow-hidden" style={{ background: '#1e1535' }}>

        {/* Top section */}
        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-black mb-3" style={{ letterSpacing: '-0.05em', color: '#fff' }}>
              CL<span style={{ color: C.pink }}>I</span>Q
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              הופכים כל אירוע לחוויה אינטראקטיבית בלתי נשכחת — בזמן אמת.
            </p>
            <div className="flex gap-3">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition hover:scale-105"
                style={{ background: '#10b981', color: '#fff' }}>
                <WA_SVG /> WhatsApp
              </a>
              <a href="mailto:saraledafna@gmail.com"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Mail className="h-3.5 w-3.5" /> מייל
              </a>
            </div>
          </div>

          {/* Links columns */}
          {columns.slice(0, 2).map((col, ci) => (
            <div key={ci}>
              <h4 className="text-sm font-black mb-4" style={{ color: '#fff' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a href={link.href}
                      className="text-sm transition hover:opacity-100"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                      onMouseEnter={e => e.currentTarget.style.color = C.pink}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-sm font-black mb-4" style={{ color: '#fff' }}>צרו קשר</h4>
            <div className="space-y-3">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <WA_SVG /> 055-989-6806
              </a>
              <a href="mailto:saraledafna@gmail.com"
                className="flex items-center gap-2 text-sm transition"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = C.pink}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <Mail className="h-4 w-4" /> saraledafna@gmail.com
              </a>
            </div>

            <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(239,144,152,0.1)', border: '1px solid rgba(239,144,152,0.2)' }}>
              <div className="text-xs font-bold mb-1" style={{ color: C.pink }}>מוכנים להתחיל?</div>
              <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>צרו קשר ונארגן את האירוע שלכם</div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="block text-center text-xs font-black py-2 rounded-xl transition hover:scale-[1.02]"
                style={{ background: C.pink, color: '#fff' }}>
                שליחת הודעה ב-WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-8 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} CLIQ Trivia · כל הזכויות שמורות לשרהלה גמליאל
          </div>
          <div className="flex gap-4">
            {['מדיניות פרטיות', 'תנאי שימוש', 'נגישות'].map(t => (
              <a key={t} href="#" className="text-xs transition"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

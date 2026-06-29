import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Sparkles, User, ShoppingBag, Settings, FolderOpen,
  Plus, Trash2, ArrowRight, Edit2, Check, Loader, LogOut, Wand2, ChevronDown, ChevronUp,
} from 'lucide-react';
import QuestionsManager from './QuestionsManager';

const C = {
  mint: '#c5d9d2', peach: '#fce5d8', pinkLight: '#f5c5be', pink: '#ef9098',
  dark: '#1e1535', mid: '#6b6580', bg: '#f0ddd8',
};

const TABS = [
  { id: 'topics',    label: 'מאגרי שאלות',      icon: FolderOpen },
  { id: 'profile',   label: 'פרטים אישיים',      icon: User },
  { id: 'purchases', label: 'היסטוריית רכישות',  icon: ShoppingBag },
  { id: 'settings',  label: 'הגדרות',             icon: Settings },
];

function LockedSection({ onShowAuth }) {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">🔒</div>
      <h3 className="text-lg font-black" style={{ color: C.dark }}>נדרשת כניסה</h3>
      <p className="text-sm" style={{ color: C.mid }}>יש להתחבר לחשבון כדי להשתמש בפיצ׳ר זה</p>
      <button
        onClick={onShowAuth}
        className="text-white font-bold px-6 py-3 rounded-xl transition hover:scale-[1.02]"
        style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 6px 16px rgba(239,144,152,0.35)' }}>
        התחבר / הירשם
      </button>
    </div>
  );
}

function Dashboard({ session, isGuest, onShowAuth, onClose, settings, onSettingsChange, userName: initName, onPlay }) {
  const [activeTab, setActiveTab] = useState('topics');
  const [openTopic, setOpenTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState({ first_name: initName || '', email: session?.user?.email || '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // AI Generator state
  const [showAI, setShowAI] = useState(false);
  const [aiDesc, setAiDesc] = useState('');
  const [aiCount, setAiCount] = useState(20);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiSaving, setAiSaving] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  const isLoggedIn = !!session && !isGuest;

  useEffect(() => {
    if (isLoggedIn) loadTopics();
  }, [isLoggedIn]);

  const loadTopics = async () => {
    setLoading(true);
    const { data } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
    if (data) setTopics(data);
    setLoading(false);
  };

  const addTopic = async () => {
    if (!newTopicName.trim()) return;
    setSaving(true);
    await supabase.from('topics').insert([{ name: newTopicName.trim() }]);
    setNewTopicName('');
    await loadTopics();
    setSaving(false);
  };

  const deleteTopic = async (id, name) => {
    if (!confirm(`למחוק את הנושא "${name}"?`)) return;
    await supabase.from('topics').delete().eq('id', id);
    await loadTopics();
  };

  const generateWithAI = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    setAiError('');

    const prompt = `אתה יוצר שאלות למשחק חברתי/משפחתי בישראל. השאלות הן לא טריוויה כללית — הן שאלות אישיות, מצחיקות ומביכות שמתאימות לקבוצה ספציפית.

הבקשה: "${aiDesc.trim()}"

דוגמאות לשאלות טובות (בסגנון הזה בדיוק):
❌ שאלה רעה (אל תעשה): "מהו היתרון העיקרי של משפחה מורחבת?" — זו שאלת טריוויה משעממת
✅ שאלה טובה: "מי הכי סביר לספר סיפור שהתארך ל-20 דקות בארוחת שישי?"
✅ שאלה טובה: "מה הדבר הכי מביך שיכול לקרות בנופש משפחתי?"
✅ שאלה טובה: "מי במשפחה בטוח שהוא הבשלן הכי טוב — גם כשהאוכל נשרף?"
✅ שאלה טובה: "איזה טיפוס הכי מתאר אותך בטיול משפחתי: ישן באוטובוס / מתלונן על החום / מצלם הכל / אוכל כל הזמן"

הוראות:
- שאלות בסגנון "מי הכי...", "מה היית עושה אם...", "איזה טיפוס אתה...", "מה הכי מביך..."
- תשובות מצחיקות ומזוהות — לא עובדות יבשות
- בעברית ישראלית מדוברת
- מתאימות לנושא שביקשו

צור בדיוק ${aiCount} שאלות כאלה.

החזר JSON תקין בלבד, ללא שום טקסט לפני או אחרי, במבנה המדויק:
[
  {
    "question": "מה השאלה?",
    "answer_1": "תשובה א",
    "answer_2": "תשובה ב",
    "answer_3": "תשובה ג",
    "answer_4": "תשובה ד",
    "correct_index": 1,
    "category": "קטגוריה",
    "difficulty": "easy"
  }
]

כללים:
- כל השאלות והתשובות בעברית
- correct_index הוא 1, 2, 3, או 4
- difficulty הוא "easy", "medium", או "hard"
- גוון בין רמות קושי
- JSON תקין בלבד, בלי הסברים`;

    const parseQuestions = (text) => {
      const t = text.trim();
      const start = t.indexOf('[');
      const end = t.lastIndexOf(']') + 1;
      if (start === -1 || end === 0) throw new Error('AI החזיר פורמט לא תקין');
      return JSON.parse(t.slice(start, end));
    };

    try {
      const serverRes = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description: aiDesc, count: aiCount }),
      });
      const ct = serverRes.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error('שגיאת שרת — נסי שוב');
      const data = await serverRes.json();
      if (data?.questions?.length) {
        setAiResult(data.questions);
        return;
      }
      if (data?.error?.includes('429') || serverRes.status === 429) {
        throw new Error('הגעת ללימיט — המתיני 10 שניות ונסי שוב');
      }
      throw new Error(data?.error || 'שגיאת שרת — נסי שוב');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const saveAIQuestions = async () => {
    if (!aiResult?.length) return;
    setAiSaving(true);
    const topicName = aiDesc.trim().slice(0, 60);
    const { data: topicData, error: topicErr } = await supabase
      .from('topics').insert([{ name: topicName }]).select().single();
    if (topicErr || !topicData) { setAiError('שגיאה ביצירת נושא'); setAiSaving(false); return; }
    const rows = aiResult.map(q => ({
      topic_id: topicData.id,
      question_text: q.question,
      answer_1: q.answer_1,
      answer_2: q.answer_2,
      answer_3: q.answer_3,
      answer_4: q.answer_4,
      correct_index: q.correct_index,
    }));
    await supabase.from('questions').insert(rows);
    setShowAI(false);
    setAiDesc('');
    setAiResult(null);
    setAiSaving(false);
    await loadTopics();
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    await supabase.auth.updateUser({ data: { first_name: userForm.first_name } });
    setEditingProfile(false);
    setSavingProfile(false);
  };

  if (openTopic) {
    return (
      <QuestionsManager
        topic={openTopic}
        onClose={() => setOpenTopic(null)}
        onShowAI={() => { setOpenTopic(null); setShowAI(true); }}
      />
    );
  }

  const displayName = isLoggedIn ? (userForm.first_name || session?.user?.email?.split('@')[0] || '') : 'אורח';

  return (
    <div className="min-h-screen pb-16" style={{ background: C.bg }} dir="rtl">

      {/* ── Big logo header ── */}
      <div className="relative py-10 text-center">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition hover:scale-[1.02]"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(239,144,152,0.2)', color: C.mid }}>
          <ArrowRight className="h-4 w-4" />
          חזרה למשחק
        </button>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)` }}>
            <Sparkles className="h-8 w-8 text-white" />
          </span>
          <span className="text-5xl font-black" style={{ letterSpacing: '-0.05em', color: C.dark }}>
            CL<span style={{ color: C.pink }}>I</span>Q
          </span>
        </div>

        {isLoggedIn ? (
          <p className="text-base font-bold" style={{ color: C.mid }}>
            שלום, <span style={{ color: C.dark }}>{displayName}</span>! 👋
          </p>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-bold" style={{ color: C.mid }}>אורח</span>
            <button
              onClick={onShowAuth}
              className="text-white text-sm font-bold px-5 py-1.5 rounded-full transition hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)` }}>
              התחבר
            </button>
          </div>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="flex gap-1 p-1 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(239,144,152,0.15)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: active ? 'white' : 'transparent',
                  color: active ? C.pink : C.mid,
                  boxShadow: active ? '0 2px 8px rgba(239,144,152,0.12)' : 'none',
                }}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl p-6 md:p-8"
          style={{ background: 'rgba(255,238,232,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,144,152,0.18)', boxShadow: '0 4px 24px rgba(239,144,152,0.12)' }}>

          {/* ══ TOPICS ══ */}
          {activeTab === 'topics' && (
            !isLoggedIn ? <LockedSection onShowAuth={onShowAuth} /> : (
              <div>
                <h2 className="text-lg font-black mb-5" style={{ color: C.dark }}>המאגרים שלי</h2>

                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={e => setNewTopicName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTopic()}
                    placeholder="שם הנושא החדש, לדוגמה: חנוכה..."
                    className="flex-1 rounded-xl px-4 py-3 text-sm transition focus:outline-none"
                    style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                    onFocus={e => e.target.style.borderColor = C.pink}
                    onBlur={e => e.target.style.borderColor = C.pinkLight}
                  />
                  <button
                    onClick={addTopic}
                    disabled={saving}
                    className="text-white font-bold px-5 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 4px 12px rgba(239,144,152,0.3)' }}>
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    הוסף
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8 flex items-center justify-center gap-2" style={{ color: C.mid }}>
                    <Loader className="h-5 w-5 animate-spin" /> טוען...
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl text-sm"
                    style={{ color: C.mid, border: '1.5px dashed rgba(239,144,152,0.3)' }}>
                    אין נושאים עדיין. צרי את הראשון למעלה! 🎯
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topics.map(topic => (
                      <div key={topic.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-2xl transition-all group hover:shadow-md"
                        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(239,144,152,0.15)' }}>
                        <button
                          onClick={() => setOpenTopic(topic)}
                          className="flex items-center gap-3 flex-1 text-right">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: C.peach }}>
                            <FolderOpen className="h-5 w-5" style={{ color: C.pink }} />
                          </div>
                          <div>
                            <div className="font-bold text-sm" style={{ color: C.dark }}>{topic.name}</div>
                            <div className="text-xs" style={{ color: C.mid }}>
                              {new Date(topic.created_at).toLocaleDateString('he-IL')}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => { if (onPlay) { onPlay(topic); onClose(); } }}
                            className="font-bold px-3 py-1.5 rounded-lg text-xs transition hover:scale-[1.03]"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#047857' }}>
                            ▶ שחק
                          </button>
                          <button
                            onClick={() => setOpenTopic(topic)}
                            className="font-bold px-3 py-1.5 rounded-lg text-xs transition hover:scale-[1.03]"
                            style={{ background: 'rgba(239,144,152,0.08)', border: '1px solid rgba(239,144,152,0.22)', color: C.pink }}>
                            עריכה
                          </button>
                          <button
                            onClick={() => deleteTopic(topic.id, topic.name)}
                            className="p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                            style={{ color: C.mid }}
                            onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                            onMouseLeave={e => e.currentTarget.style.color = C.mid}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── AI Generator ── */}
                <div className="mt-6 rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid rgba(139,92,246,0.25)', background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(239,144,152,0.05))' }}>
                  <button
                    onClick={() => { setShowAI(v => !v); setAiResult(null); setAiError(''); }}
                    className="w-full flex items-center justify-between px-5 py-4 transition hover:opacity-80">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" style={{ color: '#7c3aed' }} />
                      <span className="font-black text-sm" style={{ color: '#7c3aed' }}>✨ צור שאלות עם AI</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(139,92,246,0.12)', color: '#7c3aed' }}>חדש</span>
                    </div>
                    {showAI ? <ChevronUp className="h-4 w-4" style={{ color: '#7c3aed' }} /> : <ChevronDown className="h-4 w-4" style={{ color: '#7c3aed' }} />}
                  </button>

                  {showAI && (
                    <div className="px-5 pb-5 space-y-4">
                      <p className="text-xs" style={{ color: C.mid }}>
                        תאר את האירוע / נושא — ה-AI יצור {aiCount} שאלות מגוונות תוך שניות
                      </p>

                      <textarea
                        value={aiDesc}
                        onChange={e => setAiDesc(e.target.value)}
                        placeholder="ככל שתתארי יותר פרטים — כך השאלות יהיו טובות יותר! לדוגמה: שאלות מביכות על נופש משפחתי בגליל, כולל שחייה, ארוחות ורגעים מצחיקים"
                        rows={3}
                        className="w-full rounded-xl px-4 py-3 text-sm resize-none transition focus:outline-none"
                        style={{ background: '#fdf8f6', border: `1.5px solid rgba(139,92,246,0.25)`, color: C.dark }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.25)'}
                      />

                      {/* Count selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold" style={{ color: C.mid }}>כמות שאלות:</span>
                        {[10, 15, 20, 30].map(n => (
                          <button key={n} onClick={() => setAiCount(n)}
                            className="px-3 py-1 rounded-lg text-sm font-black transition"
                            style={{
                              background: aiCount === n ? '#7c3aed' : 'rgba(139,92,246,0.1)',
                              color: aiCount === n ? 'white' : '#7c3aed',
                            }}>
                            {n}
                          </button>
                        ))}
                      </div>

                      {aiError && (
                        <div className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">❌ {aiError}</div>
                      )}

                      {!aiResult && (
                        <button
                          onClick={generateWithAI}
                          disabled={aiLoading || !aiDesc.trim()}
                          className="w-full flex items-center justify-center gap-2 font-black py-3 rounded-xl text-white transition hover:scale-[1.01] disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                          {aiLoading ? <><Loader className="h-4 w-4 animate-spin" /> יוצר שאלות...</> : <><Wand2 className="h-4 w-4" /> צור {aiCount} שאלות</>}
                        </button>
                      )}

                      {aiResult && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black" style={{ color: '#7c3aed' }}>✅ {aiResult.length} שאלות נוצרו!</span>
                            <button onClick={() => { setAiResult(null); setAiError(''); }}
                              className="text-xs font-bold px-3 py-1 rounded-lg"
                              style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed' }}>
                              נסה שוב
                            </button>
                          </div>

                          {/* Preview */}
                          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
                            <button
                              onClick={() => setAiExpanded(v => !v)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold"
                              style={{ background: 'rgba(139,92,246,0.06)', color: '#7c3aed' }}>
                              <span>תצוגה מקדימה</span>
                              {aiExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {aiExpanded && (
                              <div className="max-h-64 overflow-y-auto divide-y divide-purple-100">
                                {aiResult.map((q, i) => (
                                  <div key={i} className="px-4 py-2.5">
                                    <div className="text-xs font-bold mb-1" style={{ color: C.dark }}>
                                      {i + 1}. {q.question}
                                      <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded-full"
                                        style={{ background: q.difficulty === 'easy' ? '#d1fae5' : q.difficulty === 'hard' ? '#fee2e2' : '#fef3c7', color: q.difficulty === 'easy' ? '#065f46' : q.difficulty === 'hard' ? '#991b1b' : '#92400e' }}>
                                        {q.difficulty === 'easy' ? 'קל' : q.difficulty === 'hard' ? 'קשה' : 'בינוני'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                      {[q.answer_1, q.answer_2, q.answer_3, q.answer_4].map((a, j) => (
                                        <span key={j} className={`text-[10px] px-2 py-0.5 rounded-lg ${q.correct_index === j + 1 ? 'font-black' : ''}`}
                                          style={{ background: q.correct_index === j + 1 ? '#d1fae5' : 'rgba(239,144,152,0.06)', color: q.correct_index === j + 1 ? '#065f46' : C.mid }}>
                                          {j + 1}. {a}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={saveAIQuestions}
                            disabled={aiSaving}
                            className="w-full flex items-center justify-center gap-2 font-black py-3 rounded-xl text-white transition hover:scale-[1.01] disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                            {aiSaving ? <><Loader className="h-4 w-4 animate-spin" /> שומר...</> : <><Check className="h-4 w-4" /> שמור כנושא חדש</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* ══ PROFILE ══ */}
          {activeTab === 'profile' && (
            !isLoggedIn ? <LockedSection onShowAuth={onShowAuth} /> : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black" style={{ color: C.dark }}>פרטים אישיים</h2>
                  {!editingProfile && (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition"
                      style={{ background: 'rgba(239,144,152,0.08)', border: '1px solid rgba(239,144,152,0.2)', color: C.pink }}>
                      <Edit2 className="h-4 w-4" /> עריכה
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: C.mid }}>שם פרטי</label>
                    <input
                      type="text"
                      value={userForm.first_name}
                      onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))}
                      disabled={!editingProfile}
                      className="w-full rounded-xl px-4 py-3 text-sm transition focus:outline-none"
                      style={{
                        background: editingProfile ? '#fdf8f6' : 'rgba(255,255,255,0.5)',
                        border: `1.5px solid ${editingProfile ? C.pinkLight : 'rgba(239,144,152,0.15)'}`,
                        color: C.dark,
                      }}
                      onFocus={e => editingProfile && (e.target.style.borderColor = C.pink)}
                      onBlur={e => editingProfile && (e.target.style.borderColor = C.pinkLight)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: C.mid }}>אימייל</label>
                    <input
                      type="email"
                      value={userForm.email}
                      disabled
                      className="w-full rounded-xl px-4 py-3 text-sm"
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(239,144,152,0.15)', color: C.mid }}
                    />
                  </div>

                  {editingProfile && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                        style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)` }}>
                        {savingProfile ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        שמור
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="font-bold px-6 py-2.5 rounded-xl transition"
                        style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(239,144,152,0.2)', color: C.mid }}>
                        ביטול
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(239,144,152,0.15)' }}>
                  <button
                    onClick={() => { supabase.auth.signOut(); onClose(); }}
                    className="flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl text-sm transition"
                    style={{ background: '#fff5f5', color: '#dc2626', border: '1px solid #fca5a5' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}>
                    <LogOut className="h-4 w-4" /> התנתקות
                  </button>
                </div>
              </div>
            )
          )}

          {/* ══ PURCHASES ══ */}
          {activeTab === 'purchases' && (
            !isLoggedIn ? <LockedSection onShowAuth={onShowAuth} /> : (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">🛒</div>
                <h3 className="text-lg font-black" style={{ color: C.dark }}>היסטוריית רכישות</h3>
                <p className="text-sm" style={{ color: C.mid }}>עדיין לא ביצעת רכישות</p>
              </div>
            )
          )}

          {/* ══ SETTINGS ══ */}
          {activeTab === 'settings' && settings && (
            <div>
              <h2 className="text-lg font-black mb-5" style={{ color: C.dark }}>הגדרות המשחק</h2>
              <p className="text-xs mb-5" style={{ color: C.mid }}>שינויים ייכנסו לתוקף מהשאלה הבאה</p>

              <div className="space-y-1 mb-6">
                {[
                  { key: 'autoAdvance',     label: 'מעבר אוטומטי לשאלה הבאה בסיום כל שאלה' },
                  { key: 'autoReveal',      label: 'הופעת תוצאות אוטומטית לאחר ההצבעה' },
                  { key: 'autoShowWinners', label: 'הופעת המנצחים בצורה אוטומטית בסיום המשחק' },
                  { key: 'autoStartTimer',  label: 'התחלת הטיימר אוטומטית לאחר הצגת השאלה' },
                  { key: 'endOnAllVoted',   label: 'סיום הטיימר בסיום הצבעת כל המשתתפים' },
                  { key: 'eliminationMode', label: '☠️ מצב פסילה — שחקנים שטועים יותר מדי נפסלים' },
                  { key: 'teamMode',        label: '👥 מצב קבוצות — ניקוד קבוצתי מצטבר' },
                ].map(({ key, label }) => (
                  <label key={key}
                    className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl cursor-pointer hover:bg-rose-50/30 transition-colors">
                    <div
                      onClick={() => onSettingsChange({ ...settings, [key]: !settings[key] })}
                      className="relative w-11 h-6 rounded-full border-2 transition-all shrink-0 cursor-pointer"
                      style={{ background: settings[key] ? C.pink : '#e8e0e8', borderColor: settings[key] ? C.pink : '#d4ccd4' }}>
                      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all"
                        style={{ right: settings[key] ? '0.125rem' : 'auto', left: settings[key] ? 'auto' : '0.125rem' }} />
                    </div>
                    <span className="text-sm text-right flex-1 leading-snug" style={{ color: C.dark }}>{label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                {/* Time limit slider */}
                {[{ key: 'timeLimit', label: 'כמות הזמן לענות תשובה', suffix: 'שניות', min: 5, max: 120, step: 5 }].map(({ key, label, suffix, min, max, step }) => (
                  <div key={key}
                    className="flex items-center justify-between gap-4 py-2.5 px-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid rgba(239,144,152,0.15)` }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSettingsChange({ ...settings, [key]: Math.max(min, settings[key] - step) })}
                        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center text-white transition-colors"
                        style={{ background: C.pinkLight }}
                        onMouseEnter={e => e.currentTarget.style.background = C.pink}
                        onMouseLeave={e => e.currentTarget.style.background = C.pinkLight}>−</button>
                      <span className="w-14 text-center text-lg font-black font-mono" style={{ color: C.pink }}>{settings[key]}</span>
                      <button
                        onClick={() => onSettingsChange({ ...settings, [key]: Math.min(max, settings[key] + step) })}
                        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center text-white transition-colors"
                        style={{ background: C.pinkLight }}
                        onMouseEnter={e => e.currentTarget.style.background = C.pink}
                        onMouseLeave={e => e.currentTarget.style.background = C.pinkLight}>+</button>
                    </div>
                    <span className="text-sm text-right flex-1" style={{ color: C.dark }}>
                      {label}: <span className="font-bold" style={{ color: C.pink }}>{settings[key]} {suffix}</span>
                    </span>
                  </div>
                ))}

                {/* Leaderboard mode */}
                <div className="py-3 px-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid rgba(239,144,152,0.15)` }}>
                  <div className="text-sm text-right mb-3 font-bold" style={{ color: C.dark }}>⚡ הצגת המהירים בסיבוב לשחקנים</div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {[
                      { value: 'always',   label: 'כל שאלה' },
                      { value: 'every3',   label: 'כל 3 שאלות' },
                      { value: 'every5',   label: 'כל 5 שאלות' },
                      { value: 'end_only', label: 'רק בסוף' },
                      { value: 'never',    label: 'בכלל לא' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => onSettingsChange({ ...settings, leaderboardMode: opt.value })}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                        style={{
                          background: (settings.leaderboardMode || 'always') === opt.value ? C.pink : 'rgba(239,144,152,0.15)',
                          color: (settings.leaderboardMode || 'always') === opt.value ? 'white' : C.dark,
                          border: `1px solid ${(settings.leaderboardMode || 'always') === opt.value ? C.pink : 'transparent'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

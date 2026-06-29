import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Plus, Trash2, ArrowRight, Check, Loader, HelpCircle, Wand2 } from 'lucide-react';

const C = {
  mint: '#c5d9d2', peach: '#fce5d8', pinkLight: '#f5c5be', pink: '#ef9098',
  dark: '#1e1535', mid: '#6b6580', bg: '#f0ddd8',
};

function QuestionsManager({ topic, onClose, onShowAI }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(1);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: true });
    if (!error && data) setQuestions(data);
    setLoading(false);
  };

  const updateAnswer = (idx, value) => {
    const copy = [...answers];
    copy[idx] = value;
    setAnswers(copy);
  };

  const addQuestion = async () => {
    if (!questionText.trim()) {
      alert('נא להזין את תוכן השאלה');
      return;
    }
    if (answers.some(a => !a.trim())) {
      alert('נא למלא את כל ארבע התשובות');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('questions').insert({
      topic_id: topic.id,
      question_text: questionText.trim(),
      answer_1: answers[0].trim(),
      answer_2: answers[1].trim(),
      answer_3: answers[2].trim(),
      answer_4: answers[3].trim(),
      correct_index: correctIndex,
    });
    if (!error) {
      setQuestionText('');
      setAnswers(['', '', '', '']);
      setCorrectIndex(1);
      await loadQuestions();
    } else {
      alert('שגיאה בשמירת השאלה: ' + error.message);
    }
    setSaving(false);
  };

  const deleteQuestion = async (id) => {
    if (!confirm('למחוק את השאלה?')) return;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) await loadQuestions();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl" style={{ background: C.bg }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4" style={{ borderBottom: '1px solid rgba(239,144,152,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 4px 12px rgba(239,144,152,0.3)' }}>
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black" style={{ color: C.dark }}>{topic.name}</h1>
            <p className="text-xs" style={{ color: C.mid }}>ניהול השאלות של הנושא</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 hover:scale-[1.02]"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(239,144,152,0.2)', color: C.mid }}
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לנושאים
        </button>
      </div>

      {/* Add new question form */}
      <div className="p-5 mb-6 space-y-4 rounded-2xl"
        style={{ background: 'rgba(255,238,232,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,144,152,0.18)', boxShadow: '0 4px 24px rgba(239,144,152,0.12)' }}>
        <h2 className="text-sm font-bold" style={{ color: C.pink }}>הוספת שאלה חדשה</h2>

        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: C.mid }}>תוכן השאלה</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="לדוגמה: מהי בירת ישראל?"
            className="w-full rounded-xl px-4 py-3 text-sm transition focus:outline-none"
            style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
            onFocus={e => e.target.style.borderColor = C.pink}
            onBlur={e => e.target.style.borderColor = C.pinkLight}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold block" style={{ color: C.mid }}>תשובות (סמני את הנכונה ב-✓)</label>
          {answers.map((answer, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                onClick={() => setCorrectIndex(idx + 1)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition shrink-0 border text-sm font-bold ${
                  correctIndex === idx + 1
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : ''
                }`}
                style={correctIndex !== idx + 1 ? { background: '#fdf8f6', borderColor: C.pinkLight, color: C.mid } : {}}
                title="סמני כתשובה הנכונה"
              >
                {correctIndex === idx + 1 ? <Check className="h-5 w-5" /> : (idx + 1)}
              </button>
              <input
                type="text"
                value={answer}
                onChange={(e) => updateAnswer(idx, e.target.value)}
                placeholder={`תשובה ${idx + 1}`}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm transition focus:outline-none"
                style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                onFocus={e => e.target.style.borderColor = C.pink}
                onBlur={e => e.target.style.borderColor = C.pinkLight}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          disabled={saving}
          className="w-full text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 4px 12px rgba(239,144,152,0.3)' }}
        >
          {saving ? <Loader className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          הוספת השאלה
        </button>
      </div>

      {/* Questions list */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: C.dark }}>השאלות בנושא ({questions.length})</h2>
        {loading ? (
          <div className="text-center py-12 flex items-center justify-center gap-2" style={{ color: C.mid }}>
            <Loader className="h-5 w-5 animate-spin" />
            טוען...
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl space-y-3" style={{ color: C.mid, border: '1.5px dashed rgba(239,144,152,0.3)' }}>
            <div>עדיין אין שאלות בנושא הזה. הוסיפי את הראשונה למעלה! ✍️</div>
            {onShowAI && (
              <button
                onClick={onShowAI}
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition hover:scale-[1.02]"
                style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <Wand2 className="h-4 w-4" />
                או צרי באמצעות AI מאגר שלם לפי נושא
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const ans = [q.answer_1, q.answer_2, q.answer_3, q.answer_4];
              return (
                <div key={q.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(239,144,152,0.15)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg shrink-0" style={{ background: 'rgba(239,144,152,0.1)', color: C.pink }}>
                        שאלה {idx + 1}
                      </span>
                      <span className="font-bold text-sm" style={{ color: C.dark }}>{q.question_text}</span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="transition shrink-0 mr-2"
                      style={{ color: C.mid }}
                      onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                      onMouseLeave={e => e.currentTarget.style.color = C.mid}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ans.map((a, i) => (
                      <div
                        key={i}
                        className={`text-sm px-3 py-2 rounded-lg border flex items-center gap-2 ${
                          q.correct_index === i + 1
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 font-bold'
                            : ''
                        }`}
                        style={q.correct_index !== i + 1 ? { background: 'rgba(239,144,152,0.05)', border: '1px solid rgba(239,144,152,0.15)', color: C.mid } : {}}
                      >
                        {q.correct_index === i + 1 && <Check className="h-3.5 w-3.5 shrink-0" />}
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionsManager;

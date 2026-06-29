import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Plus, Trash2, ArrowRight, Check, Loader, HelpCircle } from 'lucide-react';

function QuestionsManager({ topic, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New question form
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
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100">{topic.name}</h1>
            <p className="text-xs text-slate-400">ניהול השאלות של הנושא</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 border border-white/10"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לנושאים
        </button>
      </div>

      {/* Add new question form */}
      <div className="glass-panel p-5 mb-6 space-y-4">
        <h2 className="text-sm font-bold text-indigo-400">הוספת שאלה חדשה</h2>

        <div>
          <label className="text-xs text-slate-400 font-bold block mb-1.5">תוכן השאלה</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="לדוגמה: מהי בירת ישראל?"
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-bold block">תשובות (סמני את הנכונה ב-✓)</label>
          {answers.map((answer, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                onClick={() => setCorrectIndex(idx + 1)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition shrink-0 border ${
                  correctIndex === idx + 1
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-500 hover:border-emerald-500/40'
                }`}
                title="סמני כתשובה הנכונה"
              >
                {correctIndex === idx + 1 ? <Check className="h-5 w-5" /> : (idx + 1)}
              </button>
              <input
                type="text"
                value={answer}
                onChange={(e) => updateAnswer(idx, e.target.value)}
                placeholder={`תשובה ${idx + 1}`}
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          disabled={saving}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          הוספת השאלה
        </button>
      </div>

      {/* Questions list */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 mb-3">השאלות בנושא ({questions.length})</h2>
        {loading ? (
          <div className="text-center text-slate-400 py-12 flex items-center justify-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            טוען...
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-dashed border-white/10 rounded-2xl">
            עדיין אין שאלות בנושא הזה. הוסיפי את הראשונה למעלה! ✍️
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const ans = [q.answer_1, q.answer_2, q.answer_3, q.answer_4];
              return (
                <div key={q.id} className="glass-panel p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-1 rounded-lg">
                        שאלה {idx + 1}
                      </span>
                      <span className="font-bold text-slate-100">{q.question_text}</span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-slate-500 hover:text-red-400 transition"
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
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                            : 'bg-slate-900/60 border-white/5 text-slate-300'
                        }`}
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

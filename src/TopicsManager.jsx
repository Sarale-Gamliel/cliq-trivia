import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Plus, Trash2, FolderOpen, ArrowRight, Loader } from 'lucide-react';
import QuestionsManager from './QuestionsManager';

const C = {
  dark: '#1e1535', mid: '#6b6580', light: '#a090a8',
  pink: '#ef9098', pinkLight: '#f5c5be', peach: '#fce5d8', mint: '#c5d9d2',
};

function TopicsManager({ onClose, onPlay }) {
    const [topics, setTopics] = useState([]);
    const [newTopicName, setNewTopicName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openTopic, setOpenTopic] = useState(null);

    useEffect(() => { loadTopics(); }, []);

    const loadTopics = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('topics').select('*').order('created_at', { ascending: false });
        if (!error && data) setTopics(data);
        setLoading(false);
    };

    const addTopic = async () => {
        if (!newTopicName.trim()) return;
        setSaving(true);
        const { error } = await supabase.from('topics').insert([{ name: newTopicName.trim() }]);
        if (!error) { setNewTopicName(''); await loadTopics(); }
        setSaving(false);
    };

    const deleteTopic = async (id, name) => {
        if (!confirm(`למחוק את הנושא "${name}"?`)) return;
        await supabase.from('topics').delete().eq('id', id);
        await loadTopics();
    };

    if (openTopic) {
        return <QuestionsManager topic={openTopic} onClose={() => setOpenTopic(null)} />;
    }

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-4" style={{ borderBottom: `1px solid rgba(239,144,152,0.2)` }}>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: C.peach }}>
                        <FolderOpen className="h-6 w-6" style={{ color: C.pink }} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black" style={{ color: C.dark }}>ניהול מאגרי שאלות</h1>
                        <p className="text-xs" style={{ color: C.mid }}>צרי נושאים ונהלי את השאלות שלך</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid rgba(239,144,152,0.2)`, color: C.dark }}
                >
                    <ArrowRight className="h-4 w-4" />
                    חזרה למשחק
                </button>
            </div>

            {/* Add new topic */}
            <div className="p-5 mb-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid rgba(239,144,152,0.18)`, boxShadow: '0 2px 12px rgba(239,144,152,0.08)' }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: C.pink }}>הוספת נושא חדש</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                        placeholder="לדוגמה: בת מצווה, חנוכה, טיול משפחתי..."
                        className="flex-1 rounded-xl px-4 py-3 text-sm transition focus:outline-none"
                        style={{ background: '#fdf8f6', border: `1.5px solid ${C.pinkLight}`, color: C.dark }}
                        onFocus={e => e.target.style.borderColor = C.pink}
                        onBlur={e => e.target.style.borderColor = C.pinkLight}
                    />
                    <button
                        onClick={addTopic}
                        disabled={saving}
                        className="text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
                        style={{ background: `linear-gradient(135deg, ${C.pink}, #c05070)`, boxShadow: '0 6px 16px rgba(239,144,152,0.35)' }}
                    >
                        <Plus className="h-5 w-5" />
                        הוספה
                    </button>
                </div>
            </div>

            {/* Topics list */}
            <div>
                <h2 className="text-sm font-bold mb-3" style={{ color: C.mid }}>הנושאים שלי ({topics.length})</h2>
                {loading ? (
                    <div className="text-center py-12 flex items-center justify-center gap-2" style={{ color: C.mid }}>
                        <Loader className="h-5 w-5 animate-spin" />
                        טוען...
                    </div>
                ) : topics.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl text-sm" style={{ color: C.light, border: `1.5px dashed rgba(239,144,152,0.3)` }}>
                        עדיין אין נושאים. צרי את הראשון למעלה! 🎯
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topics.map((topic) => (
                            <div key={topic.id}
                                className="p-5 flex flex-col justify-between rounded-2xl group hover:shadow-md transition-all hover:scale-[1.01]"
                                style={{ background: 'rgba(255,255,255,0.85)', border: `1px solid rgba(239,144,152,0.15)`, boxShadow: '0 2px 8px rgba(239,144,152,0.07)' }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <button
                                        onClick={() => setOpenTopic(topic)}
                                        className="flex items-center gap-2 transition"
                                    >
                                        <FolderOpen className="h-5 w-5" style={{ color: C.pink }} />
                                        <span className="font-bold text-lg" style={{ color: C.dark }}>{topic.name}</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onPlay && onPlay(topic)}
                                            className="font-bold px-3 py-1 rounded-lg text-xs transition hover:scale-[1.03]"
                                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#047857' }}
                                        >
                                            ▶ שחק
                                        </button>
                                        <button
                                            onClick={() => deleteTopic(topic.id, topic.name)}
                                            className="transition opacity-0 group-hover:opacity-100"
                                            style={{ color: C.light }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                                            onMouseLeave={e => e.currentTarget.style.color = C.light}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs" style={{ color: C.light }}>
                                    נוצר ב-{new Date(topic.created_at).toLocaleDateString('he-IL')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopicsManager;

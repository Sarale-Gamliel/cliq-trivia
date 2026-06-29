import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

const AVATARS = ['🦁','🐯','🦊','🐼','🦄','🐸','🦋','🦅','⭐','🌟','🏆','🎮','🎯','🎸','🌈','🚀','💎','🔥','⚡','🎪'];

const ANSWERS = [
  { letter: 'א', bg: 'bg-red-500',     active: 'bg-red-400',     shadow: 'shadow-red-500/50' },
  { letter: 'ב', bg: 'bg-blue-500',    active: 'bg-blue-400',    shadow: 'shadow-blue-500/50' },
  { letter: 'ג', bg: 'bg-emerald-500', active: 'bg-emerald-400', shadow: 'shadow-emerald-500/50' },
  { letter: 'ד', bg: 'bg-amber-500',   active: 'bg-amber-400',   shadow: 'shadow-amber-500/50' },
];

function Logo() {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 px-3 py-1 rounded-xl shadow-lg shadow-purple-900/60">
        <span className="text-xl font-black text-white" style={{ letterSpacing: '-0.05em' }}>
          CL<span className="text-amber-300">I</span>Q
        </span>
      </div>
    </div>
  );
}

function TimerRing({ timeLeft, total }) {
  const pct = Math.max(0, timeLeft / total);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const color = pct > 0.5 ? '#10b981' : pct > 0.25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} stroke="#1e293b" strokeWidth="8" fill="none" />
        <circle
          cx="48" cy="48" r={r}
          stroke={color}
          strokeWidth="8" fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="text-3xl font-black text-white z-10">{timeLeft}</span>
    </div>
  );
}

export default function PlayerApp() {
  const { roomCode: urlRoomCode } = useParams();

  const [phase, setPhase] = useState(urlRoomCode ? 'setup' : 'join');
  const [roomCode, setRoomCode]     = useState(urlRoomCode?.toUpperCase() || '');
  const [roomId, setRoomId]         = useState(null);
  const [playerId, setPlayerId]     = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar]         = useState('⭐');
  const [roomData, setRoomData]     = useState(null);
  const [myAnswer, setMyAnswer]     = useState(null);
  const [answeredAt, setAnsweredAt] = useState(null);
  const [myScore, setMyScore]       = useState(0);
  const [myRank, setMyRank]         = useState(null);
  const [pointsGained, setPointsGained] = useState(0);
  const [wasCorrect, setWasCorrect] = useState(null);
  const [timeLeft, setTimeLeft]     = useState(15);
  const [playersCount, setPlayersCount] = useState(0);
  const [allPlayers, setAllPlayers] = useState([]);
  const [topAnswerers, setTopAnswerers] = useState(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const timerRef    = useRef(null);
  const playerIdRef = useRef(null);
  const myScoreRef  = useRef(0);
  const myAnswerRef = useRef(null);
  const answeredAtRef = useRef(null);

  // Validate room + set roomId when url has roomCode
  useEffect(() => {
    if (!urlRoomCode) return;
    supabase.from('game_rooms').select('*').eq('room_code', urlRoomCode.toUpperCase()).single()
      .then(({ data }) => {
        if (data) { setRoomData(data); setRoomId(data.id); }
        else setError('קוד חדר לא נמצא');
      });
  }, [urlRoomCode]);

  // Subscribe to room updates once roomId is known
  useEffect(() => {
    if (!roomId) return;

    supabase.from('room_players').select('id').eq('room_id', roomId)
      .then(({ data }) => setPlayersCount(data?.length || 0));

    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      }, ({ new: room }) => handleRoomUpdate(room))
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      }, () => setPlayersCount(c => c + 1))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomId]);

  const handleRoomUpdate = useCallback((room) => {
    setRoomData(room);

    if (room.status === 'question' && room.current_question) {
      const q = room.current_question;
      myAnswerRef.current = null;
      answeredAtRef.current = null;
      setMyAnswer(null);
      setAnsweredAt(null);
      setWasCorrect(null);
      setPointsGained(0);
      setTopAnswerers(null);
      setPhase('question');

      clearInterval(timerRef.current);
      const startedAt = new Date(q.started_at).getTime();
      const limit = q.time_limit || 15;
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, limit - (Date.now() - startedAt) / 1000);
        setTimeLeft(Math.ceil(remaining));
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setPhase(prev => prev === 'question' ? 'answered' : prev);
        }
      }, 200);
    }

    if (room.status === 'reveal' && room.current_question) {
      clearInterval(timerRef.current);
      const correct = room.current_question.correct;
      const myAns = myAnswerRef.current;
      const isCorrect = myAns !== null && myAns === correct;
      setWasCorrect(isCorrect);
      setTopAnswerers(room.current_question.top_answerers || null);

      // Calculate points
      let pts = 0;
      if (isCorrect && answeredAtRef.current) {
        const q = room.current_question;
        const startedAt = new Date(q.started_at).getTime();
        const elapsed = (answeredAtRef.current - startedAt) / 1000;
        const limit = q.time_limit || 15;
        pts = Math.round(1000 * Math.max(0.3, 1 - (elapsed / limit) * 0.7));
      }
      setPointsGained(pts);

      const newScore = myScoreRef.current + pts;
      myScoreRef.current = newScore;
      setMyScore(newScore);

      if (playerIdRef.current) {
        supabase.from('room_players')
          .update({ score: newScore })
          .eq('id', playerIdRef.current)
          .then(() => {
            supabase.from('room_players')
              .select('*').eq('room_id', room.id)
              .order('score', { ascending: false })
              .then(({ data }) => {
                if (data) {
                  setAllPlayers(data);
                  const idx = data.findIndex(p => p.id === playerIdRef.current);
                  setMyRank(idx >= 0 ? idx + 1 : null);
                }
              });
          });
      }
      setPhase('reveal');
    }

    if (room.status === 'game_over') {
      clearInterval(timerRef.current);
      supabase.from('room_players')
        .select('*').eq('room_id', room.id)
        .order('score', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setAllPlayers(data);
            const idx = data.findIndex(p => p.id === playerIdRef.current);
            setMyRank(idx >= 0 ? idx + 1 : null);
          }
        });
      setPhase('gameover');
    }

    if (room.status === 'lobby') setPhase('waiting');
  }, []);

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase();
    if (!code) { setError('הכניסי קוד חדר'); return; }
    setLoading(true); setError('');
    const { data } = await supabase.from('game_rooms').select('*').eq('room_code', code).single();
    if (!data) { setError('קוד חדר לא נמצא'); setLoading(false); return; }
    setRoomData(data); setRoomId(data.id);
    setPhase('setup'); setLoading(false);
  };

  const handleEnterGame = async () => {
    if (!playerName.trim()) { setError('הכניסי שם'); return; }
    setLoading(true); setError('');
    const { data, error } = await supabase
      .from('room_players')
      .insert({ room_id: roomId, name: playerName.trim(), avatar })
      .select().single();
    if (error) { setError('שגיאה, נסי שוב'); setLoading(false); return; }
    setPlayerId(data.id);
    playerIdRef.current = data.id;
    setPhase('waiting'); setLoading(false);
  };

  const submitAnswer = async (idx) => {
    if (myAnswerRef.current !== null) return;
    myAnswerRef.current = idx;
    answeredAtRef.current = Date.now();
    setMyAnswer(idx);
    setAnsweredAt(Date.now());
    setPhase('answered');

    const q = roomData?.current_question;
    if (!q || !playerIdRef.current) return;

    await supabase.from('player_answers').insert({
      room_id: roomId,
      player_id: playerIdRef.current,
      question_idx: q.idx ?? -1,
      answer: String(idx),
      answered_at: new Date().toISOString(),
    });
  };

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col" dir="rtl">

      {/* ── JOIN SCREEN ── */}
      {phase === 'join' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
          <Logo />
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <h1 className="text-3xl font-black text-white mb-1">הצטרפי למשחק</h1>
              <p className="text-slate-400 text-sm">הכניסי את קוד החדר שמוצג על המסך</p>
            </div>
            <input
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="XXXX"
              maxLength={6}
              dir="ltr"
              className="w-full text-center text-4xl font-black tracking-widest bg-white/10 border-2 border-white/20 focus:border-indigo-400 rounded-2xl px-4 py-5 text-white placeholder-white/20 focus:outline-none transition uppercase"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xl py-4 rounded-2xl transition shadow-2xl shadow-indigo-500/30 disabled:opacity-50"
            >
              {loading ? '...' : 'כניסה 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* ── SETUP: Name + Avatar ── */}
      {phase === 'setup' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <Logo />
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <div className="text-5xl mb-2">{avatar}</div>
              <h1 className="text-2xl font-black text-white">מי אתם?</h1>
            </div>

            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnterGame()}
              placeholder="השם שלך"
              maxLength={16}
              className="w-full text-center text-2xl font-black bg-white/10 border-2 border-white/20 focus:border-indigo-400 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none transition"
            />

            <div>
              <p className="text-xs text-slate-400 text-center mb-2">בחרי אווטאר</p>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`text-3xl p-2 rounded-xl transition-all ${avatar === a ? 'bg-indigo-500/40 border-2 border-indigo-400 scale-110' : 'bg-white/5 border-2 border-transparent hover:bg-white/10'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleEnterGame}
              disabled={loading || !playerName.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xl py-4 rounded-2xl transition shadow-2xl shadow-indigo-500/30 disabled:opacity-40"
            >
              {loading ? '...' : 'כנסי למשחק! 🎮'}
            </button>
          </div>
        </div>
      )}

      {/* ── WAITING ── */}
      {phase === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="text-7xl animate-bounce">{avatar}</div>
          <div>
            <h2 className="text-2xl font-black text-white">{playerName}</h2>
            <p className="text-slate-400 mt-1">מחכה שהמארח יתחיל…</p>
          </div>
          <div className="flex gap-1 justify-center mt-2">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-xs text-slate-400 mb-1">קוד חדר</div>
            <div className="text-3xl font-black text-white tracking-widest">{roomCode}</div>
          </div>
          <p className="text-slate-500 text-sm">{playersCount} שחקנים הצטרפו</p>
          <Logo />
        </div>
      )}

      {/* ── QUESTION ── */}
      {phase === 'question' && roomData?.current_question && (
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/20">
            <div className="text-sm font-bold text-slate-300">{playerName} {avatar}</div>
            <TimerRing timeLeft={timeLeft} total={roomData.current_question.time_limit || 15} />
            <div className="text-sm font-black text-amber-300">{myScore} נק׳</div>
          </div>

          {/* Question */}
          <div className="px-4 py-5 text-center">
            <p className="text-xl font-black text-white leading-snug">
              {roomData.current_question.question}
            </p>
          </div>

          {/* Answer buttons 2×2 */}
          <div className="flex-1 grid grid-cols-2 gap-3 p-4 content-start">
            {(roomData.current_question.options || []).map((opt, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                className={`relative flex flex-col items-center justify-center rounded-2xl p-4 min-h-[120px] text-white font-black text-lg shadow-xl transition-all active:scale-95 select-none
                  ${ANSWERS[i].bg} ${ANSWERS[i].shadow}
                  shadow-lg`}
              >
                <span className="text-3xl font-black opacity-30 absolute top-2 right-3">{ANSWERS[i].letter}</span>
                <span className="relative text-base leading-tight text-center">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ANSWERED (waiting for reveal) ── */}
      {phase === 'answered' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="text-7xl">✅</div>
          <div>
            <h2 className="text-2xl font-black text-white">ענית!</h2>
            <p className="text-slate-400 mt-1">ממתין לתוצאות…</p>
          </div>
          <div className="flex gap-1 justify-center">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>

          {/* Show which answer they picked */}
          {myAnswer !== null && roomData?.current_question?.options && (
            <div className={`rounded-2xl px-6 py-3 ${ANSWERS[myAnswer].bg} bg-opacity-80 shadow-lg`}>
              <div className="text-white font-black">
                {ANSWERS[myAnswer].letter} — {roomData.current_question.options[myAnswer]}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REVEAL ── */}
      {phase === 'reveal' && roomData?.current_question && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 text-center">

          {/* Correct / Wrong */}
          <div className={`text-8xl ${wasCorrect ? 'animate-bounce' : ''}`}>
            {myAnswer === null ? '😶' : wasCorrect ? '🎉' : '😢'}
          </div>

          <div>
            {myAnswer === null ? (
              <h2 className="text-2xl font-black text-slate-300">לא ענית בזמן</h2>
            ) : wasCorrect ? (
              <>
                <h2 className="text-3xl font-black text-emerald-400">נכון! 🔥</h2>
                <p className="text-amber-300 font-black text-2xl mt-1">+{pointsGained} נק׳</p>
              </>
            ) : (
              <h2 className="text-3xl font-black text-red-400">טעות 😞</h2>
            )}
          </div>

          {/* Correct answer */}
          <div className="w-full max-w-sm">
            <p className="text-xs text-slate-400 mb-2">התשובה הנכונה</p>
            {(() => {
              const correct = roomData.current_question.correct;
              return (
                <div className={`rounded-2xl px-5 py-3 ${ANSWERS[correct].bg} shadow-lg`}>
                  <span className="text-white font-black text-lg">
                    {ANSWERS[correct].letter} — {roomData.current_question.options?.[correct]}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Score + Rank */}
          <div className="flex gap-4 w-full max-w-sm">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">ניקוד</div>
              <div className="text-2xl font-black text-white">{myScore}</div>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">מקום</div>
              <div className="text-2xl font-black text-amber-300">
                {myRank ? `#${myRank}` : '—'}
              </div>
            </div>
          </div>

          {/* Top 3 fastest correct answerers */}
          {topAnswerers && topAnswerers.length > 0 && (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-amber-500/30"
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))' }}>
              <div className="px-4 pt-3 pb-1 text-center">
                <span className="text-xs font-black text-amber-300 tracking-wider">⚡ הכי מהירים בסיבוב</span>
              </div>
              {topAnswerers.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5">
                  <span className="text-xl w-7 text-center">{['🥇','🥈','🥉'][i]}</span>
                  <span className="flex-1 font-bold text-white text-sm">{p.name}</span>
                  {p.time != null && (
                    <span className="text-xs text-amber-300 font-bold">{(p.time / 1000).toFixed(1)}ש׳</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GAME OVER ── */}
      {phase === 'gameover' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 text-center">
          <div className="text-7xl">
            {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎮'}
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">המשחק נגמר!</h2>
            <p className="text-slate-400 mt-1">{playerName} {avatar}</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4">
              <div className="text-xs text-slate-400 mb-1">ניקוד סופי</div>
              <div className="text-3xl font-black text-amber-300">{myScore}</div>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl px-6 py-4">
              <div className="text-xs text-slate-400 mb-1">מקום סופי</div>
              <div className="text-3xl font-black text-indigo-300">{myRank ? `#${myRank}` : '—'}</div>
            </div>
          </div>

          {/* Top 5 */}
          {allPlayers.length > 0 && (
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-3 text-center">דירוג סופי</div>
              {allPlayers.slice(0, 5).map((p, i) => (
                <div key={p.id}
                  className={`flex items-center gap-3 py-2 border-b border-white/5 last:border-0 ${p.id === playerId ? 'text-amber-300' : 'text-slate-200'}`}>
                  <span className="w-6 text-sm font-black text-slate-500">{['🥇','🥈','🥉'][i] || `${i+1}.`}</span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="flex-1 font-bold text-sm text-right">{p.name}</span>
                  <span className="font-black">{p.score}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { setPhase('join'); setRoomCode(''); setMyScore(0); setMyRank(null); myScoreRef.current = 0; }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black px-8 py-3 rounded-2xl transition shadow-lg"
          >
            משחק חדש
          </button>

          <Logo />
        </div>
      )}
    </div>
  );
}

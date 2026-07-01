import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone,
  PhoneOff,
  User,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Check,
  Activity,
  Bot,
  Zap,
  Crown,
  Sparkles,
  Tv,
  Mic,
  Maximize2,
  Minimize2,
  Share2,
  Flame,
  Skull,
} from 'lucide-react';

import { QRCodeSVG } from 'qrcode.react';
import { triviaQuestions } from './data/questions';
import {
  playDTMF,
  playDialAndRing,
  playTickSound,
  playCorrectSound,
  playIncorrectSound,
  playGameOverSound,
  playSuspenseSound,
  playJokerSound,
  playLightningSound,
  playEliminatedSound,
} from './utils/audio';
import { supabase } from './supabaseClient';
import TopicsManager from './TopicsManager';
import Dashboard from './Dashboard';
import Header from './Header';
import Footer from './Footer';
import './App.css';

const INITIAL_PLAYERS = [
  { id: 'p1', name: 'שיר', isBot: false, isConnected: false, score: 0, lastAnswer: null, lastAnswerTime: null, isCorrect: null, pointsGained: 0, callDuration: 0, streak: 0, wrongCount: 0, prevScore: 0, prevRank: 0, isEliminated: false, phone: '', team: 'A' },
  { id: 'p2', name: 'גל', isBot: false, isConnected: false, score: 0, lastAnswer: null, lastAnswerTime: null, isCorrect: null, pointsGained: 0, callDuration: 0, streak: 0, wrongCount: 0, prevScore: 0, prevRank: 0, isEliminated: false, phone: '', team: 'B' },
  { id: 'b1', name: 'יוסי', isBot: true, isConnected: false, score: 0, lastAnswer: null, lastAnswerTime: null, isCorrect: null, pointsGained: 0, callDuration: 0, accuracy: 0.75, minDelay: 1200, maxDelay: 5000, streak: 0, wrongCount: 0, prevScore: 0, prevRank: 0, isEliminated: false, phone: '', team: 'A' },
  { id: 'b2', name: 'דנה', isBot: true, isConnected: false, score: 0, lastAnswer: null, lastAnswerTime: null, isCorrect: null, pointsGained: 0, callDuration: 0, accuracy: 0.90, minDelay: 3500, maxDelay: 9500, streak: 0, wrongCount: 0, prevScore: 0, prevRank: 0, isEliminated: false, phone: '', team: 'B' },
  { id: 'b3', name: 'רוני', isBot: true, isConnected: false, score: 0, lastAnswer: null, lastAnswerTime: null, isCorrect: null, pointsGained: 0, callDuration: 0, accuracy: 0.55, minDelay: 1500, maxDelay: 7000, streak: 0, wrongCount: 0, prevScore: 0, prevRank: 0, isEliminated: false, phone: '', team: 'C' },
];

const PHONE_NUMBER = "077-333-8748";
const WA_NUMBER = "972559896806";

const TEAMS = [
  { id: 'A', label: 'קבוצה א׳', emoji: '🔵', bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-300', ring: 'ring-blue-500/40' },
  { id: 'B', label: 'קבוצה ב׳', emoji: '🔴', bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-300', ring: 'ring-rose-500/40' },
  { id: 'C', label: 'קבוצה ג׳', emoji: '🟢', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', ring: 'ring-emerald-500/40' },
  { id: 'D', label: 'קבוצה ד׳', emoji: '🟡', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-300', ring: 'ring-amber-500/40' },
];

// Feature 9: Category icon helper
function getCategoryIcon(questionText) {
  if (!questionText) return '🎯';
  const text = questionText;
  if (/קולנוע|סרט|שחקן|שחקנית|במאי/.test(text)) return '🎬';
  if (/ספורט|כדורגל|כדורסל|טניס|אולימפ/.test(text)) return '⚽';
  if (/מוזיקה|שיר|זמר|אלבום|להקה/.test(text)) return '🎵';
  if (/גיאוגרפיה|עיר|ארץ|יבשת|נהר|הר/.test(text)) return '🌍';
  if (/מדע|כימיה|פיזיקה|ביולוגיה|מתמטיקה/.test(text)) return '🔬';
  if (/היסטוריה|מלחמה|מלך|קיסר|עתיק/.test(text)) return '📜';
  return '🎯';
}

function App({ isGuest = false, onExitGuest, session = null, onShowAuth }) {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [userName, setUserName] = useState(isGuest ? 'אורח' : '');
  const [showTopics, setShowTopics] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState(triviaQuestions);
  const [playingTopicName, setPlayingTopicName] = useState('');

  useEffect(() => {
    if (isGuest || !session) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.first_name) {
        setUserName(data.user.user_metadata.first_name);
      } else if (data?.user?.email) {
        setUserName(data.user.email.split('@')[0]);
      }
    });
  }, [isGuest, session]);

  const [gameSettings, setGameSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cliq_settings') || 'null') || {
      timeLimit: 15, autoAdvance: false, autoReveal: true, leaderboardMode: 'always',
      autoShowWinners: true, autoStartTimer: true, endOnAllVoted: true,
      eliminationMode: false, maxWrongs: 3, teamMode: false, jokerActive: false,
    }; } catch { return {
      timeLimit: 15, autoAdvance: false, autoReveal: true, leaderboardMode: 'always',
      autoShowWinners: true, autoStartTimer: true, endOnAllVoted: true,
      eliminationMode: false, maxWrongs: 3, teamMode: false, jokerActive: false,
    }; }
  });
  const gameSettingsRef = useRef(null);
  gameSettingsRef.current = gameSettings;
  useEffect(() => { localStorage.setItem('cliq_settings', JSON.stringify(gameSettings)); }, [gameSettings]);
  const playersRef = useRef(players);
  playersRef.current = players;

  const [roomCode] = useState(() => Math.random().toString(36).slice(2, 6).toUpperCase());

  const [gameState, setGameState] = useState('LOBBY');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [logs, setLogs] = useState([]);
  const [dialingStates, setDialingStates] = useState({});
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayTimeLeft, setAutoplayTimeLeft] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const [answerPercentage, setAnswerPercentage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [correctAnswerRevealed, setCorrectAnswerRevealed] = useState(false);
  const [showTopicChoice, setShowTopicChoice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [suspenseActive, setSuspenseActive] = useState(false);

  // Feature 5: Joker question state
  const [isJokerQuestion, setIsJokerQuestion] = useState(false);
  const [showJokerBanner, setShowJokerBanner] = useState(false);
  const isJokerRef = useRef(false);

  // Feature 6: Lightning round state
  const [isLightningRound, setIsLightningRound] = useState(false);
  const isLightningRef = useRef(false);
  const lightningAnsweredRef = useRef(false);

  // Feature 7: Danger zone state
  const [showDangerZone, setShowDangerZone] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Supabase room broadcasting
  const roomDbIdRef = useRef(null);

  const broadcastRoomState = useCallback(async (patch) => {
    if (!roomDbIdRef.current) return;
    await supabase.from('game_rooms').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', roomDbIdRef.current);
  }, []);

  // Create or refresh the Supabase room on mount
  useEffect(() => {
    const createRoom = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('game_rooms')
        .upsert({ room_code: roomCode, host_id: user?.id ?? null, status: 'lobby' }, { onConflict: 'room_code' })
        .select().single();
      if (!error && data) roomDbIdRef.current = data.id;
    };
    createRoom();
  }, [roomCode]);

  // Player manager state
  const [showPlayerManager, setShowPlayerManager] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newPlayerForm, setNewPlayerForm] = useState({ name: '', phone: '', team: 'A' });

  // Screen recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);

  const mainRef = useRef(null);
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(null);
  const botTimeoutsRef = useRef([]);
  const callDurationIntervalsRef = useRef({});
  const logsEndRef = useRef(null);
  const autoplayTimerRef = useRef(null);
  const currentQuestionIdxRef = useRef(0);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const currentQuestion = activeQuestions[currentQuestionIdx];

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, message, type }].slice(-50));
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(autoplayTimerRef.current);
      botTimeoutsRef.current.forEach(clearTimeout);
      Object.values(callDurationIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    players.forEach(p => {
      if (p.isConnected && !callDurationIntervalsRef.current[p.id]) {
        callDurationIntervalsRef.current[p.id] = setInterval(() => {
          setPlayers(prev => prev.map(player =>
            player.id === p.id ? { ...player, callDuration: player.callDuration + 1 } : player
          ));
        }, 1000);
      } else if (!p.isConnected && callDurationIntervalsRef.current[p.id]) {
        clearInterval(callDurationIntervalsRef.current[p.id]);
        delete callDurationIntervalsRef.current[p.id];
      }
    });
  }, [players]);

  // Update answer percentages
  useEffect(() => {
    if (gameState === 'QUESTION') {
      const connected = players.filter(p => p.isConnected && !p.isEliminated).length;
      const answered = players.filter(p => p.isConnected && !p.isEliminated && p.lastAnswer !== null).length;
      setAnswerPercentage(connected > 0 ? (answered / connected) * 100 : 0);
    }
  }, [players, gameState]);

  const handlePlayTopic = async (topic) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: true });

    if (error) {
      alert('שגיאה בטעינת השאלות: ' + error.message);
      return;
    }
    if (!data || data.length === 0) {
      alert('אין שאלות בנושא הזה עדיין. הוסיפי כמה שאלות לפני שמשחקים!');
      return;
    }

    const converted = data.map(q => ({
      question: q.question_text,
      options: [q.answer_1, q.answer_2, q.answer_3, q.answer_4],
      correctIndex: q.correct_index,
    }));

    setActiveQuestions(converted);
    setPlayingTopicName(topic.name);
    setCurrentQuestionIdx(0);
    setGameState('LOBBY');
    setShowTopics(false);
    setLogs([]);
    addLog(`🎯 נטען הנושא "${topic.name}" עם ${converted.length} שאלות. ממתין לשחקנים!`, 'info');
  };

  const connectPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player || player.isConnected || dialingStates[playerId]) return;

    setDialingStates(prev => ({ ...prev, [playerId]: true }));
    addLog(`📞 ${player.name} מחייג למספר ${PHONE_NUMBER}...`, 'phone');

    playDialAndRing(() => {
      setPlayers(prev => prev.map(p =>
        p.id === playerId ? { ...p, isConnected: true, callDuration: 0 } : p
      ));
      setDialingStates(prev => ({ ...prev, [playerId]: false }));
      addLog(`✨ ${player.name} התחבר בהצלחה לשיחת הטריוויה!`, 'success');
    });
  };

  const disconnectPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player || (!player.isConnected && !dialingStates[playerId])) return;

    if (dialingStates[playerId]) {
      setDialingStates(prev => ({ ...prev, [playerId]: false }));
      addLog(`❌ ${player.name} ביטל את החיוג.`, 'warning');
      return;
    }

    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, isConnected: false, lastAnswer: null, lastAnswerTime: null, isCorrect: null } : p
    ));
    addLog(`📴 ${player.name} ניתק את השיחה.`, 'warning');
  };

  const connectAllBots = () => {
    players.forEach(p => {
      if (p.isBot && !p.isConnected && !dialingStates[p.id]) {
        setTimeout(() => connectPlayer(p.id), Math.random() * 800);
      }
    });
  };

  const toggleBotMode = (playerId) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, isBot: !p.isBot, lastAnswer: null, lastAnswerTime: null, isCorrect: null } : p
    ));
    addLog(`⚙️ שחקן ${players.find(p => p.id === playerId).name} הועבר למצב ${!players.find(p => p.id === playerId).isBot ? 'בוט' : 'ידני'}`, 'info');
  };

  const startGame = () => {
    const activeCount = players.filter(p => p.isConnected).length;
    if (activeCount === 0) {
      alert("יש לחבר שחקן אחד לפחות (חייג מאחד הטלפונים) כדי להתחיל במשחק!");
      return;
    }

    if (!playingTopicName) {
      setShowTopicChoice(true);
      return;
    }

    beginGame();
  };

  const beginGame = () => {
    setShowTopicChoice(false);
    setPlayers(prev => prev.map(p => ({
      ...p,
      score: 0,
      lastAnswer: null,
      lastAnswerTime: null,
      isCorrect: null,
      pointsGained: 0,
      streak: 0,
      wrongCount: 0,
      prevScore: 0,
      prevRank: 0,
      isEliminated: false,
    })));
    setCurrentQuestionIdx(0);
    setCorrectAnswerRevealed(false);
    startQuestion(0);
  };

  const startQuestion = (questionIdx) => {
    setCurrentQuestionIdx(questionIdx);
    // Joker: off by default — set manually via gameSettings.jokerActive
    const joker = gameSettingsRef.current.jokerActive === true;
    setIsJokerQuestion(joker);
    isJokerRef.current = joker;
    // Reset after use
    if (joker) setGameSettings(s => ({ ...s, jokerActive: false }));

    // Feature 6: Determine lightning round (every 6th question: idx 5,11,17...)
    const lightning = questionIdx % 6 === 5;
    setIsLightningRound(lightning);
    isLightningRef.current = lightning;
    lightningAnsweredRef.current = false;

    setGameState('QUESTION');
    setTimeLeft(gameSettingsRef.current.timeLimit);
    setAnswerPercentage(0);
    setCorrectAnswerRevealed(false);
    setShowCelebration(false);
    questionStartTimeRef.current = Date.now();

    // Feature 1: snapshot prevScore and prevRank before clearing answers
    setPlayers(prev => {
      const connected = prev.filter(p => p.isConnected);
      const sorted = [...connected].sort((a, b) => b.score - a.score);
      return prev.map(p => {
        const rank = sorted.findIndex(s => s.id === p.id) + 1;
        return {
          ...p,
          lastAnswer: null,
          lastAnswerTime: null,
          isCorrect: null,
          pointsGained: 0,
          prevScore: p.score,
          prevRank: rank > 0 ? rank : p.prevRank,
        };
      });
    });

    addLog(`🚀 שאלה ${questionIdx + 1}: ${activeQuestions[questionIdx].question}`, 'game');

    // Broadcast question to real players (no correct answer yet)
    broadcastRoomState({
      status: 'question',
      question_idx: questionIdx,
      current_question: {
        idx: questionIdx,
        question: activeQuestions[questionIdx].question,
        options: activeQuestions[questionIdx].options,
        time_limit: gameSettingsRef.current.timeLimit,
        started_at: new Date().toISOString(),
      },
    });

    if (joker) {
      // Feature 5: Show joker banner for 2 seconds
      setShowJokerBanner(true);
      playJokerSound();
      setTimeout(() => setShowJokerBanner(false), 2000);
    }

    if (lightning) {
      // Feature 6: Show lightning indicator
      playLightningSound();
      addLog(`⚡ שאלת בזק! ראשון שעונה נכון מנצח 1000 נק׳!`, 'game');
    }

    botTimeoutsRef.current.forEach(clearTimeout);
    botTimeoutsRef.current = [];

    const connectedBots = players.filter(p => p.isConnected && p.isBot && !p.isEliminated);
    connectedBots.forEach(bot => {
      const delay = Math.random() * (bot.maxDelay - bot.minDelay) + bot.minDelay;
      const timeoutId = setTimeout(() => {
        const isCorrectChoice = Math.random() < bot.accuracy;
        let selectedAnswer = activeQuestions[questionIdx].correctIndex;
        if (!isCorrectChoice) {
          const incorrectOptions = [1, 2, 3, 4].filter(idx => idx !== selectedAnswer);
          selectedAnswer = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
        }
        handleAnswerSubmit(bot.id, selectedAnswer);
      }, delay);
      botTimeoutsRef.current.push(timeoutId);
    });

    // Feature 6: Skip timer for lightning round
    if (lightning) {
      clearInterval(timerRef.current);
      // No timer — first correct answer triggers reveal
      return;
    }

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          revealQuestionAnswers();
          return 0;
        }
        if (prev <= 6) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSubmit = (playerId, answerIdx) => {
    if (gameState !== 'QUESTION') return;

    setPlayers(prev => {
      const player = prev.find(p => p.id === playerId);
      if (!player || !player.isConnected || player.lastAnswer !== null || player.isEliminated) return prev;

      playDTMF(answerIdx);
      const responseTime = Date.now() - questionStartTimeRef.current;
      const isCorrect = answerIdx === currentQuestion.correctIndex;

      addLog(`📞 ${player.name} הקיש [${answerIdx}] במקשי הטלפון`, 'keypad');

      const updatedPlayers = prev.map(p =>
        p.id === playerId
          ? { ...p, lastAnswer: answerIdx, lastAnswerTime: responseTime, isCorrect }
          : p
      );

      // Feature 6: Lightning round — first correct answer triggers immediate reveal
      if (isLightningRef.current && isCorrect && !lightningAnsweredRef.current) {
        lightningAnsweredRef.current = true;
        setTimeout(() => {
          clearInterval(timerRef.current);
          revealQuestionAnswers();
        }, 300);
        return updatedPlayers;
      }

      // Feature 8: Don't count eliminated players in endOnAllVoted logic
      const connectedCount = updatedPlayers.filter(p => p.isConnected && !p.isEliminated).length;
      const answeredCount = updatedPlayers.filter(p => p.isConnected && !p.isEliminated && p.lastAnswer !== null).length;

      if (answeredCount === connectedCount && connectedCount > 0 && gameSettingsRef.current.endOnAllVoted) {
        setTimeout(() => {
          clearInterval(timerRef.current);
          revealQuestionAnswers();
        }, 400);
      }

      return updatedPlayers;
    });
  };

  const revealQuestionAnswers = () => {
    botTimeoutsRef.current.forEach(clearTimeout);
    setGameState('REVEAL');
    setCorrectAnswerRevealed(true);
    setSuspenseActive(true);
    playSuspenseSound();

    // Compute top 3 fastest correct answerers
    const mode = gameSettingsRef.current.leaderboardMode || 'always';
    const qIdx = currentQuestionIdx;
    const total = activeQuestions.length;
    const showBoard = mode === 'always' ? true
      : mode === 'every3' ? (qIdx + 1) % 3 === 0
      : mode === 'every5' ? (qIdx + 1) % 5 === 0
      : mode === 'never' ? false
      : mode === 'end_only' ? qIdx === total - 1
      : true;

    const top3 = showBoard
      ? playersRef.current
          .filter(p => p.isConnected && p.isCorrect)
          .sort((a, b) => (a.lastAnswerTime || 99999) - (b.lastAnswerTime || 99999))
          .slice(0, 3)
          .map(p => ({ name: p.name, time: p.lastAnswerTime }))
      : null;

    // Broadcast reveal with correct answer to real players
    const q = activeQuestions[currentQuestionIdx];
    if (q) {
      broadcastRoomState({
        status: 'reveal',
        current_question: {
          idx: currentQuestionIdx,
          question: q.question,
          options: q.options,
          correct: q.correctIndex ?? q.correct ?? 0,
          time_limit: gameSettingsRef.current.timeLimit,
          started_at: new Date(questionStartTimeRef.current).toISOString(),
          top_answerers: top3,
        },
      });
    }

    // Capture joker multiplier from ref before async setState
    const jokerMult = isJokerRef.current ? 2 : 1;
    const isLightning = isLightningRef.current;

    setTimeout(() => setSuspenseActive(false), 3000);

    setPlayers(prev => {
      const correctPlayers = prev
        .filter(p => p.isConnected && p.isCorrect)
        .sort((a, b) => a.lastAnswerTime - b.lastAnswerTime);

      const manualPlayer = prev.find(p => !p.isBot && p.isConnected);
      if (manualPlayer) {
        if (manualPlayer.isCorrect) {
          playCorrectSound();
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        } else {
          playIncorrectSound();
        }
      } else if (correctPlayers.length > 0) {
        playCorrectSound();
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      } else {
        playIncorrectSound();
      }

      // Track newly eliminated players to trigger sound
      const newlyEliminated = [];

      const updated = prev.map(p => {
        if (!p.isConnected) return p;

        let points = 0;

        // Feature 6: Lightning round — first correct player gets 1000 pts
        if (isLightning && p.isCorrect && correctPlayers[0]?.id === p.id) {
          points = 1000 * jokerMult;
        } else if (!isLightning) {
          if (p.isCorrect) {
            points += 500;
            const timeBonus = Math.round(Math.max(0, (1 - (p.lastAnswerTime / (gameSettingsRef.current.timeLimit * 1000)))) * 300);
            points += timeBonus;
            const speedRankIdx = correctPlayers.findIndex(cp => cp.id === p.id);
            if (speedRankIdx === 0) points += 200;
            else if (speedRankIdx === 1) points += 100;
            else if (speedRankIdx === 2) points += 50;
            points = points * jokerMult;
          }
        }

        // Feature 1: Update streak
        const newStreak = p.isCorrect ? p.streak + 1 : 0;
        const newWrongCount = !p.isCorrect && p.isConnected ? p.wrongCount + 1 : p.wrongCount;

        // Feature 8: Elimination check
        let newIsEliminated = p.isEliminated;
        if (
          gameSettingsRef.current.eliminationMode &&
          !p.isEliminated &&
          newWrongCount >= (gameSettingsRef.current.maxWrongs || 3)
        ) {
          newIsEliminated = true;
          newlyEliminated.push(p.name);
        }

        return {
          ...p,
          pointsGained: points,
          score: p.score + points,
          streak: newStreak,
          wrongCount: newWrongCount,
          isEliminated: newIsEliminated,
        };
      });

      // Play eliminated sound if anyone just got eliminated
      if (newlyEliminated.length > 0) {
        setTimeout(() => playEliminatedSound(), 500);
        newlyEliminated.forEach(name => {
          addLog(`☠️ ${name} נפסל מהמשחק!`, 'warning');
        });
      }

      return updated;
    });

    // Reset joker state after reveal
    setIsJokerQuestion(false);
    isJokerRef.current = false;

    addLog(`📢 התשובה הנכונה היא: (${activeQuestions[currentQuestionIdx].correctIndex}) ${activeQuestions[currentQuestionIdx].options[activeQuestions[currentQuestionIdx].correctIndex - 1]}`, 'game');
  };

  useEffect(() => {
    currentQuestionIdxRef.current = currentQuestionIdx;
  }, [currentQuestionIdx]);

  useEffect(() => {
    if (gameState === 'REVEAL' && isAutoplay && !suspenseActive) {
      autoplayTimerRef.current = setInterval(() => {
        setAutoplayTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(autoplayTimerRef.current);
            nextStep();
            return 6;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(autoplayTimerRef.current);
    }
    return () => clearInterval(autoplayTimerRef.current);
  }, [gameState, isAutoplay, suspenseActive]);

  useEffect(() => {
    if (gameState === 'REVEAL') {
      setAutoplayTimeLeft(6);
    }
  }, [gameState]);

  const nextStep = () => {
    clearInterval(autoplayTimerRef.current);
    const nextIdx = currentQuestionIdxRef.current + 1;
    if (nextIdx < activeQuestions.length) {
      // Feature 7: Show danger zone if >= 2 connected players
      const connectedCount = players.filter(p => p.isConnected).length;
      if (connectedCount >= 2) {
        setShowDangerZone(true);
        setTimeout(() => {
          setShowDangerZone(false);
          startQuestion(nextIdx);
        }, 2500);
      } else {
        startQuestion(nextIdx);
      }
    } else {
      setGameState('GAME_OVER');
      playGameOverSound();
      addLog(`🏆 המשחק הסתיים! הלוח מוצג לתוצאות הסופיות.`, 'game');
      broadcastRoomState({ status: 'game_over', current_question: null });
    }
  };

  const resetGame = () => {
    clearInterval(autoplayTimerRef.current);
    setGameState('LOBBY');
    setCurrentQuestionIdx(0);
    setCorrectAnswerRevealed(false);
    setShowCelebration(false);
    setShowDangerZone(false);
    setIsJokerQuestion(false);
    setIsLightningRound(false);
    isJokerRef.current = false;
    isLightningRef.current = false;
    lightningAnsweredRef.current = false;
    setPlayers(prev => prev.map(p => ({
      ...p,
      score: 0,
      lastAnswer: null,
      lastAnswerTime: null,
      isCorrect: null,
      pointsGained: 0,
      callDuration: 0,
      streak: 0,
      wrongCount: 0,
      prevScore: 0,
      prevRank: 0,
      isEliminated: false,
    })));
    setLogs([]);
    addLog("🎮 משחק חדש אותחל! ממתין לשחקנים שיחייגו.", 'info');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatResponseTime = (ms) => {
    if (ms === null || ms === undefined) return '-';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      recordingChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trivia-${new Date().toISOString().slice(0, 10)}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      };
      stream.getVideoTracks()[0].onended = () => {
        setIsRecording(false);
      };
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (e) {
      console.warn('Screen recording not available:', e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const getRoundHighlights = () => {
    const connected = players.filter(p => p.isConnected);
    const answered  = connected.filter(p => p.lastAnswer !== null);
    const correct   = answered.filter(p => p.isCorrect);
    const incorrect = answered.filter(p => !p.isCorrect);
    const highlights = [];

    // Feature 3: Rank movement arrows
    const rankedNow = [...connected].sort((a, b) => b.score - a.score);
    const rankChanges = rankedNow.map((p, i) => {
      const newRank = i + 1;
      const oldRank = p.prevRank || newRank;
      const delta = oldRank - newRank; // positive = moved up
      return { name: p.name, delta };
    }).filter(r => r.delta !== 0);

    const S = {
      emerald: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  color: '#065f46' },
      red:     { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',   color: '#991b1b' },
      amber:   { bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',  color: '#92400e' },
      rose:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(244,63,94,0.3)',   color: '#9f1239' },
      teal:    { bg: 'rgba(20,184,166,0.1)',   border: 'rgba(20,184,166,0.3)',  color: '#134e4a' },
      pink:    { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.25)', color: '#9d174d' },
      slate:   { bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.3)', color: '#1e293b' },
      cyan:    { bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.3)',   color: '#164e63' },
    };

    if (rankChanges.length > 0) {
      rankChanges.slice(0, 2).forEach(({ name, delta }) => {
        highlights.push({
          icon: delta > 0 ? '⬆️' : '⬇️',
          title: delta > 0 ? 'עלה בדירוג' : 'ירד בדירוג',
          value: name,
          sub: delta > 0 ? `עלה ${delta} מקומות ↑` : `ירד ${Math.abs(delta)} מקומות ↓`,
          s: delta > 0 ? S.emerald : S.red,
        });
      });
    }

    if (correct.length > 0) {
      const fastest = correct.reduce((a, b) => a.lastAnswerTime < b.lastAnswerTime ? a : b);
      highlights.push({ icon: '⚡', title: 'המהיר ביותר', value: fastest.name, sub: 'ענה ראשון מבין כל המצליחנים!', s: S.amber });
    }

    if (correct.length > 1) {
      const star = correct.reduce((a, b) => a.pointsGained > b.pointsGained ? a : b);
      highlights.push({ icon: '🔥', title: 'כוכב הסיבוב', value: star.name, sub: `+${star.pointsGained} נק׳ בסיבוב הזה`, s: S.rose });
    }

    if (correct.length > 1) {
      const slowest = correct.reduce((a, b) => a.lastAnswerTime > b.lastAnswerTime ? a : b);
      highlights.push({ icon: '🐢', title: 'הנחוש ביותר', value: slowest.name, sub: `חשב לאט, ידע בטח — ${formatResponseTime(slowest.lastAnswerTime)}`, s: S.teal });
    }

    if (incorrect.length > 0) {
      const boldWrong = incorrect.reduce((a, b) => a.lastAnswerTime < b.lastAnswerTime ? a : b);
      highlights.push({ icon: '😅', title: 'האמיץ המבולבל', value: boldWrong.name, sub: `ענה ב-${formatResponseTime(boldWrong.lastAnswerTime)} ... אבל טעה`, s: S.pink });
    }

    if (incorrect.length > 1) {
      const wrongCounts = {};
      incorrect.forEach(p => { wrongCounts[p.lastAnswer] = (wrongCounts[p.lastAnswer] || 0) + 1; });
      const mostPopularWrong = Object.entries(wrongCounts).sort((a,b) => b[1]-a[1])[0];
      if (mostPopularWrong && mostPopularWrong[1] > 1 && currentQuestion) {
        const optionText = currentQuestion.options[Number(mostPopularWrong[0]) - 1];
        highlights.push({ icon: '🎭', title: 'הפח הכי גדול', value: `תשובה ${mostPopularWrong[0]}`, sub: `"${optionText}" — ${mostPopularWrong[1]} שחקנים נפלו`, s: S.slate });
      }
    }

    if (answered.length > 0) {
      const pct = Math.round((correct.length / answered.length) * 100);
      const emoji = pct === 100 ? '💯' : pct === 0 ? '💀' : pct >= 70 ? '🎉' : pct >= 40 ? '😬' : '🙈';
      highlights.push({ icon: emoji, title: 'הצלחה בסיבוב', value: `${pct}%`, sub: pct === 100 ? 'כולם ידעו!' : pct === 0 ? 'אף אחד לא ידע!' : `${correct.length} מתוך ${answered.length}`, s: pct >= 70 ? S.emerald : pct >= 40 ? S.amber : S.red });
    }

    if (answered.length > 0 && correct.length === 0) {
      const quickest = answered.reduce((a, b) => a.lastAnswerTime < b.lastAnswerTime ? a : b);
      highlights.push({ icon: '🏅', title: 'האמיץ שבכולם', value: quickest.name, sub: `ניסה הכי מהר — ${formatResponseTime(quickest.lastAnswerTime)}`, s: S.cyan });
    }

    return highlights;
  };

  const rankedPlayers = [...players]
    .filter(p => p.isConnected)
    .sort((a, b) => b.score - a.score);

  // Feature 4: WhatsApp share
  const shareOnWhatsApp = () => {
    const medals = ['🥇', '🥈', '🥉'];
    const topLines = rankedPlayers.slice(0, 3).map((p, i) =>
      `${medals[i]} ${p.name}: ${p.score} נק׳`
    ).join('\n');

    const msg = `🏆 תוצאות טריוויה CLIQ!\n\n${topLines}\n\n📞 שיחקו עם כולנו: ${PHONE_NUMBER}\n✨ הזמינו את הטריוויה לאירוע שלכם: 055-989-6806`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const isLive = players.some(p => p.isConnected);
  const goHome = () => {
    setShowTopics(false);
    setGameState('LOBBY');
  };

  // Feature 9: category icon for current question
  const categoryIcon = currentQuestion ? getCategoryIcon(currentQuestion.question) : '🎯';

  if (showTopics && isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f0ddd8' }} dir="rtl">
        <div className="p-8 w-full max-w-md text-center space-y-5 rounded-3xl" style={{ background: 'rgba(255,238,232,0.85)', border: '1px solid rgba(239,144,152,0.2)', boxShadow: '0 8px 32px rgba(239,144,152,0.12)' }}>
          <div className="text-5xl">🔒</div>
          <h2 className="text-xl font-black" style={{ color: '#1e1535' }}>ניהול שאלות — למשתמשים רשומים</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6b6580' }}>
            כדי ליצור ולנהל מאגרי שאלות משלך, יש צורך בחשבון.<br />הכניסה כאורח מאפשרת לשחק עם שאלות ברירת המחדל בלבד.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => { setShowTopics(false); if (onExitGuest) onExitGuest(); }}
              className="w-full text-white font-bold py-3 rounded-xl transition hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #ef9098, #c05070)', boxShadow: '0 6px 16px rgba(239,144,152,0.35)' }}
            >
              הירשם / התחבר
            </button>
            <button
              onClick={() => setShowTopics(false)}
              className="w-full font-bold py-3 rounded-xl transition text-sm hover:scale-[1.01]"
              style={{ background: 'rgba(255,245,240,0.8)', border: '1px solid rgba(239,144,152,0.2)', color: '#6b6580' }}
            >
              חזור למשחק
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen" style={{ background: '#f0ddd8' }} dir="rtl">
        <Header userName={userName} onHome={() => setShowDashboard(false)} showHero={false} session={session} isGuest={isGuest} onShowAuth={onShowAuth} onOpenDashboard={() => setShowDashboard(false)} />
        <Dashboard
          session={session}
          isGuest={isGuest}
          onShowAuth={onShowAuth}
          onClose={() => setShowDashboard(false)}
          settings={gameSettings}
          onSettingsChange={setGameSettings}
          userName={userName}
          onPlay={(topic) => { handlePlayTopic(topic); setShowDashboard(false); }}
        />
        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <Footer />
        </div>
      </div>
    );
  }

  if (showTopics) {
    return (
      <div className="min-h-screen" style={{ background: '#f0ddd8' }} dir="rtl">
        <Header userName={userName} onHome={goHome} showHero={false} session={session} isGuest={isGuest} onShowAuth={onShowAuth} onOpenDashboard={() => setShowDashboard(true)} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="relative z-10">
            <TopicsManager onClose={goHome} onPlay={handlePlayTopic} />
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen select-none" style={{ background: '#f0ddd8' }} dir="rtl">

      {/* רקע — בלובים בצבעי הפלטה */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute" style={{ top: '-10%', right: '-5%', width: '45vw', height: '45vw', borderRadius: '50%', background: '#ef9098', filter: 'blur(120px)', opacity: 0.28 }} />
        <div className="absolute" style={{ bottom: '-8%', left: '-5%', width: '38vw', height: '38vw', borderRadius: '50%', background: '#c5d9d2', filter: 'blur(100px)', opacity: 0.35 }} />
        <div className="absolute" style={{ top: '40%', left: '30%', width: '30vw', height: '30vw', borderRadius: '50%', background: '#f5c5be', filter: 'blur(110px)', opacity: 0.3 }} />
      </div>

      {/* Feature 5: Joker banner overlay */}
      {showJokerBanner && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center gap-3 bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/60 rounded-3xl px-12 py-8 backdrop-blur-xl shadow-2xl shadow-amber-500/30 animate-float">
            <div className="absolute inset-0 bg-amber-400/10 rounded-3xl blur-xl" />
            <span className="relative text-7xl" style={{ filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.8))' }}>🎰</span>
            <div className="relative text-3xl font-black text-amber-300" style={{ textShadow: '0 0 20px rgba(251,191,36,0.6)' }}>
              שאלת ג׳וקר! × 2
            </div>
            <div className="relative text-sm text-amber-200/80 font-bold">הניקוד בשאלה זו מוכפל!</div>
          </div>
        </div>
      )}

      {/* Danger zone: transition happens silently */}
      {false && showDangerZone && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#071520] via-[#160a30] to-[#071520] animate-pulse-slow" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(99,62,220,0.35) 0%, transparent 70%)',
            animation: 'pulse-slow 1.2s ease-in-out infinite',
          }} />
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-lg w-full">
            <div className="text-5xl animate-float">🎯</div>
            <h2 className="text-3xl font-black text-white" style={{ textShadow: '0 0 30px rgba(139,92,246,0.8)' }}>
              הולכים לשאלה הבאה...
            </h2>
            <p className="text-cyan-300/80 text-lg font-bold animate-pulse-slow">
              מי יעלה? מי ייפול? 👀
            </p>

            {/* Top 3 leaderboard */}
            <div className="w-full space-y-2 mt-2">
              {rankedPlayers.slice(0, 3).map((p, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const gradients = [
                  'from-amber-500/20 to-yellow-500/10 border-amber-500/40',
                  'from-slate-400/15 to-slate-500/10 border-slate-400/30',
                  'from-amber-700/15 to-amber-600/10 border-amber-700/30',
                ];
                return (
                  <div key={p.id} className={`flex items-center justify-between bg-gradient-to-r ${gradients[i]} border rounded-2xl px-5 py-3 backdrop-blur-sm`}>
                    <span className="text-2xl font-black text-white">{p.score}</span>
                    <span className="font-black text-lg text-slate-100">{p.name}</span>
                    <span className="text-2xl">{medals[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Topic choice modal */}
      {showTopicChoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(240,221,216,0.6)' }}
            onClick={() => setShowTopicChoice(false)}
          ></div>

          <div className="relative w-full max-w-md rounded-3xl overflow-hidden animate-float" style={{ background: 'rgba(255,242,238,0.95)', border: '1px solid rgba(239,144,152,0.25)', boxShadow: '0 20px 60px rgba(239,144,152,0.2)' }}>
            {/* 4-color ribbon */}
            <div className="h-1.5 flex">
              <div className="flex-1" style={{ background: '#c5d9d2' }} />
              <div className="flex-1" style={{ background: '#fce5d8' }} />
              <div className="flex-1" style={{ background: '#f5c5be' }} />
              <div className="flex-1" style={{ background: '#ef9098' }} />
            </div>

            <div className="relative p-8 text-center space-y-5">
              <div className="inline-flex p-4 rounded-2xl" style={{ background: '#fce5d8' }}>
                <Sparkles className="h-10 w-10" style={{ color: '#ef9098' }} />
              </div>

              <h2 className="text-2xl font-black" style={{ color: '#1e1535' }}>לא בחרת נושא 🎯</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6580' }}>
                איך תרצי לשחק? אפשר לבחור מאגר שאלות משלך, או לשחק עם שאלות ברירת המחדל.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => { setShowTopicChoice(false); setShowTopics(true); }}
                  className="w-full text-white font-black py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ef9098, #c05070)', boxShadow: '0 6px 20px rgba(239,144,152,0.35)' }}
                >
                  <Sparkles className="h-5 w-5" />
                  בחרי מאגר שאלות משלי
                </button>

                <button
                  onClick={beginGame}
                  className="w-full font-bold py-3.5 rounded-2xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                  style={{ background: 'rgba(197,217,210,0.35)', border: '1px solid rgba(197,217,210,0.6)', color: '#1e1535' }}
                >
                  <Play className="h-5 w-5" />
                  שחקי עם שאלות ברירת המחדל
                </button>

                <button
                  onClick={() => setShowTopicChoice(false)}
                  className="w-full font-medium py-2 rounded-xl transition text-sm"
                  style={{ color: '#a090a8' }}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <Header userName={userName} onHome={goHome} showHero={gameState === 'LOBBY'} session={session} isGuest={isGuest} onShowAuth={onShowAuth} onOpenDashboard={() => window.location.href = '/dashboard'} />

      <div className="p-4 md:p-6 lg:p-8">
      {/* MAIN */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* CENTER: המסך הראשי */}
        <main ref={mainRef} className="lg:col-span-8 relative overflow-hidden rounded-3xl min-h-[600px]" style={{ background: 'rgba(255,238,232,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,144,152,0.18)', boxShadow: '0 4px 24px rgba(239,144,152,0.12)' }}>

          {/* Soft pastel glow — game screens only */}
          {gameState !== 'LOBBY' && <>
            <div className="absolute top-0 inset-x-0 h-px pointer-events-none z-10" style={{ background: 'linear-gradient(to right, transparent, rgba(239,144,152,0.4), rgba(197,217,210,0.3), transparent)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] blur-3xl rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(252,229,216,0.4) 0%, rgba(245,197,190,0.2) 50%, transparent 100%)' }} />
          </>}

          {gameState === 'LOBBY' && (
            <div className="relative p-6 md:p-8 flex flex-col items-center justify-center min-h-[520px] text-center">

              <div className="relative space-y-5 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#1e1535' }}>
                  🧠 מוכנים לטריוויה?
                </h2>

                {playingTopicName ? (
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold"
                    style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' }}>
                    <Check className="h-5 w-5" />
                    <span>נושא: {playingTopicName}</span>
                    <span style={{ color: '#a7f3d0' }}>•</span>
                    <span>{activeQuestions.length} שאלות</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium"
                    style={{ background: '#fdf8f6', border: '1px solid #f5c5be', color: '#6b6580' }}>
                    <span>📚 משחקים עם שאלות ברירת מחדל</span>
                    <span>•</span>
                    <button onClick={() => setShowTopics(true)} className="font-bold" style={{ color: '#ef9098' }}>
                      בחרי מאגר
                    </button>
                  </div>
                )}

                <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: '#6b6580' }}>
                  כל משתתף מחייג למספר, מקיש 1-4 ומקבל ניקוד לפי מהירות ותשובה נכונה.
                </p>

                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={connectAllBots}
                    className="text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #c5d9d2, #9ec4bb)', color: '#1e1535', boxShadow: '0 4px 12px rgba(197,217,210,0.4)' }}>
                    <Bot className="h-4 w-4" />
                    חבר את כל הבוטים
                  </button>
                </div>

                {/* QR join panel — כרטיס אחד נקי */}
                <div className="max-w-xs mx-auto text-center bg-white rounded-3xl p-6"
                  style={{ boxShadow: '0 4px 24px rgba(239,144,152,0.1)' }}>
                  <div className="flex justify-center mb-4">
                    <QRCodeSVG
                      value={`${window.location.origin}/join/${roomCode}`}
                      size={120}
                      fgColor="#1e1535"
                    />
                  </div>
                  <div className="text-3xl font-black tracking-widest font-mono mb-1" style={{ color: '#1e1535' }}>{roomCode}</div>
                  <div className="text-xs mb-3" style={{ color: '#6b6580' }}>סרקו QR או חייגו {PHONE_NUMBER}</div>
                </div>

                {players.filter(p => p.isConnected).length > 0 && (
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex -space-x-3 space-x-reverse">
                      {players.filter(p => p.isConnected).slice(0, 6).map((p, i) => (
                        <div key={p.id} className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-black border-2 border-white"
                          style={{ background: ['#ef9098','#c5d9d2','#f5c5be','#10b981','#fce5d8','#a78bfa'][i % 6], color: '#1e1535', zIndex: 6 - i }}>
                          {p.name[0]}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowPlayerManager(true)}
                      className="px-4 py-2.5 rounded-2xl font-black flex items-center gap-2 transition hover:scale-[1.03] active:scale-95"
                      style={{ background: '#ef9098', boxShadow: '0 4px 12px rgba(239,144,152,0.3)', color: 'white' }}>
                      <User className="h-4 w-4" />
                      <span>{players.filter(p => p.isConnected).length} מחוברים</span>
                    </button>
                  </div>
                )}

                <button onClick={startGame}
                  className="relative overflow-hidden text-white font-black text-xl px-10 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #ef9098, #e05878)',
                    boxShadow: '0 16px 40px rgba(239,144,152,0.45)',
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                  <span className="relative flex items-center gap-3">
                    <Play className="h-6 w-6" />
                    התחל שידור!
                  </span>
                </button>

              </div>
            </div>
          )}

          {gameState === 'QUESTION' && (
            <div className="relative p-6 md:p-8 flex flex-col min-h-[600px]">

              {/* Lightning round: subtle indicator only */}

              {/* Header with progress */}
              <div className={`relative flex justify-between items-center mb-4 ${isLightningRound ? 'mt-8' : ''}`}>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(239,144,152,0.2)', backdropFilter: 'blur(8px)' }}>
                  <span className="text-lg">{categoryIcon}</span>
                  <span className="text-sm font-bold" style={{ color: '#1e1535' }}>שאלה {currentQuestionIdx + 1}</span>
                  <span className="text-xs" style={{ color: '#a090a8' }}>/ {activeQuestions.length}</span>
                  {isJokerQuestion && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#b45309' }}>🎰 ×2</span>
                  )}
                  {isLightningRound && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#92400e' }}>⚡ בזק</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(239,144,152,0.2)', backdropFilter: 'blur(8px)' }}>
                    <Activity className="h-4 w-4" style={{ color: '#ef9098' }} />
                    <span className="text-sm font-bold" style={{ color: '#1e1535' }}>
                      {players.filter(p => p.isConnected && !p.isEliminated && p.lastAnswer !== null).length}/{players.filter(p => p.isConnected && !p.isEliminated).length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                    style={isPaused
                      ? { background: 'rgba(197,217,210,0.5)', border: '1px solid rgba(197,217,210,0.7)', color: '#2d6b5e' }
                      : { background: 'rgba(252,229,216,0.7)', border: '1px solid rgba(239,144,152,0.35)', color: '#a06040' }
                    }
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? 'המשך' : 'השהה'}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'יציאה ממסך מלא' : 'הצג במסך מלא'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.03]"
                    style={{ background: 'rgba(197,217,210,0.35)', border: '1px solid rgba(197,217,210,0.5)', color: '#1e1535' }}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {isFullscreen ? 'צמצם' : 'הגדל'}
                  </button>

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    title={isRecording ? 'עצור הקלטה' : 'הקלט מסך'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.03]"
                    style={isRecording
                      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#b91c1c' }
                      : { background: 'rgba(255,238,232,0.8)', border: '1px solid rgba(239,144,152,0.2)', color: '#1e1535' }
                    }
                  >
                    {isRecording ? (
                      <><span className="h-2 w-2 rounded-sm bg-red-500 animate-pulse inline-block" /> עצור</>
                    ) : (
                      <><span className="h-2 w-2 rounded-full inline-block" style={{ background: '#ef9098' }} /> הקלט</>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {/* Answer distribution bar */}
              {(() => {
                const active = players.filter(p => p.isConnected && !p.isEliminated);
                const total = active.length || 1;
                const correct = active.filter(p => p.lastAnswer === currentQuestion?.correctIndex).length;
                const wrong = active.filter(p => p.lastAnswer !== null && p.lastAnswer !== currentQuestion?.correctIndex).length;
                const pending = total - correct - wrong;
                const correctPct = Math.round((correct / total) * 100);
                const wrongPct = Math.round((wrong / total) * 100);
                const pendingPct = 100 - correctPct - wrongPct;
                return (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2 font-bold">
                      <span style={{ color: '#6b6580' }}>{pending} ממתינים</span>
                      <div className="flex gap-3">
                        <span style={{ color: '#10b981' }}>✓ {correct} נכון</span>
                        <span style={{ color: '#ef4444' }}>✗ {wrong} לא נכון</span>
                      </div>
                    </div>
                    <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                      {correctPct > 0 && <div className="transition-all duration-500 rounded-r-full" style={{ width: `${correctPct}%`, background: '#10b981' }} />}
                      {wrongPct > 0 && <div className="transition-all duration-500" style={{ width: `${wrongPct}%`, background: '#ef4444' }} />}
                      {pendingPct > 0 && <div className="transition-all duration-500 rounded-l-full" style={{ width: `${pendingPct}%`, background: 'rgba(107,101,128,0.2)' }} />}
                    </div>
                  </div>
                );
              })()}

              {/* The Question */}
              <div className="relative text-center py-6">
                <span className="relative text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4" style={{ background: 'rgba(197,217,210,0.35)', border: '1px solid rgba(197,217,210,0.5)', color: '#3d7a6e' }}>
                  {categoryIcon} שאלת הטריוויה
                </span>
                <h2 className="relative text-3xl md:text-4xl font-black leading-relaxed px-4 max-w-3xl mx-auto" style={{ color: '#1e1535' }}>
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-start">
                {currentQuestion.options.map((option, idx) => {
                  const answerers = players.filter(p => p.isConnected && p.lastAnswer === (idx + 1));
                  const numAnswers = answerers.length;
                  const paletteAccents = [
                    { accent: '#c5d9d2', num: '#2d6b5e' },
                    { accent: '#fce5d8', num: '#a06040' },
                    { accent: '#f5c5be', num: '#903050' },
                    { accent: '#ef9098', num: '#b03050' },
                  ];
                  const pal = paletteAccents[idx];

                  return (
                    <div
                      key={idx}
                      className="relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                      style={{
                        background: numAnswers > 0 ? `${pal.accent}22` : 'rgba(255,255,255,0.95)',
                        border: `1px solid ${pal.accent}`,
                        borderRight: `6px solid ${pal.accent}`,
                        boxShadow: `0 2px 16px ${pal.accent}44`
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg font-mono shrink-0"
                          style={{ background: pal.accent, color: pal.num }}>
                          {idx + 1}
                        </div>
                        <span className="text-lg font-bold" style={{ color: '#1e1535' }}>{option}</span>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Feature 1: Player streak list in QUESTION state */}
              {players.filter(p => p.isConnected && p.streak >= 2).length > 0 && (
                <div className="relative mt-4 flex flex-wrap gap-2 justify-center">
                  {players.filter(p => p.isConnected && p.streak >= 2).map(p => (
                    <div key={p.id} className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full text-xs font-black">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      {p.name} ×{p.streak}
                    </div>
                  ))}
                </div>
              )}

              {/* Timer - Feature 6: hide timer for lightning round */}
              {!isLightningRound && (
                <div className="relative mt-6 flex justify-center">
                  <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        className="stroke-slate-700/50"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        className="transition-all duration-1000 ease-linear"
                        style={{
                          stroke: timeLeft <= 5 ? '#ef4444' : '#8b5cf6',
                          strokeWidth: 6,
                          fill: 'none',
                          strokeDasharray: 2 * Math.PI * 42,
                          strokeDashoffset: 2 * Math.PI * 42 * (1 - timeLeft / gameSettings.timeLimit),
                          filter: timeLeft <= 5 ? 'drop-shadow(0 0 20px rgba(239,68,68,0.4))' : 'drop-shadow(0 0 20px rgba(139,92,246,0.3))',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-100'}`}>
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 6: Lightning round — show "waiting for first correct" */}
              {isLightningRound && (
                <div className="relative mt-6 flex justify-center">
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-3">
                    <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-black text-sm">שאלת בזק — ראשון מנצח!</span>
                    <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}

          {gameState === 'REVEAL' && suspenseActive && (
            <div className="relative flex flex-col items-center justify-center min-h-[600px] overflow-hidden select-none cursor-pointer"
              onClick={() => setSuspenseActive(false)}
            >
              {/* Dark pulsing bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#071520] via-[#160a30] to-[#071520] animate-pulse-slow" />
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(99,62,220,0.35) 0%, transparent 70%)',
                animation: 'pulse-slow 1.2s ease-in-out infinite',
              }} />

              {/* Tension bars (horizontal) */}
              {[...Array(7)].map((_, i) => (
                <div key={i} className="absolute inset-x-0 pointer-events-none"
                  style={{ top: `${10 + i * 12}%`, opacity: 0.07 + i * 0.01 }}
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                    style={{ animation: `shimmer-sweep ${1.8 + i * 0.2}s linear infinite`, animationDelay: `${i * 0.15}s` }}
                  />
                </div>
              ))}

              {/* Question text */}
              {currentQuestion && (
                <div className="relative z-10 text-center px-8 mb-8 max-w-2xl">
                  {/* Feature 9: category icon in suspense */}
                  <div className="text-xs font-black text-cyan-400/70 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <span>{categoryIcon}</span>
                    <span>שאלה {currentQuestionIdx + 1}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-black text-white/80 leading-snug">{currentQuestion.question}</p>
                </div>
              )}

              {/* Feature 2: Answer distribution bars */}
              <div className="relative z-10 w-full max-w-sm px-6 mb-6">
                {(() => {
                  const totalVotes = players.filter(p => p.isConnected && p.lastAnswer !== null).length;
                  const barColors = ['bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500'];
                  const borderColors = ['border-cyan-500/40', 'border-violet-500/40', 'border-pink-500/40', 'border-amber-500/40'];
                  const textColors = ['text-cyan-300', 'text-violet-300', 'text-pink-300', 'text-amber-300'];
                  return (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((optNum, i) => {
                        const count = players.filter(p => p.isConnected && p.lastAnswer === optNum).length;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        return (
                          <div key={optNum} className="flex items-center gap-3">
                            <span className={`text-xs font-black w-4 text-center ${textColors[i]}`}>{optNum}</span>
                            <div className={`flex-1 h-5 bg-slate-800/60 rounded-full border ${borderColors[i]} overflow-hidden`}>
                              <div
                                className={`h-full ${barColors[i]} rounded-full transition-all duration-700`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-black w-8 text-right ${textColors[i]}`}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Big pulsing question mark */}
              <div className="relative z-10 flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 blur-3xl bg-teal-500/40 rounded-full scale-150" style={{ animation: 'pulse-slow 0.9s ease-in-out infinite' }} />
                  <div className="relative text-8xl md:text-9xl" style={{ animation: 'float 1.2s ease-in-out infinite', filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.8))' }}>
                    🎯
                  </div>
                </div>

                {/* Animated dots */}
                <div className="flex items-center gap-3 mt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-3 w-3 rounded-full bg-teal-400"
                      style={{ animation: `pulse-slow 0.8s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }}
                    />
                  ))}
                </div>

                <p className="text-cyan-300/70 text-sm font-bold tracking-widest uppercase mt-1" style={{ animation: 'pulse-slow 1.5s ease-in-out infinite' }}>
                  מתגלה עוד רגע...
                </p>
              </div>

              {/* Skip hint */}
              <div className="absolute bottom-5 text-slate-600 text-xs font-bold">לחץ לדלג</div>
            </div>
          )}

          {gameState === 'REVEAL' && !suspenseActive && (
            <div className="relative p-6 md:p-8 flex flex-col min-h-[600px]">
              {/* Celebration overlay */}
              {showCelebration && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-yellow-500/10 to-emerald-500/10 animate-pulse-slow"></div>
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-float-up"
                      style={{
                        left: Math.random() * 100 + '%',
                        bottom: '-20px',
                        animationDelay: Math.random() * 2 + 's',
                        fontSize: Math.random() * 24 + 16 + 'px',
                      }}
                    >
                      🎉
                    </div>
                  ))}
                </div>
              )}

              <div className="relative text-center mb-6">
                <div className="text-xl mb-2">{categoryIcon}</div>
                <h2 className="text-lg font-black leading-snug" style={{ color: '#1e1535' }}>{currentQuestion?.question}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {currentQuestion.options.map((option, idx) => {
                  const isCorrect = idx + 1 === currentQuestion.correctIndex;
                  const choosers = players.filter(p => p.isConnected && p.lastAnswer === (idx + 1));

                  return (
                    <div
                      key={idx}
                      style={{
                        background: isCorrect ? '#ecfdf5' : choosers.length > 0 ? '#fef2f2' : '#f9f9f9',
                        border: `2px solid ${isCorrect ? '#10b981' : choosers.length > 0 ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '1rem', padding: '1.25rem', transition: 'all 0.3s',
                        opacity: choosers.length === 0 && !isCorrect ? 0.7 : 1,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm font-mono"
                            style={{ background: isCorrect ? '#10b981' : choosers.length > 0 ? '#ef4444' : '#d1d5db', color: '#fff' }}>
                            {idx + 1}
                          </div>
                          <span className="font-bold" style={{ color: '#1e1535' }}>{option}</span>
                        </div>
                        {isCorrect && <Check className="h-6 w-6 text-emerald-400 animate-bounce" />}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* ── Top 3 correct answerers ── */}
              {(() => {
                const medals = ['🥇', '🥈', '🥉'];
                const correct = players
                  .filter(p => p.isConnected && p.isCorrect)
                  .sort((a, b) => a.lastAnswerTime - b.lastAnswerTime)
                  .slice(0, 3);
                if (correct.length === 0) return null;
                return (
                  <div className="mt-5">
                    <div className="text-xs font-black mb-3" style={{ color: '#6b6580' }}>✅ ענו נכון ראשונים</div>
                    <div className="flex gap-3">
                      {correct.map((p, i) => (
                        <div key={p.id} className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                          <span className="text-lg shrink-0">{medals[i]}</span>
                          <div className="min-w-0">
                            <div className="font-black text-sm truncate" style={{ color: '#065f46' }}>{p.name}</div>
                            <div className="text-[11px]" style={{ color: '#6b9e8a' }}>{formatResponseTime(p.lastAnswerTime)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="relative mt-6 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm flex items-center gap-2 ${
                      isAutoplay
                        ? 'bg-indigo-500/20 border border-teal-500/30 text-cyan-300 hover:bg-indigo-500/30'
                        : 'bg-teal-950/60 border border-white/10 text-slate-400 hover:bg-slate-800/70'
                    }`}
                  >
                    {isAutoplay ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        <span>אוטומטי ({autoplayTimeLeft}s)</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>אוטומטי כבוי</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={nextStep}
                  className="relative group bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
                >
                  <span>{currentQuestionIdx < activeQuestions.length - 1 ? 'השאלה הבאה →' : '🏆 לתוצאות הסופיות'}</span>
                </button>
              </div>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="relative p-8 md:p-12 flex flex-col items-center justify-center min-h-[600px] text-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Trophy className="h-96 w-96 text-amber-500" />
              </div>

              <div className="relative space-y-8 max-w-2xl w-full">
                <div className="inline-flex p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                  <Crown className="h-16 w-16 text-amber-400 animate-bounce" />
                </div>

                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  🏆 המשחק נגמר!
                </h2>
                <p className="text-xl font-bold" style={{ color: '#6b6580' }}>התוצאות הסופיות של שיחות הטריוויה</p>

                {/* Podium */}
                <div className="flex items-end justify-center gap-4 pt-6">
                  {rankedPlayers.slice(0, 3).map((p, idx) => {
                    const heights = ['h-40', 'h-28', 'h-20'];
                    const colors = ['from-amber-500 to-yellow-500', 'from-slate-500 to-slate-400', 'from-amber-700 to-amber-600'];
                    const medals = ['🥇', '🥈', '🥉'];

                    return (
                      <div key={p.id} className="flex flex-col items-center gap-2">
                        <div className="text-sm font-bold" style={{ color: '#1e1535' }}>{p.name}</div>
                        <div className={`w-24 ${heights[idx]} bg-gradient-to-t ${colors[idx]} rounded-t-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <span className="text-4xl">{medals[idx]}</span>
                        </div>
                        <div className="text-2xl font-black text-amber-400">{p.score}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Team leaderboard */}
                {gameSettings.teamMode && (() => {
                  const teamScores = TEAMS.map(t => ({
                    ...t,
                    total: players.filter(p => p.team === t.id).reduce((s, p) => s + p.score, 0),
                    count: players.filter(p => p.team === t.id).length,
                  })).filter(t => t.count > 0).sort((a, b) => b.total - a.total);
                  return (
                    <div className="bg-teal-950/60 backdrop-blur-sm border border-white/10 rounded-2xl p-5 max-w-md mx-auto w-full">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                        👥 תוצאות קבוצות
                      </div>
                      {teamScores.map((t, i) => (
                        <div key={t.id} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl mb-1 ${t.bg} border ${t.border}`}>
                          <span className="text-xl">{['🥇','🥈','🥉'][i] || ''}</span>
                          <span className="text-lg">{t.emoji}</span>
                          <span className={`font-black text-sm flex-1 ${t.text}`}>{t.label}</span>
                          <span className="text-xs text-slate-400">{t.count} שחקנים</span>
                          <span className={`font-black text-lg ${t.text}`}>{t.total}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Full rankings */}
                <div className="bg-teal-950/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md mx-auto w-full">
                  {rankedPlayers.map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center py-2 border-b border-white/8 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold w-6" style={{ color: 'rgba(255,255,255,0.7)' }}>#{idx + 1}</span>
                        <span className="font-bold text-slate-200">{p.name}</span>
                        {p.isBot && <Bot className="h-3.5 w-3.5 text-cyan-400" />}
                        {/* Feature 8: Show eliminated badge */}
                        {p.isEliminated && (
                          <span className="flex items-center gap-1 text-red-400 text-[10px] font-black bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                            <Skull className="h-3 w-3" />
                            נפסל
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 font-mono">{formatDuration(p.callDuration)}</span>
                        <span className="font-black text-cyan-400">{p.score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature 4: WhatsApp share button */}
                <button
                  onClick={shareOnWhatsApp}
                  className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base px-8 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                  <Share2 className="h-5 w-5 relative" />
                  <span className="relative">שתפו תוצאות בוואטסאפ 💬</span>
                </button>

                <button
                  onClick={resetGame}
                  className="relative group bg-gradient-to-r from-teal-400 via-purple-500 to-pink-400 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-black text-lg px-10 py-3.5 rounded-2xl shadow-2xl shadow-teal-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                >
                  <span className="relative flex items-center gap-3">
                    <RotateCcw className="h-5 w-5" />
                    משחק חדש!
                  </span>
                </button>
              </div>
            </div>
          )}

        </main>

        {/* RIGHT: טלפונים */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,238,232,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,144,152,0.18)', boxShadow: '0 4px 20px rgba(239,144,152,0.1)' }}>
            <h3 className="text-sm font-extrabold flex items-center gap-2 mb-3" style={{ color: '#1e1535' }}>
              <Phone className="h-5 w-5" style={{ color: '#ef9098' }} />
              מכשירי שחקנים
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-auto" style={{ background: 'rgba(239,144,152,0.15)', color: '#c05070' }}>
                {players.length}
              </span>
            </h3>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {players.map(p => {
                const isDialing = dialingStates[p.id] || false;
                const hasAnswered = p.lastAnswer !== null;

                return (
                  <div
                    key={p.id}
                    className="relative rounded-2xl p-4 transition-all"
                    style={{
                      background: '#fff',
                      border: p.isEliminated ? '2px solid #fca5a5'
                        : hasAnswered && gameState === 'QUESTION' ? '2px solid #6ee7b7'
                        : p.isConnected ? '2px solid #5eead4'
                        : isDialing ? '2px solid #fcd34d'
                        : '2px solid #f5c5be',
                      boxShadow: '0 2px 8px rgba(239,144,152,0.12)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          p.isEliminated
                            ? 'bg-red-500'
                            : p.isConnected
                            ? 'bg-emerald-500 animate-pulse'
                            : isDialing
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-slate-400'
                        }`}></span>
                        <span className="font-extrabold text-sm" style={{ color: '#1e1535' }}>{p.name}</span>
                        <button
                          onClick={() => toggleBotMode(p.id)}
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition ${
                            p.isBot
                              ? 'bg-indigo-500/20 text-cyan-300 border border-teal-500/30'
                              : 'bg-slate-800 text-slate-400 border border-white/8'
                          }`}
                        >
                          {p.isBot ? '🤖' : '👤'}
                        </button>
                        {/* Feature 8: Eliminated badge */}
                        {p.isEliminated && (
                          <span className="flex items-center gap-1 text-red-400 text-[9px] font-black bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                            <Skull className="h-2.5 w-2.5" />
                            נפסל
                          </span>
                        )}
                        {/* Feature 1: Streak badge in player list */}
                        {p.streak >= 2 && !p.isEliminated && (
                          <span className="flex items-center gap-0.5 text-orange-400 text-[9px] font-black bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                            <Flame className="h-2.5 w-2.5" />
                            {p.streak}
                          </span>
                        )}
                        {/* Team badge */}
                        {gameSettings.teamMode && p.team && (() => {
                          const t = TEAMS.find(t => t.id === p.team);
                          return t ? (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${t.bg} ${t.border} border ${t.text}`}>
                              {t.emoji}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{formatDuration(p.callDuration)}</span>
                    </div>

                    <div className="rounded-xl p-3 mb-3 text-center min-h-[60px] flex flex-col justify-center" style={{ background: 'rgba(239,144,152,0.08)', border: '1px solid rgba(239,144,152,0.12)' }}>
                      {!p.isConnected && !isDialing && (
                        <div className="text-sm font-bold" style={{ color: '#4a4060' }}>📴 מנותק</div>
                      )}
                      {isDialing && (
                        <div className="text-xs font-bold animate-pulse" style={{ color: '#b06010' }}>📞 מחייג...</div>
                      )}
                      {p.isConnected && p.isEliminated && (
                        <div className="text-xs text-red-500 font-bold flex items-center justify-center gap-1">
                          <Skull className="h-3 w-3" />
                          נפסל מהמשחק
                        </div>
                      )}
                      {p.isConnected && !p.isEliminated && (
                        <div>
                          {hasAnswered && gameState === 'QUESTION' && (
                            <div className="flex justify-center mb-1">
                              <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="text-xs font-bold text-emerald-600">📞 בשיחה</div>
                          <div className="text-xs mt-1 font-medium" style={{ color: '#4a4060' }}>
                            {gameState === 'LOBBY' && '⏳ ממתין למשחק'}
                            {gameState === 'QUESTION' && (
                              hasAnswered
                                ? `✅ הקש ${p.lastAnswer}`
                                : '⌨️ הקש 1-4'
                            )}
                            {gameState === 'REVEAL' && (
                              p.isCorrect ? '🎉 נכון!' : '❌ שגוי'
                            )}
                            {gameState === 'GAME_OVER' && '🏁 סיים'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(num => {
                        const isSelected = p.lastAnswer === num;
                        const disabled = !p.isConnected || gameState !== 'QUESTION' || p.isEliminated;
                        return (
                          <button
                            key={num}
                            onClick={() => handleAnswerSubmit(p.id, num)}
                            disabled={disabled}
                            className="h-10 rounded-xl font-black text-sm font-mono transition-all hover:scale-105 active:scale-95"
                            style={isSelected
                              ? { background: '#ef9098', color: '#fff', border: '2px solid #c05070', boxShadow: '0 4px 12px rgba(239,144,152,0.4)' }
                              : disabled
                              ? { background: 'rgba(200,190,210,0.15)', color: '#9a8aaa', border: '1px solid rgba(200,190,210,0.2)', cursor: 'not-allowed' }
                              : { background: '#c5d9d2', color: '#1e1535', border: '1px solid #9ec4bb', fontWeight: 900 }
                            }
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {p.isConnected || isDialing ? (
                        <button
                          onClick={() => disconnectPlayer(p.id)}
                          className="flex-1 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 hover:scale-[1.02]"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' }}
                        >
                          <PhoneOff className="h-3.5 w-3.5" />
                          נתק
                        </button>
                      ) : (
                        <button
                          onClick={() => connectPlayer(p.id)}
                          className="flex-1 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 animate-pulse hover:scale-[1.02]"
                          style={{ background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.3)' }}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          חיוג
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* LOBBY LANDING SECTIONS */}
      {gameState === 'LOBBY' && (
        <>
          {/* ── Stats Bar ── */}
          <section className="mt-8">
            <div className="rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed11, #ef909811)', border: '1px solid rgba(124,58,237,0.12)' }}>
              {[
                { num: '1,000+', label: 'משתתפים בו-זמנית' },
                { num: '< 2s', label: 'עדכון תוצאות בלייב' },
                { num: '100%', label: 'מותאם לנייד' },
                { num: '∞', label: 'אפשרויות משחק' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: '#7c3aed' }}>{s.num}</div>
                  <div className="text-xs font-medium" style={{ color: '#6b6580' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Event Types ── */}
          <section className="mt-10" id="events">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-2" style={{ color: '#1e1535' }}>מתאים לכל אירוע</h2>
              <p style={{ color: '#6b6580' }}>טריוויה חיה שעובדת בכל פורמט ובכל קהל</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { emoji: '🎓', title: 'מבחני ידע',       desc: 'טריוויה אישית, תחרות אמיתית — כל אחד ומה שהוא יודע',           bg: '#fce5d8' },
                { emoji: '👨‍👩‍👧‍👦', title: 'מפגש משפחתי',   desc: 'שאלות על המשפחה, זיכרונות, ומי הכי מכיר את כולם',            bg: '#c5d9d2' },
                { emoji: '🎂', title: 'יום הולדת',        desc: 'חגיגה עם שאלות על חיי יוהב/ה, מזכרות ורגעים משותפים',         bg: '#f5c5be' },
                { emoji: '🏆', title: 'גיבוש צוות / חברה',desc: 'חוויה שמאחדת — תחרות, צחוק, וקצת פוליטיקה משרדית 😄',         bg: '#fce5d8' },
                { emoji: '💍', title: 'אירועי שמחה',      desc: 'חתונה, בר/בת מצווה — כולם מחייגים, כולם מנצחים',             bg: '#c5d9d2' },
                { emoji: '🎮', title: 'ערב בידור',         desc: 'חידון בסגנון טלוויזיה שמשגע כל קהל, בכל גיל',               bg: '#f5c5be' },
              ].map((card, i) => (
                <div key={i} className="group rounded-2xl p-6 cursor-default bg-white"
                  style={{ border: '1px solid #f0ebe8', boxShadow: '0 2px 12px rgba(239,144,152,0.06)', transition: 'all 250ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#7c3aed44'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(124,58,237,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f0ebe8'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(239,144,152,0.06)'; }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: card.bg }}>
                    {card.emoji}
                  </div>
                  <h3 className="font-black text-center mb-2 text-base" style={{ color: '#1e1535' }}>{card.title}</h3>
                  <p className="text-sm text-center leading-relaxed" style={{ color: '#6b6580' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── How It Works ── */}
          <section className="mt-12" id="steps">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-2" style={{ color: '#1e1535' }}>איך זה עובד?</h2>
              <p style={{ color: '#6b6580' }}>מהרגע שפותחים עד ל-Leaderboard — 5 צעדים</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { num: '1', emoji: '✏️', title: 'יוצרים משחק',    sub: 'מוסיפים שאלות או מייצרים עם AI', color: '#7c3aed', bg: '#f5f3ff' },
                { num: '2', emoji: '📺', title: 'מקרינים',         sub: 'על מסך גדול לכל הקהל',            color: '#ef9098', bg: '#fff1f2' },
                { num: '3', emoji: '📱', title: 'הקהל מצטרף',      sub: 'סורקים QR או מחייגים',            color: '#10b981', bg: '#f0fdf4' },
                { num: '4', emoji: '🎮', title: 'עונים בלייב',     sub: 'לוחצים 1-4 בזמן אמת',             color: '#f59e0b', bg: '#fffbeb' },
                { num: '5', emoji: '🏆', title: 'מנצח!',           sub: 'Leaderboard חי על המסך',           color: '#6366f1', bg: '#eef2ff' },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <div className="rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg duration-200"
                    style={{ background: step.bg, border: `1.5px solid ${step.color}22` }}>
                    <div className="text-3xl mb-3">{step.emoji}</div>
                    <div className="h-7 w-7 rounded-full text-white text-xs font-black flex items-center justify-center mx-auto mb-2"
                      style={{ background: step.color }}>
                      {step.num}
                    </div>
                    <div className="font-black text-sm mb-1" style={{ color: '#1e1535' }}>{step.title}</div>
                    <div className="text-xs" style={{ color: '#6b6580' }}>{step.sub}</div>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:flex items-center justify-center text-xl" style={{ color: '#d1d5db' }}>
                      ←
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="mt-10 mb-4" id="faq">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black mb-1" style={{ color: '#1e1535' }}>שאלות נפוצות</h2>
              <p className="text-sm" style={{ color: '#6b6580' }}>כל מה שרצית לדעת על CLIQ</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-2">
              {[
                { q: 'כמה אנשים יכולים לשחק בו-זמנית?', a: 'המשחק תומך ב-1 עד מאות משתתפים. כולם מחייגים למספר אחד בו-זמנית.' },
                { q: 'האם צריך להוריד אפליקציה?', a: 'לא! כל מה שצריך זה טלפון עם חיוג. אין הורדות, אין הרשמה, אין בלגן.' },
                { q: 'כמה זמן נמשך המשחק?', a: 'בדרך כלל 30–60 דקות, תלוי במספר השאלות (5–20 שאלות מומלץ לאירוע).' },
                { q: 'האם אפשר להתאים את השאלות לאירוע?', a: 'כן! ניתן להוסיף שאלות אישיות על החתן/כלה, על החברה, על המשפחה — דרך ניהול השאלות.' },
                { q: 'כמה עולה?', a: 'צרו קשר ב-WhatsApp ונתאים חבילה לפי גודל האירוע וסוגו. 📞 055-989-6806' },
                { q: 'האם אפשר לשחק ללא גישה לאינטרנט?', a: 'מנהל המשחק צריך חיבור לאינטרנט. המשתתפים — רק טלפון רגיל.' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #f0ebe8' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-right transition-colors"
                    style={{ color: '#1e1535' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fdf8f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span className="font-bold text-sm" style={{
                      display: 'inline-block',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#ef9098',
                    }}>▾</span>
                    <span className="font-bold text-sm flex-1 text-right pr-3">{item.q}</span>
                  </button>
                  <div style={{ maxHeight: openFaq === i ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                    <div className="px-5 pb-4 text-sm leading-relaxed text-right pt-3" style={{ borderTop: '1px solid #f0ebe8', color: '#6b6580' }}>
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <Footer />
      </div>

      {/* Player Manager Modal */}
      {showPlayerManager && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => { setShowPlayerManager(false); setEditingPlayer(null); setNewPlayerForm({ name: '', phone: '' }); }} />
          <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />
            <div className="relative p-6 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => { setShowPlayerManager(false); setEditingPlayer(null); setNewPlayerForm({ name: '', phone: '' }); }}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  ניהול שחקנים
                </h2>
              </div>

              {/* Players table */}
              <div className="space-y-2 mb-5">
                {players.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${idx % 2 === 0 ? 'bg-slate-800/40 border-white/8' : 'bg-slate-800/20 border-white/8'}`}
                  >
                    {editingPlayer?.id === p.id ? (
                      <>
                        <input
                          value={editingPlayer.name}
                          onChange={e => setEditingPlayer(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 bg-slate-700/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                          placeholder="שם"
                        />
                        <input
                          value={editingPlayer.phone}
                          onChange={e => setEditingPlayer(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-24 bg-slate-700/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                          placeholder="טלפון"
                          dir="ltr"
                        />
                        {gameSettings.teamMode && (
                          <select
                            value={editingPlayer.team || ''}
                            onChange={e => setEditingPlayer(prev => ({ ...prev, team: e.target.value }))}
                            className="bg-slate-700/60 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                          >
                            <option value="">—</option>
                            {TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                          </select>
                        )}
                        <button
                          onClick={() => {
                            setPlayers(prev => prev.map(pl => pl.id === editingPlayer.id ? { ...pl, name: editingPlayer.name, phone: editingPlayer.phone, team: editingPlayer.team } : pl));
                            setEditingPlayer(null);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-black text-sm px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingPlayer(null)}
                          className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg bg-slate-700/40 border border-white/10 transition"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-bold text-slate-100 text-sm">{p.name}</span>
                        {gameSettings.teamMode && (() => {
                          const t = TEAMS.find(t => t.id === p.team);
                          return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t ? `${t.bg} ${t.text} border ${t.border}` : 'text-slate-600'}`}>{t ? `${t.emoji} ${t.label}` : '—'}</span>;
                        })()}
                        <span className={`w-24 font-mono text-xs ${p.phone ? 'text-slate-300' : 'text-slate-600'}`} dir="ltr">
                          {p.phone || '—'}
                        </span>
                        <span className="text-[10px] text-slate-500 px-1">{p.isBot ? '🤖' : '👤'}</span>
                        <button
                          onClick={() => setEditingPlayer({ id: p.id, name: p.name, phone: p.phone || '', team: p.team || '' })}
                          className="text-cyan-400 hover:text-cyan-300 text-xs font-bold px-2 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 transition"
                        >
                          עריכה
                        </button>
                        <button
                          onClick={() => {
                            if (p.isConnected) {
                              alert('לא ניתן למחוק שחקן מחובר');
                              return;
                            }
                            setPlayers(prev => prev.filter(pl => pl.id !== p.id));
                          }}
                          className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 transition"
                        >
                          מחיקה
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add player form */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">הוסף שחקן</div>
                <div className="flex gap-2 flex-wrap">
                  <input
                    value={newPlayerForm.name}
                    onChange={e => setNewPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 min-w-[120px] bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition"
                    placeholder="שם שחקן"
                  />
                  <input
                    value={newPlayerForm.phone}
                    onChange={e => setNewPlayerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-28 bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition"
                    placeholder="טלפון"
                    dir="ltr"
                  />
                  {gameSettings.teamMode && (
                    <select
                      value={newPlayerForm.team}
                      onChange={e => setNewPlayerForm(prev => ({ ...prev, team: e.target.value }))}
                      className="bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500/60 transition"
                    >
                      {TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                    </select>
                  )}
                  <button
                    onClick={() => {
                      if (!newPlayerForm.name.trim()) return;
                      const newPlayer = {
                        id: `p_${Date.now()}`,
                        name: newPlayerForm.name.trim(),
                        phone: newPlayerForm.phone.trim(),
                        team: newPlayerForm.team || 'A',
                        isBot: false,
                        isConnected: false,
                        score: 0,
                        lastAnswer: null,
                        lastAnswerTime: null,
                        isCorrect: null,
                        pointsGained: 0,
                        callDuration: 0,
                        streak: 0,
                        wrongCount: 0,
                        prevScore: 0,
                        prevRank: 0,
                        isEliminated: false,
                      };
                      setPlayers(prev => [...prev, newPlayer]);
                      setNewPlayerForm({ name: '', phone: '', team: 'A' });
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-teal-500/20"
                  >
                    הוסף
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

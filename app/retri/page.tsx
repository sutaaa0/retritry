"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Trophy, Target, Clock, Zap, Shield, Crown, Heart, Volume2, VolumeX, Star, Flame } from "lucide-react";

type GameMode = "buff" | "turtle" | "lord";

const RetributionTrainer = () => {
  const [gameState, setGameState] = useState("menu"); // 'menu', 'playing', 'result', 'levelUp', 'gameOver'
  const [selectedMode, setSelectedMode] = useState<GameMode>("turtle");
  const [currentHP, setCurrentHP] = useState(0);
  const [maxHP, setMaxHP] = useState(0);
  const [targetHP, setTargetHP] = useState(1200);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [winStreak, setWinStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameStats, setGameStats] = useState({ attempts: 0, hits: 0, totalReaction: 0 });
  const [isRetributionReady, setIsRetributionReady] = useState(true);
  interface Particle {
    id: number;
    x: number;
    y: number;
    type: string;
    delay: number;
  }

  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);
  const [showWinStreakEffect, setShowWinStreakEffect] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);

  const gameStartTime = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const backgroundMusic = useRef(null);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled) {
      audioContext.current = new window.AudioContext();
    }
  }, [soundEnabled]);

  // Generate particles
  interface ParticleType {
    id: number;
    x: number;
    y: number;
    type: "perfect" | "great" | "good" | "levelUp" | "miss" | "fail";
    delay: number;
  }

  const createParticles = (type: ParticleType["type"], count: number = 20): void => {
    const newParticles: ParticleType[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        type,
        delay: Math.random() * 0.5,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  // Sound effects
  interface SoundOptions {
    frequency: number;
    duration: number;
    type?: OscillatorType;
  }

  interface AudioNodes {
    oscillator: OscillatorNode;
    gainNode: GainNode;
  }

  const playSound = (frequency: number, duration: number, type: OscillatorType = "sine"): void => {
    if (!soundEnabled || !audioContext.current) return;

    const oscillator: OscillatorNode = audioContext.current.createOscillator();
    const gainNode: GainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const modes = {
    buff: { name: "Buff Monster", hp: [2000, 5000], baseSpeed: 80, color: "bg-blue-500", icon: Shield },
    turtle: { name: "Turtle", hp: [5000, 12000], baseSpeed: 50, color: "bg-green-500", icon: Target },
    lord: { name: "Lord", hp: [12000, 30000], baseSpeed: 30, color: "bg-purple-500", icon: Crown },
  };

  // Calculate level-based difficulty
  const getLevelDifficulty = () => {
    const mode = modes[selectedMode];
    const speedMultiplier = 1 + (level - 1) * 0.3; // Increase speed by 30% each level
    const hpMultiplier = 1 + (level - 1) * 0.2; // Increase HP by 20% each level
    const timingWindow = Math.max(100, 300 - (level - 1) * 20); // Decrease timing window

    return {
      speed: mode.baseSpeed * speedMultiplier,
      hpRange: [mode.hp[0] * hpMultiplier, mode.hp[1] * hpMultiplier],
      timingWindow,
      requiredAccuracy: Math.min(90, 60 + (level - 1) * 5), // Increase required accuracy
    };
  };

  const startGame = () => {
    const difficulty = getLevelDifficulty();
    const randomHP = Math.floor(Math.random() * (difficulty.hpRange[1] - difficulty.hpRange[0])) + difficulty.hpRange[0];

    setCurrentHP(randomHP);
    setMaxHP(randomHP);
    setTargetHP(Math.floor(Math.random() * 400) + 1000);
    setGameState("playing");
    setFeedback("");
    setIsRetributionReady(true);
    gameStartTime.current = Date.now();

    // Play start sound
    playSound(440, 0.2);

    // Start HP reduction with level-based speed
    intervalRef.current = setInterval(() => {
      setCurrentHP((prev) => {
        const newHP = prev - difficulty.speed;
        if (newHP <= 0) {
          handleGameEnd("missed");
          return 0;
        }
        return newHP;
      });
    }, 100);
  };

  const handleRetribution = () => {
    if (!isRetributionReady || gameState !== "playing") return;

    const reactionMs = Date.now() - gameStartTime.current;
    const difficulty = getLevelDifficulty();
    const difference = Math.abs(currentHP - targetHP);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setReactionTime(reactionMs);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);

    let result = "";
    let points = 0;
    let success = false;

    if (currentHP > targetHP) {
      // HP masih lebih besar dari target, dianggap gagal
      result = "TOO EARLY!";
      points = 10;
      playSound(220, 0.5, "sawtooth");
      createParticles("miss", 10);
    } else if (difference <= 50) {
      result = "PERFECT RETRIBUTION!";
      points = 100 * comboMultiplier;
      success = true;
      playSound(880, 0.3);
      createParticles("perfect", 30);
    } else if (difference <= 100) {
      result = "EXCELLENT!";
      points = 80 * comboMultiplier;
      success = true;
      playSound(660, 0.3);
      createParticles("great", 20);
    } else if (difference <= difficulty.timingWindow) {
      result = "GOOD TIMING!";
      points = 60 * comboMultiplier;
      success = true;
      playSound(440, 0.3);
      createParticles("good", 15);
    } else {
      result = "TOO LATE!";
      points = 10;
      playSound(220, 0.5, "sawtooth");
      createParticles("miss", 10);
    }

    setFeedback(result);
    setScore((prev) => prev + points);
    setGameStats((prev) => ({
      attempts: prev.attempts + 1,
      hits: prev.hits + (success ? 1 : 0),
      totalReaction: prev.totalReaction + reactionMs,
    }));

    if (success) {
      setWinStreak((prev) => prev + 1);
      setComboMultiplier((prev) => Math.min(prev + 0.2, 3));

      // Check win streak effects
      if (winStreak + 1 >= 3) {
        setShowWinStreakEffect(true);
        setTimeout(() => setShowWinStreakEffect(false), 2000);
      }

      // Level up logic
      setTimeout(() => {
        setLevel((prev) => prev + 1);
        setShowLevelUpEffect(true);
        playSound(1320, 0.5);
        createParticles("levelUp", 40);
        setTimeout(() => {
          setShowLevelUpEffect(false);
          setGameState("levelUp");
        }, 2000);
      }, 1500);
    } else {
      setWinStreak(0);
      setComboMultiplier(1);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => setGameState("gameOver"), 1500);
        } else {
          setTimeout(() => setGameState("result"), 1500);
        }
        return newLives;
      });
    }

    setIsRetributionReady(false);
  };

  interface GameEndReason {
    reason: "missed";
  }

  const handleGameEnd = (reason: GameEndReason["reason"]): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (reason === "missed") {
      setFeedback("MISSED! MONSTER ESCAPED!");
      setWinStreak(0);
      setComboMultiplier(1);
      setLives((prev: number): number => {
        const newLives: number = prev - 1;
        if (newLives <= 0) {
          setTimeout((): void => setGameState("gameOver"), 1500);
        } else {
          setTimeout((): void => setGameState("result"), 1500);
        }
        return newLives;
      });
      playSound(110, 1, "sawtooth");
      createParticles("fail", 15);
    }
  };

  const resetGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setGameState("menu");
    setScore(0);
    setLevel(1);
    setLives(3);
    setWinStreak(0);
    setComboMultiplier(1);
    setGameStats({ attempts: 0, hits: 0, totalReaction: 0 });
    setIsRetributionReady(true);
  };

  const continueGame = () => {
    setIsRetributionReady(true);
    startGame();
  };

  const nextLevel = () => {
    setGameState("playing");
    startGame();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const targetPercentage = maxHP > 0 ? (targetHP / maxHP) * 100 : 0;

  // Particle component
  const ParticleEffect = ({ particles }: { particles: Particle[] }) => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute animate-ping ${
            particle.type === "perfect" ? "text-yellow-400" : particle.type === "great" ? "text-green-400" : particle.type === "good" ? "text-blue-400" : particle.type === "levelUp" ? "text-purple-400" : "text-red-400"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            fontSize: particle.type === "perfect" ? "24px" : "16px",
          }}
        >
          {particle.type === "perfect" ? "✨" : particle.type === "great" ? "💫" : particle.type === "good" ? "⭐" : particle.type === "levelUp" ? "🎉" : particle.type === "miss" ? "💥" : "❌"}
        </div>
      ))}
    </div>
  );

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <ParticleEffect particles={particles} />

          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Zap className="text-yellow-400 animate-pulse" size={40} />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Retribution Trainer</h1>
            </div>
            <p className="text-blue-200 text-lg">Master your jungler timing!</p>
          </div>

          {/* Sound Toggle */}
          <div className="flex justify-center mb-6">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="text-sm">{soundEnabled ? "Sound On" : "Sound Off"}</span>
            </button>
          </div>

          {/* Mode Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target size={20} />
              Select Training Mode
            </h2>

            <div className="space-y-3">
              {Object.entries(modes).map(([key, mode]) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMode(key as GameMode)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedMode === key ? "border-yellow-400 bg-yellow-400/20 scale-105 shadow-lg shadow-yellow-400/20" : "border-white/20 bg-white/5 hover:bg-white/10 hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${mode.color} shadow-lg`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-lg">{mode.name}</div>
                        <div className="text-blue-200 text-sm">
                          Base HP: {mode.hp[0].toLocaleString()} - {mode.hp[1].toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={18} />
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl p-3">
                <div className="text-3xl font-bold text-yellow-400">{score}</div>
                <div className="text-blue-200 text-sm">Total Score</div>
              </div>
              <div className="text-center bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl p-3">
                <div className="text-3xl font-bold text-purple-400">{level}</div>
                <div className="text-blue-200 text-sm">Level</div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-5 px-6 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/20"
          >
            <Play size={28} />
            Start Training
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} size={16} className="text-red-400" />
              ))}
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "playing") {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 p-4 ${screenShake ? "animate-pulse" : ""}`}>
        <div className="max-w-md mx-auto">
          <ParticleEffect particles={particles} />

          {/* Level Up Effect */}
          {showLevelUpEffect && (
            <div className="fixed inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 flex items-center justify-center z-40 animate-pulse">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4 animate-bounce">LEVEL UP!</div>
                <div className="text-2xl text-yellow-400">Level {level}</div>
              </div>
            </div>
          )}

          {/* Win Streak Effect */}
          {showWinStreakEffect && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                <Flame className="inline mr-2" size={20} />
                WIN STREAK: {winStreak}!
              </div>
            </div>
          )}

          {/* Game Header */}
          <div className="text-center mb-6 pt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">LV.{level}</div>
                <div className="text-yellow-400">×{comboMultiplier.toFixed(1)}</div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart key={i} size={20} className={`${i < lives ? "text-red-400" : "text-gray-600"} transition-all duration-300`} fill={i < lives ? "currentColor" : "none"} />
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 mb-2">
              {React.createElement(modes[selectedMode].icon, {
                className: "text-yellow-400 animate-pulse",
                size: 28,
              })}
              <h2 className="text-xl font-bold text-white">{modes[selectedMode].name}</h2>
            </div>
            <div className="text-blue-200">Target: {targetHP} HP</div>
            {winStreak > 0 && <div className="text-orange-400 font-bold animate-pulse">🔥 Win Streak: {winStreak}</div>}
          </div>

          {/* HP Bar Container */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
            <div className="relative">
              {/* HP Bar Background */}
              <div className="w-full h-10 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                {/* Current HP */}
                <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 transition-all duration-100 shadow-lg" style={{ width: `${hpPercentage}%` }} />

                {/* Target HP Indicator */}
                <div className="absolute top-0 w-1 h-10 bg-yellow-400 shadow-lg animate-pulse" style={{ left: `${targetPercentage}%` }}>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-yellow-400"></div>
                </div>
              </div>

              {/* HP Numbers */}
              <div className="flex justify-between mt-3">
                <span className="text-red-400 font-bold text-lg">{currentHP.toLocaleString()}</span>
                <span className="text-yellow-400 font-bold text-lg">🎯 {targetHP}</span>
              </div>
            </div>
          </div>

          {/* Retribution Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleRetribution}
              disabled={!isRetributionReady}
              className={`w-36 h-36 rounded-full font-bold text-xl shadow-2xl transform transition-all duration-200 border-4 ${
                isRetributionReady
                  ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-110 active:scale-95 border-white/30 shadow-yellow-400/30"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700"
              }`}
            >
              <div className="flex flex-col items-center">
                <Zap size={40} className={isRetributionReady ? "animate-pulse" : ""} />
                <div className="text-sm mt-1">RETRI</div>
              </div>
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-yellow-400 animate-bounce drop-shadow-lg">{feedback}</div>
            </div>
          )}

          {/* Game Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl p-2">
                <div className="text-lg font-bold text-white">{score}</div>
                <div className="text-blue-200 text-xs">Score</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl p-2">
                <div className="text-lg font-bold text-white">{gameStats.attempts}</div>
                <div className="text-blue-200 text-xs">Attempts</div>
              </div>
              <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl p-2">
                <div className="text-lg font-bold text-white">{gameStats.hits}</div>
                <div className="text-blue-200 text-xs">Hits</div>
              </div>
              <div className="bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl p-2">
                <div className="text-lg font-bold text-white">{winStreak}</div>
                <div className="text-blue-200 text-xs">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "levelUp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <ParticleEffect particles={particles} />

          {/* Level Up Celebration */}
          <div className="text-center mb-8 pt-8">
            <div className="animate-bounce mb-6">
              <Star className="text-yellow-400 mx-auto mb-4" size={64} />
              <h2 className="text-5xl font-bold text-white mb-2">LEVEL UP!</h2>
              <div className="text-3xl text-yellow-400 font-bold">Level {level}</div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl p-6 mb-6">
              <div className="text-white text-lg mb-4">🎉 Congratulations! 🎉</div>
              <div className="text-blue-200">Difficulty increased! Get ready for the next challenge!</div>
            </div>
          </div>

          {/* Level Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Level {level} Stats</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Win Streak</span>
                <span className="text-orange-400 font-bold">🔥 {winStreak}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Combo Multiplier</span>
                <span className="text-yellow-400 font-bold">×{comboMultiplier.toFixed(1)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Total Score</span>
                <span className="text-white font-bold">{score.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Lives Remaining</span>
                <span className="text-red-400 font-bold">
                  {Array.from({ length: lives })
                    .map((_, i) => "❤️")
                    .join("")}
                </span>
              </div>
            </div>
          </div>

          {/* Next Level Button */}
          <button
            onClick={nextLevel}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-5 px-6 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/20"
          >
            <Play size={28} />
            Continue to Level {level}
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "result") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-purple-900 p-4">
        <div className="max-w-md mx-auto">
          <ParticleEffect particles={particles} />

          {/* Result Header */}
          <div className="text-center mb-8 pt-8">
            <div className="mb-6">
              <div className="text-4xl mb-4">😞</div>
              <h2 className="text-3xl font-bold text-white mb-2">Try Again!</h2>
              <div className="text-xl text-red-400 font-bold">{feedback}</div>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} size={32} className={`${i < lives ? "text-red-400" : "text-gray-600"} transition-all duration-300`} fill={i < lives ? "currentColor" : "none"} />
              ))}
            </div>
            <div className="text-blue-200">Lives remaining: {lives}</div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Performance</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Current Level</span>
                <span className="text-purple-400 font-bold">Level {level}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Reaction Time</span>
                <span className="text-white font-bold">{reactionTime}ms</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Total Score</span>
                <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Success Rate</span>
                <span className="text-white font-bold">
                  {gameStats.hits}/{gameStats.attempts}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={continueGame}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Try Again (Level {level})
            </button>

            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-purple-900 p-4">
        <div className="max-w-md mx-auto">
          <ParticleEffect particles={particles} />

          {/* Game Over Header */}
          <div className="text-center mb-8 pt-8">
            <div className="animate-pulse mb-6">
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-5xl font-bold text-red-400 mb-2">GAME OVER</h2>
              <div className="text-xl text-white">No lives remaining!</div>
            </div>

            <div className="bg-gradient-to-r from-red-500/30 to-purple-500/30 rounded-3xl p-6 mb-6 border border-red-500/50">
              <div className="text-white text-lg mb-2">Final Level Reached</div>
              <div className="text-3xl font-bold text-yellow-400">Level {level}</div>
            </div>
          </div>

          {/* Final Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={18} />
              Final Statistics
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Highest Level</span>
                <span className="text-purple-400 font-bold">Level {level}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Total Score</span>
                <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Best Win Streak</span>
                <span className="text-orange-400 font-bold">🔥 {winStreak}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Total Attempts</span>
                <span className="text-white font-bold">{gameStats.attempts}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Successful Hits</span>
                <span className="text-green-400 font-bold">{gameStats.hits}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Overall Accuracy</span>
                <span className="text-white font-bold">{gameStats.attempts > 0 ? Math.round((gameStats.hits / gameStats.attempts) * 100) : 0}%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-200">Average Reaction</span>
                <span className="text-white font-bold">{gameStats.attempts > 0 ? Math.round(gameStats.totalReaction / gameStats.attempts) : 0}ms</span>
              </div>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl p-4 mb-6 border border-purple-500/30">
            <div className="text-center">
              <div className="text-2xl mb-2">{level >= 10 ? "🏆" : level >= 7 ? "🥇" : level >= 5 ? "🥈" : level >= 3 ? "🥉" : "🎯"}</div>
              <div className="text-white font-bold">{level >= 10 ? "Retribution Master!" : level >= 7 ? "Expert Jungler!" : level >= 5 ? "Skilled Player!" : level >= 3 ? "Good Attempt!" : "Keep Training!"}</div>
              <div className="text-blue-200 text-sm mt-1">{level >= 10 ? "You are a true legend!" : level >= 7 ? "Impressive performance!" : level >= 5 ? "Well done!" : level >= 3 ? "Not bad for a start!" : "Practice makes perfect!"}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white py-5 px-6 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/20"
            >
              <RotateCcw size={28} />
              Play Again
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Retribution Trainer",
                    text: `I just reached Level ${level} with ${score.toLocaleString()} points in Retribution Trainer! 🎮`,
                    url: window.location.href,
                  });
                } else {
                  // Fallback for browsers without Web Share API
                  const text = `I just reached Level ${level} with ${score.toLocaleString()} points in Retribution Trainer! 🎮`;
                  navigator.clipboard.writeText(text);
                  alert("Score copied to clipboard!");
                }
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Star size={20} />
              Share Score
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RetributionTrainer;

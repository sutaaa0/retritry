"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Target, Zap, Shield, Crown } from 'lucide-react';

const RetributionTrainer = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'result'
  const [selectedMode, setSelectedMode] = useState<'buff' | 'turtle' | 'lord'>('turtle');
  const [currentHP, setCurrentHP] = useState(0);
  const [maxHP, setMaxHP] = useState(0);
  const [targetHP, setTargetHP] = useState(1200);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameStats, setGameStats] = useState({ attempts: 0, hits: 0, totalReaction: 0 });
  const [isRetributionReady, setIsRetributionReady] = useState(true);
  
  const gameStartTime = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modes = {
    buff: { name: 'Buff Monster', hp: [2000, 5000], speed: 80, color: 'bg-blue-500', icon: Shield },
    turtle: { name: 'Turtle', hp: [5000, 12000], speed: 50, color: 'bg-green-500', icon: Target },
    lord: { name: 'Lord', hp: [12000, 30000], speed: 30, color: 'bg-purple-500', icon: Crown }
  };

  const startGame = () => {
    const mode = modes[selectedMode];
    const randomHP = Math.floor(Math.random() * (mode.hp[1] - mode.hp[0])) + mode.hp[0];
    
    setCurrentHP(randomHP);
    setMaxHP(randomHP);
    setTargetHP(Math.floor(Math.random() * 400) + 1000); // Random between 1000-1400
    setGameState('playing');
    setFeedback('');
    gameStartTime.current = Date.now();
    
    // Start HP reduction
    intervalRef.current = setInterval(() => {
      setCurrentHP(prev => {
        const newHP = prev - mode.speed;
        if (newHP <= 0) {
          handleGameEnd('missed');
          return 0;
        }
        return newHP;
      });
    }, 100);
  };

  const handleRetribution = () => {
    if (!isRetributionReady || gameState !== 'playing') return;
    
    const reactionMs = Date.now() - gameStartTime.current;
    const difference = Math.abs(currentHP - targetHP);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    setReactionTime(reactionMs);
    
    let result = '';
    let points = 0;
    
    if (difference <= 50) {
      result = 'Perfect Retribution!';
      points = 100;
    } else if (difference <= 150) {
      result = 'Great Timing!';
      points = 80;
    } else if (difference <= 300) {
      result = 'Good Attempt!';
      points = 60;
    } else if (currentHP > targetHP) {
      result = 'Too Early!';
      points = 20;
    } else {
      result = 'Too Late!';
      points = 10;
    }
    
    setFeedback(result);
    setScore(prev => prev + points);
    setGameStats(prev => ({
      attempts: prev.attempts + 1,
      hits: prev.hits + (points >= 60 ? 1 : 0),
      totalReaction: prev.totalReaction + reactionMs
    }));
    
    // Retribution cooldown
    setIsRetributionReady(false);
    setTimeout(() => {
      setGameState('result');
      setAccuracy(Math.round(((gameStats.hits + (points >= 60 ? 1 : 0)) / (gameStats.attempts + 1)) * 100));
    }, 1500);
  };

type GameEndReason = 'missed';

const handleGameEnd = (reason: GameEndReason): void => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reason === 'missed') {
        setFeedback('Missed! Monster died!');
        setGameStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
    }
    setTimeout(() => {
        setGameState('result');
        setAccuracy(Math.round((gameStats.hits / (gameStats.attempts + 1)) * 100));
    }, 1500);
};

  const resetGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setGameState('menu');
    setScore(0);
    setGameStats({ attempts: 0, hits: 0, totalReaction: 0 });
    setIsRetributionReady(true);
  };

  const nextRound = () => {
    setIsRetributionReady(true);
    startGame();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const targetPercentage = maxHP > 0 ? (targetHP / maxHP) * 100 : 0;

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Zap className="text-yellow-400" size={32} />
              <h1 className="text-3xl font-bold text-white">Retribution Trainer</h1>
            </div>
            <p className="text-blue-200">Master your jungler timing!</p>
          </div>

          {/* Mode Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
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
                    onClick={() => setSelectedMode(key as 'buff' | 'turtle' | 'lord')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedMode === key
                        ? 'border-yellow-400 bg-yellow-400/20 scale-105'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${mode.color}`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{mode.name}</div>
                        <div className="text-blue-200 text-sm">
                          HP: {mode.hp[0].toLocaleString()} - {mode.hp[1].toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={18} />
              Your Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-blue-200 text-sm">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                <div className="text-blue-200 text-sm">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Play size={24} />
            Start Training
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          {/* Game Header */}
          <div className="text-center mb-6 pt-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              {React.createElement(modes[selectedMode].icon, { 
                className: "text-yellow-400", 
                size: 24 
              })}
              <h2 className="text-xl font-bold text-white">{modes[selectedMode].name}</h2>
            </div>
            <div className="text-blue-200">Target: {targetHP} HP</div>
          </div>

          {/* HP Bar Container */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <div className="relative">
              {/* HP Bar Background */}
              <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
                {/* Current HP */}
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-100"
                  style={{ width: `${hpPercentage}%` }}
                />
                
                {/* Target HP Indicator */}
                <div 
                  className="absolute top-0 w-1 h-8 bg-yellow-400 shadow-lg"
                  style={{ left: `${targetPercentage}%` }}
                />
              </div>
              
              {/* HP Numbers */}
              <div className="flex justify-between mt-2">
                <span className="text-red-400 font-bold">{currentHP}</span>
                <span className="text-yellow-400 font-bold">Target: {targetHP}</span>
              </div>
            </div>
          </div>

          {/* Retribution Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleRetribution}
              disabled={!isRetributionReady}
              className={`w-32 h-32 rounded-full font-bold text-xl shadow-2xl transform transition-all duration-200 ${
                isRetributionReady
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:scale-110 active:scale-95'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-center">
                <Zap size={32} />
                <div className="text-sm">RETRI</div>
              </div>
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                {feedback}
              </div>
            </div>
          )}

          {/* Game Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{score}</div>
                <div className="text-blue-200 text-xs">Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{gameStats.attempts}</div>
                <div className="text-blue-200 text-xs">Attempts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{gameStats.hits}</div>
                <div className="text-blue-200 text-xs">Hits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-md mx-auto">
          {/* Result Header */}
          <div className="text-center mb-8 pt-8">
            <Trophy className="text-yellow-400 mx-auto mb-4" size={48} />
            <h2 className="text-3xl font-bold text-white mb-2">Round Complete!</h2>
            <div className="text-xl text-yellow-400 font-bold">{feedback}</div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Reaction Time</span>
                <span className="text-white font-bold">{reactionTime}ms</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Accuracy</span>
                <span className="text-white font-bold">{accuracy}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Score Gained</span>
                <span className="text-yellow-400 font-bold">+{score}</span>
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
              onClick={nextRound}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Next Round
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

  return null;
};

export default RetributionTrainer;
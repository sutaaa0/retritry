// app/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setReactionTime(null);
    setShowButton(false);
    setIsWaiting(true);

    const delay = Math.floor(Math.random() * 3000) + 2000; // 2000–5000 ms
    const id = setTimeout(() => {
      setStartTime(Date.now());
      setShowButton(true);
      setIsWaiting(false);
    }, delay);

    setTimeoutId(id);
  };

  const handleClick = () => {
    if (startTime) {
      const endTime = Date.now();
      setReactionTime(endTime - startTime);
      setShowButton(false);
    }
  };

  const getCategory = (ms: number) => {
    if (ms < 150) return '⚠️ Terlalu cepat (mungkin curang)';
    if (ms < 250) return '🏆 Sangat Cepat';
    if (ms < 300) return '🚀 Cepat';
    if (ms < 350) return '🙂 Normal';
    if (ms < 450) return '🐢 Agak Lambat';
    return '💤 Sangat Lambat';
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Latihan Timing Retributions</h1>
      {!showButton && (
        <button
          onClick={startTest}
          disabled={isWaiting}
          className={`px-6 py-3 text-lg rounded-lg transition-all duration-300 ${
            isWaiting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isWaiting ? 'Tunggu...' : 'Mulai Latihan'}
        </button>
      )}

      {showButton && (
        <button
          onClick={handleClick}
          className="px-8 py-4 mt-4 text-xl font-semibold bg-green-500 hover:bg-green-600 rounded-lg animate-pulse"
        >
          Klik Sekarang!
        </button>
      )}

      {reactionTime !== null && (
        <div className="mt-6 text-center">
          <p className="text-lg">
            Waktu reaksi kamu: <span className="font-bold">{reactionTime} ms</span>
          </p>
          <p className="mt-2 text-sm italic text-gray-300">{getCategory(reactionTime)}</p>
        </div>
      )}
    </main>
  );
}
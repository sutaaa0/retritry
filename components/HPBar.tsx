// components/HPBar.tsx
interface Props {
  currentHP: number;
  targetHP: number;
  maxHP: number;
}

export const HPBar = ({ currentHP, targetHP, maxHP }: Props) => {
  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const targetPercentage = maxHP > 0 ? (targetHP / maxHP) * 100 : 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
      <div className="relative">
        <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-100"
            style={{ width: `${hpPercentage}%` }}
          />
          <div
            className="absolute top-0 w-1 h-8 bg-yellow-400 shadow-lg"
            style={{ left: `${targetPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-red-400 font-bold">{currentHP}</span>
          <span className="text-yellow-400 font-bold">Target: {targetHP}</span>
        </div>
      </div>
    </div>
  );
};


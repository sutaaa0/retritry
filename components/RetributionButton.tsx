// components/RetributionButton.tsx
import { Zap } from "lucide-react";

interface Props {
  onClick: () => void;
  isReady: boolean;
}

export const RetributionButton = ({ onClick, isReady }: Props) => (
  <div className="text-center mb-6">
    <button
      onClick={onClick}
      disabled={!isReady}
      className={`w-32 h-32 rounded-full font-bold text-xl shadow-2xl transform transition-all duration-200 ${
        isReady
          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:scale-110 active:scale-95"
          : "bg-gray-600 text-gray-400 cursor-not-allowed"
      }`}
    >
      <div className="flex flex-col items-center">
        <Zap size={32} />
        <div className="text-sm">RETRI</div>
      </div>
    </button>
  </div>
);

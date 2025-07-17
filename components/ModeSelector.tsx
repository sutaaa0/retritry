// components/ModeSelector.tsx
import { Target } from "lucide-react";
import { modes, ModeKey } from "@/lib/modes";

interface Props {
  selectedMode: ModeKey;
  onSelect: (mode: ModeKey) => void;
}

export const ModeSelector = ({ selectedMode, onSelect }: Props) => (
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
            onClick={() => onSelect(key as ModeKey)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedMode === key
                ? "border-yellow-400 bg-yellow-400/20 scale-105"
                : "border-white/20 bg-white/5 hover:bg-white/10"
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
);
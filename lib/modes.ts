// lib/modes.ts
import { Sword, Shield, Ghost, Flame } from "lucide-react";

export type ModeKey = "squishy" | "normal" | "tank" | "lord";

export const modes: Record<
  ModeKey,
  {
    name: string;
    hp: [number, number]; // min - max HP range
    icon: React.ElementType;
    color: string;
  }
> = {
  squishy: {
    name: "Squishy",
    hp: [2000, 4000],
    icon: Sword,
    color: "bg-pink-500",
  },
  normal: {
    name: "Normal",
    hp: [5000, 8000],
    icon: Shield,
    color: "bg-blue-500",
  },
  tank: {
    name: "Tank",
    hp: [9000, 15000],
    icon: Ghost,
    color: "bg-purple-500",
  },
  lord: {
    name: "Lord",
    hp: [18000, 25000],
    icon: Flame,
    color: "bg-orange-500",
  },
};

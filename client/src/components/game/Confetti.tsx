import React from "react";
import ConfettiLib from "react-confetti";
import { useGame } from "@/lib/stores/useGame";

export function Confetti() {
  const phase = useGame((s) => s.phase);

  // Only render on game end; fall back gracefully if window is undefined
  if (typeof window === "undefined" || phase !== "ended") return null;

  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <ConfettiLib
      width={width}
      height={height}
      numberOfPieces={300}
      recycle={false}
      gravity={0.25}
      tweenDuration={6000}
    />
  );
}


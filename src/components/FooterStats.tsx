import React from 'react';
import { useTelemetry } from '../hooks/useTelemetry';

export function FooterStats() {
  const { depth, pitch, roll, yaw } = useTelemetry();

  return (
    <footer className="h-7 border-t border-white/[0.08] bg-[#070b14] px-3 flex items-center justify-between text-[11px] font-mono select-none shrink-0 overflow-x-auto text-neutral-400 gap-4">
      {/* Primary Vehicle Readouts */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-white font-semibold">AUV-9</span>
          <span className="text-emerald-400 font-bold">NOMINAL</span>
        </div>

        <span className="text-white/15">|</span>

        <div className="flex items-center gap-1">
          <span className="text-neutral-500">DEPTH:</span>
          <span className="text-cyan-300 font-bold">{depth.toFixed(2)}m</span>
        </div>

        <span className="text-white/15">|</span>

        <div className="flex items-center gap-1">
          <span className="text-neutral-500">PROP:</span>
          <span className="text-white font-bold">1,450 RPM</span>
        </div>

        <span className="text-white/15">|</span>

        <div className="flex items-center gap-1">
          <span className="text-neutral-500">BUS:</span>
          <span className="text-amber-300 font-bold">11.4V / 1.82A</span>
        </div>

        <span className="text-white/15">|</span>

        <div className="flex items-center gap-1">
          <span className="text-neutral-500">SONAR:</span>
          <span className="text-cyan-400 font-bold">200kHz PZT (ACTIVE)</span>
        </div>

        <span className="text-white/15">|</span>

        <div className="flex items-center gap-1">
          <span className="text-neutral-500">ATTITUDE:</span>
          <span className="text-neutral-200 font-mono">
            P {pitch > 0 ? '+' : ''}{pitch.toFixed(1)}° • R {roll > 0 ? '+' : ''}{roll.toFixed(1)}° • Y {yaw.toFixed(0)}°
          </span>
        </div>
      </div>

      {/* Right Architecture Pill */}
      <div className="hidden lg:flex items-center gap-2 text-[10px] shrink-0">
        <span className="text-neutral-500">TRIM:</span>
        <span className="text-emerald-400 font-bold">+8N NEUTRAL</span>
        <span className="text-white/15">•</span>
        <span className="text-neutral-500">HULL:</span>
        <span className="text-neutral-300">PLA 100mm DUAL O-RING</span>
      </div>
    </footer>
  );
}

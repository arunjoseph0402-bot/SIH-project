import React from 'react';
import { 
  ArrowLeft, 
  Layers, 
  Radio, 
  Activity, 
  Maximize2, 
  Minimize2, 
  Box, 
  FileText, 
  SlidersHorizontal,
  Compass,
  Zap,
  Lock
} from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';

export type OperatorTab = '3d' | 'blueprint' | 'slam' | 'telemetry';

interface HeaderProps {
  onReturnToWebsite?: () => void;
  activeTab: OperatorTab;
  onTabChange: (tab: OperatorTab) => void;
  showSubsystems: boolean;
  onToggleSubsystems: () => void;
  showInspector: boolean;
  onToggleInspector: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

export function Header({
  onReturnToWebsite,
  activeTab,
  onTabChange,
  showSubsystems,
  onToggleSubsystems,
  showInspector,
  onToggleInspector,
  isZenMode,
  onToggleZenMode
}: HeaderProps) {
  const { depth } = useTelemetry();

  return (
    <header className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-[#070b14] text-abyssal-text shrink-0 gap-2 font-mono select-none">
      {/* Left: Website Return + Vehicle Callsign */}
      <div className="flex items-center gap-2.5">
        {onReturnToWebsite && (
          <button
            onClick={onReturnToWebsite}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-400 hover:text-black border border-cyan-500/40 text-cyan-300 rounded text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,242,255,0.15)]"
            title="Return to Public Overview Website"
          >
            <ArrowLeft size={13} />
            <span>WEBSITE</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold text-xs tracking-wider">
              AUV-9 ABYSS-PoC
            </span>
          </div>
          
          <div className="hidden xl:flex items-center gap-1 text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <Lock size={10} />
            <span>PLA 100mm SPEC</span>
          </div>
        </div>
      </div>

      {/* Center: Clean Segmented Mode Selector */}
      <nav className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10">
        <button
          onClick={() => onTabChange('3d')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            activeTab === '3d'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box size={13} />
          <span>3D TWIN</span>
        </button>

        <button
          onClick={() => onTabChange('blueprint')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            activeTab === 'blueprint'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText size={13} />
          <span>BLUEPRINT</span>
        </button>

        <button
          onClick={() => onTabChange('slam')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            activeTab === 'slam'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio size={13} />
          <span>ROBOVAC SLAM</span>
        </button>

        <button
          onClick={() => onTabChange('telemetry')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
            activeTab === 'telemetry'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,255,0.4)]'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity size={13} />
          <span>TELEMETRY & AUDIT</span>
        </button>
      </nav>

      {/* Right: Real-time Telemetry Indicators & Quick Drawer Toggles */}
      <div className="flex items-center gap-2">
        {/* Quick Live Telemetry Readouts */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-black/40 border border-white/5 px-2.5 py-1 rounded">
          <div className="flex items-baseline gap-1">
            <span className="text-neutral-400 text-[10px]">DEPTH</span>
            <span className="text-emerald-400 font-bold">{depth.toFixed(2)}m</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-baseline gap-1">
            <span className="text-neutral-400 text-[10px]">BATT</span>
            <span className="text-cyan-300 font-bold">11.4V</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-baseline gap-1">
            <span className="text-neutral-400 text-[10px]">BLDC</span>
            <span className="text-white font-bold">1,450 RPM</span>
          </div>
        </div>

        {/* Drawer & Zen Mode Controls */}
        <div className="flex items-center gap-1">
          {/* Subsystems Drawer Toggle */}
          <button
            onClick={onToggleSubsystems}
            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border transition-all ${
              showSubsystems && !isZenMode
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                : 'bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Subsystem Hierarchy & Sonar Radar Drawer"
          >
            <Radio size={12} />
            <span className="hidden sm:inline">Radar</span>
          </button>

          {/* Inspector Drawer Toggle */}
          <button
            onClick={onToggleInspector}
            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border transition-all ${
              showInspector && !isZenMode
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                : 'bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Hardware Inspector Drawer"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">Inspector</span>
          </button>

          {/* Zen / Focus Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            className={`p-1 rounded text-xs border transition-all ${
              isZenMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white'
            }`}
            title={isZenMode ? 'Exit Zen Mode (Show Drawers)' : 'Enter Zen Mode (Full Canvas Focus)'}
          >
            {isZenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}

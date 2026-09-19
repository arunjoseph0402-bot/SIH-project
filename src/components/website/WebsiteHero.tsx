import React, { useState, useEffect } from 'react';
import { 
  Sparkles,
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  Radio, 
  Activity, 
  Box, 
  Cpu, 
  Search, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  Check, 
  Compass,
  Zap,
  Gauge,
  Droplets,
  BatteryCharging,
  Maximize2
} from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';

interface WebsiteHeroProps {
  onOpenConsole: () => void;
}

export function WebsiteHero({ onOpenConsole }: WebsiteHeroProps) {
  const telemetry = useTelemetry();
  const [chartPoints, setChartPoints] = useState<number[]>([18.2, 19.4, 21.0, 20.6, 22.8, 23.5, 24.12]);

  // Continuously update live chart data to make the dashboard feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setChartPoints((prev) => {
        const next = [...prev.slice(1), +(telemetry.depth).toFixed(2)];
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [telemetry.depth]);

  return (
    <section id="overview" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#060709] text-white">
      {/* Background Soft Glow & Minimal Radial Vignette matching the template */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-white/[0.04] via-cyan-500/[0.02] to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. Centered Top Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 text-xs font-sans text-neutral-300 backdrop-blur-md transition-all cursor-default shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-white">AUV-9 Subsea Platform</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400 flex items-center gap-1">
              Autonomous Acoustic SLAM
              <Zap size={11} className="text-amber-400" />
            </span>
          </div>
        </div>

        {/* 2. Hero Centered Headline & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-sans font-semibold sm:font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] tracking-[-0.03em] leading-[1.08] text-white">
            Explore the deep with <br className="hidden sm:inline" />
            intelligent acoustic agents.
          </h1>

          <p className="mt-5 text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            Meet the system for modern subsea bathymetry. Streamline sonar mapping,
            reactive obstacle evasion, and real-time 3D telemetry.
          </p>

          {/* Centered Pill Button matching template */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenConsole}
              className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-sans font-semibold text-sm tracking-tight shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2 group"
            >
              <span>Launch Operator Console</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#digital-twin"
              className="px-5 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.09] text-neutral-300 hover:text-white border border-white/10 font-sans text-sm tracking-tight transition-all flex items-center gap-2"
            >
              <Box size={14} />
              <span>Explore 3D Digital Twin</span>
            </a>
          </div>
        </div>

        {/* 3. The Signature 2-Card Hero Bento Grid (Direct reproduction of the template layout) */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT BENTO CARD: Real-time Inspection & Testimonial Overlay (~40% width) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)] group">
            
            {/* Ambient inner gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[90px] pointer-events-none" />
            
            {/* Card Eyebrow */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-xs font-sans font-medium text-neutral-400">
                Autonomous survey, faster
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/5 border border-white/10 text-neutral-300">
                LIVE HUD
              </span>
            </div>

            {/* Visual Viewport: Subsea Torpedo HUD Simulation */}
            <div className="relative z-10 my-2 rounded-xl bg-[#08090d] border border-white/[0.06] h-64 sm:h-72 p-4 flex flex-col justify-between overflow-hidden">
              
              {/* Bathymetric Grid and Target Crosshairs */}
              <div className="absolute inset-0 bg-[radial-gradient(#00f0ff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent pointer-events-none" />

              {/* HUD Header */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 z-10">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Radio size={12} className="animate-pulse" />
                  <span>PZT 200kHz ACTIVE</span>
                </span>
                <span>40.2°N, 70.8°W</span>
              </div>

              {/* Central Torpedo Model Stylized Wireframe Silhouette */}
              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="relative w-48 h-20 flex items-center justify-center">
                  
                  {/* Acoustic Conical Beam */}
                  <div className="absolute left-[-20px] w-24 h-24 bg-gradient-to-r from-cyan-400/20 to-transparent clip-path-polygon opacity-60 animate-pulse pointer-events-none" style={{ clipPath: 'polygon(100% 50%, 0% 0%, 0% 100%)' }} />

                  {/* Sleek Torpedo Silhouette */}
                  <div className="w-36 h-10 rounded-full bg-gradient-to-r from-neutral-700 via-neutral-800 to-neutral-900 border border-white/20 relative shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-between px-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono text-neutral-300 font-bold">AUV-9</span>
                      <span className="text-[8px] font-mono text-emerald-400">3S 11.18V</span>
                    </div>
                    {/* Tail Propeller Screws */}
                    <div className="w-1.5 h-6 bg-cyan-400/80 rounded-sm animate-spin" />
                  </div>
                </div>
              </div>

              {/* HUD Footer Status */}
              <div className="flex items-center justify-between text-[10px] font-mono z-10">
                <div className="text-neutral-400">
                  DEPTH: <strong className="text-white">{telemetry.depth.toFixed(2)} m</strong>
                </div>
                <div className="text-neutral-400">
                  BEARING: <strong className="text-cyan-400">{telemetry.heading}° N</strong>
                </div>
              </div>
            </div>

            {/* Testimonial / Mission Log Overlay Card (Matches template bottom left) */}
            <div className="relative z-10 mt-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                "AUV-9 navigated 4.2 km of complex bathymetric trenches with zero acoustic dropouts and sub-meter grid accuracy."
              </p>
              
              <div className="mt-3 flex items-center gap-2.5 pt-2.5 border-t border-white/[0.06]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-black font-bold text-[10px]">
                  AU
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-sans font-medium text-white leading-tight">Autonomous Mission Log</span>
                  <span className="text-[10px] font-sans text-neutral-400 leading-tight">Woods Hole Shallow Survey</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT BENTO CARD: Software-Defined Sonar & State Matrix (~60% width) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)]">
            
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none" />

            {/* Eyebrow Header */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-xs font-sans font-medium text-neutral-400">
                Acoustic telemetry & subsystem matrix
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>100Hz TELEMETRY STREAM</span>
              </div>
            </div>

            {/* Inner Split: Left Chart Sub-widget + Right Table Sub-widget */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-auto">
              
              {/* Left Sub-Widget: Depth Sounding & Live Line Chart (Matches $120,000 card in screenshot) */}
              <div className="md:col-span-5 rounded-xl bg-[#08090d] border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-sans mb-1">
                    <span>Echogram Depth</span>
                    <span className="text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      MS5837
                    </span>
                  </div>
                  
                  {/* Big Headline Number */}
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-sans font-bold text-white tracking-tight">
                      {telemetry.depth.toFixed(2)}
                    </span>
                    <span className="text-xs font-sans text-neutral-400">meters</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 block mt-0.5">
                    Hydrostatic: {telemetry.pressureMbar} mbar
                  </span>
                </div>

                {/* SVG Spline Chart */}
                <div className="my-4 h-24 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 160 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal grid guide lines */}
                    <line x1="0" y1="15" x2="160" y2="15" stroke="#ffffff10" strokeDasharray="3 3" />
                    <line x1="0" y1="35" x2="160" y2="35" stroke="#ffffff10" strokeDasharray="3 3" />
                    
                    {/* Area fill */}
                    <path
                      d={`M 0,60 L 0,${50 - (chartPoints[0] - 15) * 2.5} L 26,${50 - (chartPoints[1] - 15) * 2.5} L 53,${50 - (chartPoints[2] - 15) * 2.5} L 80,${50 - (chartPoints[3] - 15) * 2.5} L 106,${50 - (chartPoints[4] - 15) * 2.5} L 133,${50 - (chartPoints[5] - 15) * 2.5} L 160,${50 - (chartPoints[6] - 15) * 2.5} L 160,60 Z`}
                      fill="url(#depthGrad)"
                    />
                    
                    {/* Primary Curve */}
                    <path
                      d={`M 0,${50 - (chartPoints[0] - 15) * 2.5} L 26,${50 - (chartPoints[1] - 15) * 2.5} L 53,${50 - (chartPoints[2] - 15) * 2.5} L 80,${50 - (chartPoints[3] - 15) * 2.5} L 106,${50 - (chartPoints[4] - 15) * 2.5} L 133,${50 - (chartPoints[5] - 15) * 2.5} L 160,${50 - (chartPoints[6] - 15) * 2.5}`}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="2"
                    />

                    {/* Active Live Pulse Dot on right end */}
                    <circle cx="160" cy={50 - (chartPoints[6] - 15) * 2.5} r="3" fill="#00f0ff" />
                    <circle cx="160" cy={50 - (chartPoints[6] - 15) * 2.5} r="6" fill="#00f0ff" opacity="0.3" className="animate-ping" />
                  </svg>
                </div>

                {/* Bottom stats of left sub-widget */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>3S POWER: <strong className="text-white">{telemetry.powerWatts}W</strong></span>
                  <span>VEL: <strong className="text-cyan-400">{telemetry.speedOfSoundMs}m/s</strong></span>
                </div>
              </div>

              {/* Right Sub-Widget: Hardware Subsystems Table (Matches company list in screenshot!) */}
              <div className="md:col-span-7 rounded-xl bg-[#08090d] border border-white/[0.06] p-4 flex flex-col justify-between">
                
                {/* Micro-toolbar */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2 text-[11px] text-neutral-400 font-sans">
                  <span className="font-medium text-white">Subsystems</span>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <SlidersHorizontal size={13} className="hover:text-white cursor-pointer" />
                    <Search size={13} className="hover:text-white cursor-pointer" />
                    <Layers size={13} className="hover:text-white cursor-pointer" />
                  </div>
                </div>

                {/* Subsystem List Table matching the screenshot rows */}
                <div className="space-y-1.5 font-sans">
                  
                  {/* Row 1: PLA Hull */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                        H
                      </div>
                      <div>
                        <span className="font-medium text-white block leading-tight">PLA Torpedo Fuselage</span>
                        <span className="text-[10px] text-neutral-400 leading-tight">450mm × 100mm Ø</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium">
                      +1.2N Buoyant
                    </span>
                  </div>

                  {/* Row 2: BLDC Thruster */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                        M
                      </div>
                      <div>
                        <span className="font-medium text-white block leading-tight">BLDC Thruster & Servos</span>
                        <span className="text-[10px] text-neutral-400 leading-tight">Magnetic Outrunner</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-medium">
                      {telemetry.motorRpm} RPM
                    </span>
                  </div>

                  {/* Row 3: 3S Li-ion Battery */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        B
                      </div>
                      <div>
                        <span className="font-medium text-white block leading-tight">3S Li-ion & INA219</span>
                        <span className="text-[10px] text-neutral-400 leading-tight">18650 2600mAh Pack</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 font-medium">
                      {telemetry.busVoltageV}V ({telemetry.batterySocPct}%)
                    </span>
                  </div>

                  {/* Row 4: 200kHz Sonar */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                        S
                      </div>
                      <div>
                        <span className="font-medium text-white block leading-tight">200kHz PZT Transceiver</span>
                        <span className="text-[10px] text-neutral-400 leading-tight">ADS1115 AFE Digitizer</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20 font-medium">
                      {telemetry.sonarPingRateHz} Hz Ping
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* Bottom Tagline matching template */}
            <div className="relative z-10 mt-4 pt-3 border-t border-white/[0.06] text-xs text-neutral-400 font-sans">
              Focus on survey objectives — autonomous obstacle evasion handles the rest.
            </div>

          </div>

        </div>

        {/* 4. Sleek Monochrome Tech Stack / Logo Bar matching the template */}
        <div className="mt-20 pt-10 border-t border-white/[0.06] text-center">
          <p className="text-xs font-sans text-neutral-500 tracking-wider uppercase mb-6">
            Trusted and powered by open subsea & robotics standards
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all text-neutral-400">
            <div className="flex items-center gap-2 text-sm font-sans font-semibold tracking-tight">
              <Cpu size={16} />
              <span>STM32 ARM</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-sans font-semibold tracking-tight">
              <Zap size={16} />
              <span>Texas Instruments</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-sans font-semibold tracking-tight">
              <Box size={16} />
              <span>Three.js WebGL</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-sans font-semibold tracking-tight">
              <Radio size={16} />
              <span>PZT Acoustics</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-sans font-semibold tracking-tight">
              <Gauge size={16} />
              <span>MS5837 Subsea</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-sans font-semibold tracking-tight">
              <Compass size={16} />
              <span>ROS 2 Humble</span>
            </div>
          </div>
        </div>

        {/* 5. Second Feature Block from template: "Verify access requests before they leave the device" -> "Verify seabed clearance before navigating unknown trenches" */}
        <div className="mt-28 sm:mt-36 text-center max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-5">
            <ShieldCheck size={13} className="text-cyan-400" />
            <span>Real-Time Autonomy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-white tracking-tight leading-[1.15]">
            Verify seabed clearance before navigating unknown trenches
          </h2>

          <p className="mt-4 text-neutral-400 text-sm sm:text-base font-sans leading-relaxed">
            Meet the subsea navigation stack powered by dual STM32 architecture,
            200kHz acoustic sonar arrays, and real-time Artificial Potential Field obstacle evasion.
          </p>

          {/* 3-Column Bento Cards below Section 2 matching screenshot bottom */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            
            {/* Card 1: Dual STM32 Architecture (Like Notion-style checklist) */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span className="font-sans font-medium text-white">Dual STM32 Architecture</span>
                  <Cpu size={14} className="text-cyan-400" />
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-4">
                  Dedicated master payload DSP and independent navigation/servo controller.
                </p>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-emerald-400 shrink-0" />
                    <span>STM32F407 (168MHz) Master DSP</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-emerald-400 shrink-0" />
                    <span>STM32F103 (72MHz) Fin Servos & Attitude</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-emerald-400 shrink-0" />
                    <span>Deterministic 100Hz telemetry bus</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] text-neutral-500 font-mono">
                ZERO-JITTER DMA SAMPLING
              </div>
            </div>

            {/* Card 2: 200kHz Sonar Transceiver */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span className="font-sans font-medium text-white">200kHz Acoustic Transceiver</span>
                  <Radio size={14} className="text-amber-400" />
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-4">
                  Software-defined acoustic front-end for high-resolution bathymetric sounding.
                </p>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-amber-400 shrink-0" />
                    <span>Disc PZT Transducer in epoxy potting</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-amber-400 shrink-0" />
                    <span>ADS1115 16-Bit ADC @ 860 SPS</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-amber-400 shrink-0" />
                    <span>TL072 low-noise pre-amplification</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] text-neutral-500 font-mono">
                SUB-DECIMETER RESOLUTION
              </div>
            </div>

            {/* Card 3: Real-Time 3D Digital Twin */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
                  <span className="font-sans font-medium text-white">Live 3D Digital Twin</span>
                  <Box size={14} className="text-emerald-400" />
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-4">
                  Interactive WebGL visualizer for internal PLA rail mounting and electronics tray.
                </p>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-cyan-400 shrink-0" />
                    <span>Ghost & X-Ray hull transparency</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-cyan-400 shrink-0" />
                    <span>Direct component raycast inspection</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Check size={12} className="text-cyan-400 shrink-0" />
                    <span>Live in-browser Three.js geometry editor</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] text-neutral-500 font-mono">
                PARAMETRIC 3D CAD TWIN
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

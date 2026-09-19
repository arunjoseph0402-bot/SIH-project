import React from 'react';
import { BatteryTelemetryChart } from '../BatteryTelemetryChart';
import { ComponentHealth } from '../ComponentHealth';
import { useTelemetry } from '../../hooks/useTelemetry';
import { 
  Activity, 
  Zap, 
  Compass, 
  Waves, 
  Cpu
} from 'lucide-react';

export function TelemetryLiveSection() {
  const { depth, pitch, roll, yaw, busVoltageV, busCurrentA, powerWatts } = useTelemetry();

  return (
    <section id="telemetry" className="py-24 bg-[#060709] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching template */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-3">
              <Activity size={13} className="text-emerald-400" />
              <span>Real-Time Sensor Bus</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-white tracking-tight">
              Live Telemetry & Subsystem Health
            </h2>
            <p className="text-sm text-neutral-400 font-sans mt-2 max-w-xl leading-relaxed">
              Streaming diagnostics from internal Texas Instruments INA219 current monitors, MS5837 depth sensors, and dual STM32 controllers via 100Hz telemetry loops.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 font-mono text-xs text-emerald-400 bg-white/[0.03] px-3.5 py-2 border border-white/[0.08] rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100Hz TELEMETRY STREAM SYNCHRONIZED</span>
          </div>
        </div>

        {/* Telemetry Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Columns: Recharts Battery Chart & Dynamic Gauges */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Chart Container */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-amber-400" size={16} />
                  <span className="font-sans font-semibold text-sm text-white">
                    INA219 Power Shunt Telemetry (11.1V 3S Rail)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">100Hz POLLING</span>
              </div>
              <p className="text-xs text-neutral-400 font-sans mb-4">
                Real-time voltage stability and thruster current draws captured via I2C shunt resistors.
              </p>
              
              <div className="w-full">
                <BatteryTelemetryChart />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.06] text-center font-sans">
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">Bus Voltage</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{busVoltageV} V</span>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">Current Draw</span>
                  <span className="text-base font-bold text-amber-400 mt-0.5 block">{busCurrentA} A</span>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">Power Dissipated</span>
                  <span className="text-base font-bold text-emerald-400 mt-0.5 block">{powerWatts} W</span>
                </div>
              </div>
            </div>

            {/* Depth & Pressure Barometer Card */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-4 font-sans text-xs">
                <span className="text-white font-semibold flex items-center gap-2 text-sm">
                  <Waves size={16} className="text-cyan-400" />
                  MS5837-30BA Subsea Pressure & Sound Speed
                </span>
                <span className="text-cyan-400 font-mono font-bold text-sm">{depth.toFixed(2)} METERS</span>
              </div>

              <div className="w-full bg-white/[0.04] h-2.5 rounded-full overflow-hidden border border-white/[0.06]">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300 shadow-[0_0_10px_#00f0ff]"
                  style={{ width: `${Math.min(100, (depth / 30) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mt-3">
                <span>0m SURFACE</span>
                <span>PROOF-OF-CONCEPT DEPTH: ~20m</span>
                <span>MAX TEST TANK: 30m</span>
              </div>
            </div>

          </div>

          {/* Right 5 Columns: Inertial Compass & Component Health Matrix */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Attitude Horizon & Compass Card */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-sans">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Compass size={16} className="text-cyan-400" />
                  Inertial Attitude Horizon (IMU)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  CALIBRATED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-4 font-sans">
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">PITCH</span>
                  <span className="text-base font-bold text-white">{pitch > 0 ? '+' : ''}{pitch.toFixed(1)}°</span>
                  <span className="text-[9px] text-neutral-500 block mt-1">TRIM ACTIVE</span>
                </div>

                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">ROLL</span>
                  <span className="text-base font-bold text-white">{roll > 0 ? '+' : ''}{roll.toFixed(1)}°</span>
                  <span className="text-[9px] text-neutral-500 block mt-1">REST</span>
                </div>

                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">HEADING</span>
                  <span className="text-base font-bold text-cyan-400">{yaw.toFixed(1)}°</span>
                  <span className="text-[9px] text-neutral-500 block mt-1">MAGNETIC N</span>
                </div>
              </div>

              {/* Graphic Attitude Horizon Visualizer */}
              <div className="h-16 w-full bg-[#08090d] border border-white/[0.06] rounded-xl relative overflow-hidden flex items-center justify-center">
                <div 
                  className="w-full h-[2px] bg-cyan-400 transition-transform duration-100 shadow-[0_0_8px_#00f0ff]"
                  style={{ transform: `rotate(${roll}deg) translateY(${pitch * 1.5}px)` }}
                />
                <div className="w-2 h-2 rounded-full border border-amber-400 absolute" />
                <div className="absolute text-[9px] text-neutral-400 bottom-1.5 right-2.5 font-mono">
                  STABILIZATION: ±0.2° PID
                </div>
              </div>
            </div>

            {/* Component Health Matrix */}
            <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3 font-sans">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu size={16} className="text-cyan-400" />
                  Subsystem Health Matrix
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">ALL NOMINAL</span>
              </div>
              <p className="text-xs text-neutral-400 font-sans mb-3">
                Continuous hardware integrity polling covering STM32 buses, moisture sensors, and ESC drivers.
              </p>

              <ComponentHealth />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

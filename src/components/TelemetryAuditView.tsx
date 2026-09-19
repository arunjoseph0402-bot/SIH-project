import React from 'react';
import { 
  Activity, 
  Battery, 
  Cpu, 
  Radio, 
  Shield, 
  Zap, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Anchor,
  Gauge,
  Waves
} from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';
import { BatteryTelemetryChart } from './BatteryTelemetryChart';
import { ComponentHealth } from './ComponentHealth';
import { SonarRadar } from './SonarRadar';

export function TelemetryAuditView() {
  const { depth, pitch, roll, yaw } = useTelemetry();

  return (
    <div className="h-full w-full bg-[#060911] text-abyssal-text font-mono overflow-y-auto p-4 space-y-4">
      {/* Top Banner Status */}
      <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">
              AUV-9 TELEMETRY & DIAGNOSTIC AUDIT
            </h2>
            <p className="text-xs text-neutral-400">
              Real-time instrumentation bus • I2C INA219 • MS5837 Depth • MPU6050 IMU • STM32F407 Payload Master
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-neutral-400 uppercase text-[10px]">Bilge Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> DRY (0% INGRESS)
            </span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Lock size={12} />
            <span className="font-semibold text-[11px]">PLA WATERPROOF SPEC</span>
          </div>
        </div>
      </div>

      {/* 3-Column Diagnostic Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Column 1: Subsystems & Sonar Radar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sonar Acoustic Sweep */}
          <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={13} className="text-cyan-400" />
                200kHz Acoustic Radar
              </span>
              <span className="text-[10px] text-neutral-400">PING: 10Hz</span>
            </div>
            
            <div className="flex justify-center my-2">
              <SonarRadar />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px]">
              <div className="bg-black/40 p-2 rounded border border-white/5">
                <span className="text-neutral-400 text-[9px] block uppercase">Transducer</span>
                <span className="text-emerald-400 font-bold">PZT 200kHz Disc</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-white/5">
                <span className="text-neutral-400 text-[9px] block uppercase">Analog Preamp</span>
                <span className="text-purple-400 font-bold">+38 dB (TL072)</span>
              </div>
            </div>
          </div>

          {/* Subsystems Status List */}
          <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3 pb-2 border-b border-white/10">
              Subsystem Bus Nodes
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'STM32F407 Payload Master', bus: '168MHz MCU', status: 'NOMINAL', color: 'text-emerald-400' },
                { name: 'PZT Sonar Transducer', bus: '200kHz PWM', status: 'ACTIVE', color: 'text-cyan-400' },
                { name: 'MS5837-30BA Depth Sensor', bus: 'I2C 0x76', status: 'NOMINAL', color: 'text-emerald-400' },
                { name: 'INA219 Power Monitor', bus: 'I2C 0x40', status: 'STREAMING', color: 'text-emerald-400' },
                { name: 'Dual Rudder Servos', bus: '50Hz PWM', status: 'TRIMMED', color: 'text-amber-400' },
                { name: 'BLDC Propeller Motor', bus: 'DShot / PWM', status: '1,450 RPM', color: 'text-cyan-300' }
              ].map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/5">
                  <div>
                    <div className="text-neutral-200 font-semibold">{sub.name}</div>
                    <div className="text-[10px] text-neutral-400">{sub.bus}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 ${sub.color}`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: INA219 Battery & Power Distribution (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Battery size={13} className="text-emerald-400" />
                INA219 Li-ion Power Rail
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                11.4V • 94% SOC
              </span>
            </div>

            {/* Power Telemetry Line Chart */}
            <div className="h-44 w-full">
              <BatteryTelemetryChart />
            </div>

            {/* Split Voltage Rails */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-neutral-400 block mb-1">MAIN BUS</span>
                <span className="text-sm font-bold text-cyan-300">11.4 V</span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">3S Li-ion</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-neutral-400 block mb-1">SERVO RAIL</span>
                <span className="text-sm font-bold text-amber-300">5.0 V</span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">MP1584 Buck</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-neutral-400 block mb-1">LOGIC / MCU</span>
                <span className="text-sm font-bold text-emerald-300">3.3 V</span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">MP1584 Buck</span>
              </div>
            </div>

            {/* Charging & Endurance Metrics */}
            <div className="mt-3 bg-black/40 p-3 rounded-lg border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Draw:</span>
                <span className="text-cyan-300 font-bold">1.82 A (Average Cruise)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Capacity:</span>
                <span className="text-white font-bold">2,600 mAh (28.8 Wh)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Est. Mission Endurance:</span>
                <span className="text-emerald-400 font-bold">85 Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Charge Subsystem:</span>
                <span className="text-amber-400 font-bold">TP4055 External Bulkhead</span>
              </div>
            </div>
          </div>

          {/* Component Health Matrix */}
          <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4">
            <ComponentHealth />
          </div>
        </div>

        {/* Column 3: Attitude & Hull Mechanical Audit (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Inertial Navigation / Attitude */}
          <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={13} className="text-cyan-400" />
                Inertial Navigation (IMU)
              </span>
              <span className="text-[10px] text-emerald-400">TRUE NORTH</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2 text-center">
              <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                <span className="text-[10px] text-neutral-400 block mb-1">PITCH</span>
                <span className="text-base font-bold text-white font-mono">
                  {pitch > 0 ? '+' : ''}{pitch.toFixed(1)}°
                </span>
              </div>
              <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                <span className="text-[10px] text-neutral-400 block mb-1">ROLL</span>
                <span className="text-base font-bold text-white font-mono">
                  {roll > 0 ? '+' : ''}{roll.toFixed(1)}°
                </span>
              </div>
              <div className="bg-black/50 p-2.5 rounded-lg border border-white/10">
                <span className="text-[10px] text-neutral-400 block mb-1">YAW</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {yaw.toFixed(1)}°
                </span>
              </div>
            </div>

            <div className="mt-3 bg-black/40 p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Current Depth (MS5837):</span>
              <span className="text-emerald-400 font-bold text-sm">{depth.toFixed(2)} m</span>
            </div>
          </div>

          {/* Hull Material & Mechanical Spec */}
          <div className="bg-[#0b101d] border border-white/10 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={13} className="text-amber-400" />
                Fuselage & Buoyancy Trim
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold">PoC REV 1.1</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                <span className="text-neutral-400">Material Composition:</span>
                <span className="text-amber-300 font-bold">Watertight PLA (100% Infill)</span>
              </div>
              <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                <span className="text-neutral-400">Fuselage Dimensions:</span>
                <span className="text-white font-bold">450 mm LOA × 100 mm Beam</span>
              </div>
              <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                <span className="text-neutral-400">Dry Mass (Displacement):</span>
                <span className="text-white font-bold">1,850 g</span>
              </div>
              <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                <span className="text-neutral-400">Buoyancy Trim:</span>
                <span className="text-emerald-400 font-bold">+8 N Positive (Near-Neutral)</span>
              </div>
              <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                <span className="text-neutral-400">Watertight Sealing:</span>
                <span className="text-white font-bold">Dual NBR O-Rings + Stuffing Box</span>
              </div>
              <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5">
                <span className="text-neutral-400">Test Depth Envelope:</span>
                <span className="text-cyan-300 font-bold">10 Meters (Pool / Tank)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

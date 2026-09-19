import { CheckCircle2 } from 'lucide-react';
import { ComponentHealth } from './ComponentHealth';
import { BatteryTelemetryChart } from './BatteryTelemetryChart';
import { useTelemetry } from '../hooks/useTelemetry';

export function InspectorPanel() {
  const { pitch, roll, yaw } = useTelemetry();

  return (
    <div className="flex flex-col h-full bg-abyssal-base border border-abyssal-border w-[28rem] shrink-0">
      <div className="p-4 border-b border-abyssal-border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-abyssal-amber text-[10px] uppercase tracking-widest">
            // SUBSYSTEM HARDWARE INSPECTOR
          </span>
          <span className="border border-abyssal-amber px-1 text-abyssal-amber text-[10px] uppercase font-bold">
            LOCKED CONFIG (HDPE)
          </span>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="text-abyssal-amber font-bold">Structural / Hull</span>
            <span className="text-abyssal-amber font-bold">Composite</span>
          </div>
          <div className="text-[10px] text-abyssal-muted text-right uppercase tracking-widest flex flex-col">
            <span>PRIMARY OUTER</span>
            <span>PRESSURE SHELL</span>
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-abyssal-text mb-2 leading-tight">HDPE Composite Monocoque Fuselage</h2>
        <p className="text-xs text-abyssal-muted leading-relaxed mb-4">
          High-Density Polyethylene isobaric fairing. Acoustically transparent for internal sonar pings, near-neutral buoyancy in brine, zero galvanic corrosion.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
           <div className="flex flex-col gap-1 border-l-2 border-abyssal-border pl-2">
              <span className="text-[10px] text-abyssal-muted uppercase tracking-widest">HARDWARE SPECS</span>
              <span className="text-abyssal-text font-mono">0.96 g/cm³ | 24mm S...</span>
           </div>
           <div className="flex flex-col gap-1 border-l-2 border-abyssal-border pl-2">
              <span className="text-[10px] text-abyssal-muted uppercase tracking-widest">OPERATING VOLTAGE</span>
              <span className="text-abyssal-amber font-mono font-bold">N/A (Galvanic Neutral)</span>
           </div>
           <div className="flex flex-col gap-1 border-l-2 border-abyssal-border pl-2">
              <span className="text-[10px] text-abyssal-muted uppercase tracking-widest">THERMAL READOUT</span>
              <span className="text-abyssal-text font-mono">4.8 °C Subsea Ambient</span>
           </div>
           <div className="flex flex-col gap-1 border-l-2 border-abyssal-border pl-2">
              <span className="text-[10px] text-abyssal-muted uppercase tracking-widest">SUBSYSTEM HEALTH</span>
              <span className="text-abyssal-green font-mono font-bold">LOCKED / OPTIMAL</span>
           </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-abyssal-muted uppercase tracking-widest mb-2 font-mono">
           <span>HDPE/BLDC/BATTERY INTEGRITY AUDIT</span>
           <span className="text-abyssal-text">100% PASS</span>
        </div>
        <div className="w-full h-1 bg-abyssal-border mb-4"><div className="w-full h-full bg-abyssal-cyan"></div></div>
        
        <div className="flex gap-2 font-mono text-[10px] uppercase font-bold tracking-widest">
           <button className="flex-1 bg-abyssal-cyan text-black py-2 hover:bg-abyssal-cyan/80">INSPECT BLDC MOTOR</button>
           <button className="flex-1 bg-abyssal-panel border border-abyssal-border text-abyssal-text hover:bg-abyssal-border py-2">24V BATTERY</button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 bg-abyssal-panel/30 overflow-y-auto">
         <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-widest font-mono">
            <span className="text-abyssal-text">// BLDC & 24V LI-ION TELEMETRY</span>
            <span className="text-abyssal-green flex items-center gap-1"><span className="w-1.5 h-1.5 bg-abyssal-green rounded-full block animate-pulse"></span> 40 Hz UDP</span>
         </div>
         
         <div className="grid grid-cols-2 gap-4 font-mono">
            <div className="flex flex-col">
               <span className="text-[10px] text-abyssal-muted tracking-widest mb-1">LI-ION BUS (INA219)</span>
               <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-abyssal-text">24.18</span>
                  <span className="text-[10px] text-abyssal-muted flex flex-col leading-[10px]">
                     <span>VDC</span><span>(94% SOC)</span>
                  </span>
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] text-abyssal-muted tracking-widest mb-1">KORT DUCT THRUST</span>
               <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-abyssal-cyan">9.8</span>
                  <span className="text-[10px] text-abyssal-muted flex flex-col leading-[10px]">
                     <span>kgf</span><span>(Fwd)</span>
                  </span>
               </div>
            </div>
         </div>

         <div className="mt-4 border-t border-abyssal-border pt-4">
            <div className="flex justify-between items-center text-[10px] text-abyssal-muted tracking-widest font-mono mb-2">
               <span>INERTIAL ATTITUDE</span>
               <span className="text-abyssal-green text-right">TRUE HDG</span>
            </div>
            <div className="flex gap-2">
               <div className="flex-1 bg-abyssal-panel border border-abyssal-border py-1 px-2 flex flex-col items-center">
                  <span className="text-[10px] text-abyssal-muted tracking-widest">PITCH</span>
                  <span className="font-bold font-mono">{pitch > 0 ? '+' : ''}{pitch.toFixed(1)}°</span>
               </div>
               <div className="flex-1 bg-abyssal-panel border border-abyssal-border py-1 px-2 flex flex-col items-center">
                  <span className="text-[10px] text-abyssal-muted tracking-widest">ROLL</span>
                  <span className="font-bold font-mono">{roll > 0 ? '+' : ''}{roll.toFixed(1)}°</span>
               </div>
               <div className="flex-1 bg-abyssal-panel border border-abyssal-border py-1 px-2 flex flex-col items-center">
                  <span className="text-[10px] text-abyssal-muted tracking-widest">YAW</span>
                  <span className="font-bold font-mono">{yaw.toFixed(1)}°</span>
               </div>
            </div>
         </div>
         
         <div className="mt-4 border-t border-abyssal-border pt-2">
            <BatteryTelemetryChart />
            <div className="mt-4">
               <ComponentHealth />
            </div>
         </div>
      </div>
    </div>
  );
}

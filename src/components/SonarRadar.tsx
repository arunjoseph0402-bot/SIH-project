import { Scan } from 'lucide-react';

export function SonarRadar() {
  return (
    <div className="flex flex-col border-t border-abyssal-border bg-abyssal-base p-4 shrink-0 mt-auto">
       <div className="flex justify-between items-center mb-4">
         <span className="text-[10px] text-abyssal-muted tracking-widest uppercase font-mono">PASSIVE SONAR ACTIVITY</span>
         <Scan size={14} className="text-abyssal-cyan" />
       </div>
       
       <div className="relative w-48 h-48 mx-auto rounded-full border border-abyssal-cyan/40 bg-[#080e18] overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          {/* Rings */}
          <div className="absolute inset-3 border border-abyssal-cyan/20 rounded-full"></div>
          <div className="absolute inset-10 border border-abyssal-cyan/20 rounded-full"></div>
          <div className="absolute inset-16 border border-abyssal-cyan/20 rounded-full"></div>
          
          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-abyssal-cyan/30"></div>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-abyssal-cyan/30"></div>
          
          {/* Sweep Gradient */}
          <div className="absolute inset-0 rounded-full animate-radar origin-center" 
               style={{ background: 'conic-gradient(from 0deg, rgba(0, 240, 255, 0) 70%, rgba(0, 240, 255, 0.4) 100%)' }}>
             <div className="absolute top-0 left-1/2 w-px h-1/2 bg-abyssal-cyan shadow-[0_0_5px_#00f0ff]"></div>
          </div>
          
          {/* Target Blips */}
          <div className="absolute w-2 h-2 bg-abyssal-green rounded-full top-10 left-12 shadow-[0_0_5px_#4edea3] animate-pulse"></div>
          <div className="absolute w-2 h-2 bg-abyssal-amber rounded-full bottom-14 right-10 shadow-[0_0_5px_#ffb95f] animate-pulse"></div>
       </div>
       
       <div className="mt-4 text-[10px] font-mono text-center text-abyssal-text">
          Live - 2m near anomalies
       </div>
    </div>
  );
}

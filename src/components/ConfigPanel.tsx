import { useState } from 'react';
import { Lock, Crosshair, ZoomIn, ZoomOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { CadViewport } from './CadViewport';

export function ConfigPanel() {
  const [explodeValue, setExplodeValue] = useState(0);

  return (
    <div className="flex flex-col h-full bg-abyssal-base border border-abyssal-border">
      <div className="p-3 border-b border-abyssal-border flex gap-4 text-[10px] uppercase tracking-widest text-abyssal-muted">
        <span className="border border-abyssal-amber/50 px-2 text-abyssal-amber">
          // CONFIGURATION STATUS:
        </span>
        <div className="flex gap-4 ml-auto text-abyssal-cyan items-center">
          <span className="flex items-center gap-1 border border-abyssal-cyan/30 px-2"><span className="w-1.5 h-1.5 bg-abyssal-cyan rounded-full animate-pulse"></span> 450kHz SLAM SWATH: ACTIVE</span>
        </div>
      </div>
      
      <div className="flex p-3 gap-2 border-b border-abyssal-border">
        <div className="flex-1 bg-abyssal-amber/10 border border-abyssal-amber/50 p-2 flex items-center justify-between text-abyssal-amber">
          <div className="flex items-center gap-2">
            <Lock size={14} />
            <span className="text-xs font-bold uppercase">Locked Spec: HDPE Monocoque Composite</span>
          </div>
          <span className="text-[10px] bg-abyssal-amber text-black px-1 font-bold">FIXED</span>
        </div>
        <div className="flex-1 bg-abyssal-panel border border-abyssal-border p-2 flex items-center gap-2 text-abyssal-text text-xs">
          <Crosshair size={14} className="text-abyssal-muted" />
          Near-Neutral Buoyancy (0.96 g/cm³)
        </div>
        <div className="flex-1 bg-abyssal-panel border border-abyssal-border p-2 flex items-center gap-2 text-abyssal-text text-xs">
          <Shield size={14} className="text-abyssal-muted" />
          Galvanic Inert / Acoustic Transparent
        </div>
        <div className="flex-col gap-1 ml-auto shrink-0 justify-center hidden sm:flex">
           <button className="border border-abyssal-cyan/50 text-abyssal-cyan text-[10px] px-2 py-0.5 hover:bg-abyssal-cyan/10 transition-colors">AUDIT TELEMETRY</button>
           <button className="border border-abyssal-green/50 text-abyssal-green text-[10px] px-2 py-0.5 hover:bg-abyssal-green/10 transition-colors">BILGE: ZERO INGRESS</button>
        </div>
      </div>

      <div className="flex p-3 text-[10px] border-b border-abyssal-border justify-between uppercase tracking-widest text-abyssal-muted font-mono">
         <div className="flex gap-8">
            <span className="text-abyssal-text">// SPEC LOCKED: HDPE MONOCOQUE</span>
            <span className="text-abyssal-green">SOLIDS VALIDATED</span>
         </div>
         <div className="flex gap-2 items-center">
            ROBOVAC SLAM BEACON <span className="w-1.5 h-1.5 bg-abyssal-amber rounded-full block"></span>
         </div>
      </div>
      <div className="flex p-3 text-[10px] text-abyssal-muted uppercase font-mono border-b border-abyssal-border">
          <div className="grid grid-cols-2 gap-x-12 gap-y-1 w-1/2">
             <div className="flex justify-between"><span>LOA:</span><span className="text-abyssal-text">6,800 mm</span></div>
             <div className="flex justify-between"><span>BEAM:</span><span className="text-abyssal-text">1,200 mm</span></div>
             <div className="flex justify-between"><span>DRY DISP:</span><span className="text-abyssal-amber font-bold">620.0 kg</span></div>
             <div className="flex justify-between"><span>CORROSION:</span><span className="text-abyssal-text">ZERO (INERT HDPE)</span></div>
          </div>
          <div className="grid grid-cols-1 gap-y-1 w-1/2 text-right">
             <div>SWATH RES: <span className="text-abyssal-text">0.05m Cell (120° Swath)</span></div>
             <div>MAX DEPTH OP: <span className="text-abyssal-amber font-bold">300 m (SHALLOW-MID)</span></div>
             <div>TRIM BUOYANCY: <span className="text-abyssal-amber font-bold">+8 N [NEAR-NEUTRAL]</span></div>
          </div>
      </div>

      <div className="flex-1 bg-[#020617] relative flex flex-col p-0 border-b border-abyssal-border overflow-hidden">
         <CadViewport explode={explodeValue / 100} />
         <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[10px] text-abyssal-muted uppercase tracking-widest z-10 pointer-events-none">
            <div className="flex items-center gap-2">
               <span className="text-abyssal-red font-bold">X</span>
               <span className="text-abyssal-green font-bold">Y</span>
               <span className="text-abyssal-cyan font-bold">Z</span>
               <span>DRAG: ROTATE • SCROLL: ZOOM</span>
            </div>
            <div className="flex gap-2 pointer-events-auto">
               <div className="flex items-center bg-abyssal-panel border border-abyssal-border px-3 py-1 gap-3">
                  <ZoomOut size={12}/>
                  <span className="text-abyssal-text">EXPLODE:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={explodeValue}
                    onChange={(e) => setExplodeValue(parseInt(e.target.value))}
                    className="w-24 h-1 cursor-pointer accent-abyssal-cyan"
                  />
                  <span className="text-abyssal-text w-6 text-right font-mono">{explodeValue}%</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Shield({ size, className }: any) { return <CheckCircle2 size={size} className={className} />; }

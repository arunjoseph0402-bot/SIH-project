import { Camera, Battery, Cpu, Radio, Map, Shield, Wifi, Anchor, Wind, Activity, Zap, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ComponentHealth() {
  const components = [
    { icon: Camera, status: 'nominal' },
    { icon: Battery, status: 'nominal' },
    { icon: Cpu, status: 'warning' },
    { icon: Radio, status: 'nominal' },
    { icon: Map, status: 'nominal' },
    { icon: Shield, status: 'nominal' },
    { icon: Wifi, status: 'error' },
    { icon: Anchor, status: 'nominal' },
    { icon: Wind, status: 'nominal' },
    { icon: Activity, status: 'nominal' },
    { icon: Zap, status: 'nominal' },
    { icon: Compass, status: 'nominal' },
  ];

  return (
    <div className="flex flex-col pt-4 shrink-0">
       <div className="flex justify-between items-center mb-3">
         <span className="text-[10px] text-abyssal-muted tracking-widest uppercase font-mono">COMPONENT HEALTH MATRIX</span>
         <Activity size={14} className="text-abyssal-cyan" />
       </div>
       
       <div className="grid grid-cols-4 gap-2">
         {components.map((Comp, i) => {
           const Icon = Comp.icon;
           const isNominal = Comp.status === 'nominal';
           const isWarn = Comp.status === 'warning';
           const isErr = Comp.status === 'error';
           
           return (
             <div key={i} className={`aspect-square flex items-center justify-center border transition-all duration-300 relative group cursor-pointer
                ${isNominal ? 'border-abyssal-cyan/30 bg-abyssal-cyan/5 text-abyssal-cyan hover:bg-abyssal-cyan/20' : ''}
                ${isWarn ? 'border-abyssal-amber/50 bg-abyssal-amber/10 text-abyssal-amber hover:bg-abyssal-amber/20' : ''}
                ${isErr ? 'border-abyssal-red/50 bg-abyssal-red/10 text-abyssal-red animate-pulse' : ''}
             `}>
                <Icon size={18} />
                {/* Status Badge */}
                <div className="absolute -bottom-1 -right-1">
                   {isNominal && <CheckCircle2 size={10} className="text-abyssal-green bg-abyssal-base rounded-full" />}
                   {isWarn && <AlertTriangle size={10} className="text-abyssal-amber bg-abyssal-base rounded-full" />}
                   {isErr && <div className="w-2.5 h-2.5 rounded-full bg-abyssal-red border border-abyssal-base"></div>}
                </div>
             </div>
           )
         })}
       </div>
    </div>
  );
}

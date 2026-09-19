import { Shield, Battery, Radio, Compass, Waves } from 'lucide-react';
import { SonarRadar } from './SonarRadar';

export function Sidebar() {
  const items = [
    { id: '01', title: 'PLA 3D-Printed Hull (Locked)', subtitle: 'Proof of Concept Prototype / Gyroid Infill', active: true },
    { id: '02', title: 'BLDC Propulsion & Kort Duct', subtitle: 'Brushless 24V / 5-Blade Rotor', active: false },
    { id: '03', title: 'RoboVac Occupancy Grid & SLAM', subtitle: '450kHz Swath / Frontier Sweep', active: false, badge: 'LIVE' },
    { id: '04', title: 'Reactive Potential Field', subtitle: 'DWA Obstacle Avoidance Matrix', active: false },
    { id: '05', title: '24V Li-Ion Power & INA219', subtitle: '240Wh Pack / TP4055 & 94% SOC', active: false },
  ];

  return (
    <aside className="w-72 border-r border-abyssal-border bg-abyssal-base flex flex-col h-full shrink-0">
      <div className="p-3 border-b border-abyssal-border text-abyssal-muted text-[10px] tracking-widest uppercase flex justify-between">
        <span>// SUBSYSTEM HIERARCHY</span>
        <span>REV 6.4.0</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 border-b border-abyssal-border flex justify-between cursor-pointer transition-colors ${
              item.active 
                ? 'bg-abyssal-amber/10 border-l-2 border-l-abyssal-amber' 
                : 'hover:bg-abyssal-panel border-l-2 border-l-transparent'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className={`font-semibold ${item.active ? 'text-abyssal-amber' : 'text-abyssal-text'}`}>
                {item.id}. {item.title}
              </span>
              <span className="text-[10px] text-abyssal-muted">{item.subtitle}</span>
            </div>
            <div className="flex flex-col items-end justify-between">
              {item.active && <span className="text-[10px] text-abyssal-amber font-bold tracking-widest">LOCK</span>}
              {!item.active && item.badge && <span className="text-[10px] text-abyssal-text font-bold tracking-widest">{item.badge}</span>}
              <span className="text-[10px] text-abyssal-muted font-bold mt-auto">{item.id}</span>
            </div>
          </div>
        ))}
      </div>
      
      <SonarRadar />
    </aside>
  );
}

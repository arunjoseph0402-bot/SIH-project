import React from 'react';
import { Sparkles, Terminal, ArrowUp, ArrowRight } from 'lucide-react';

interface WebsiteFooterProps {
  onOpenConsole: () => void;
}

export function WebsiteFooter({ onOpenConsole }: WebsiteFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#060709] border-t border-white/[0.06] pt-16 pb-12 text-neutral-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <Sparkles size={14} className="fill-current" />
              </div>
              <span className="font-semibold text-base text-white tracking-tight">AUV-9 Subsea</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Autonomous underwater vehicle proof-of-concept platform featuring a rapid-prototyping 3D-printable PLA torpedo fuselage, brushless DC propulsion, 200kHz PZT acoustic transceiver, and real-time obstacle avoidance SLAM.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] font-mono">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM NOMINAL
              </span>
              <span className="text-neutral-600">•</span>
              <span>100Hz TELEMETRY</span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-400">PLA 3D-PRINT POC</span>
            </div>
          </div>

          {/* Subsystem Links */}
          <div className="space-y-3">
            <span className="text-white font-semibold block text-xs tracking-tight">
              ARCHITECTURE
            </span>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
              <li><a href="#digital-twin" className="hover:text-white transition-colors">3D CAD Digital Twin</a></li>
              <li><a href="#subsystems" className="hover:text-white transition-colors">Subsystems Matrix</a></li>
              <li><a href="#autonomy" className="hover:text-white transition-colors">RoboVac SLAM Autonomy</a></li>
              <li><a href="#telemetry" className="hover:text-white transition-colors">Live Sensor Telemetry</a></li>
              <li><a href="#specs" className="hover:text-white transition-colors">Engineering Specs</a></li>
            </ul>
          </div>

          {/* Quick Actions & Launch Console */}
          <div className="space-y-3">
            <span className="text-white font-semibold block text-xs tracking-tight">
              OPERATOR WORKSTATION
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Launch into the mission operator console to configure thrusters, simulate sensor faults, and view real-time flight telemetry.
            </p>
            <button
              onClick={onOpenConsole}
              className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-semibold rounded-full transition-all flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Terminal size={13} />
              <span>Launch Operator Console</span>
            </button>
          </div>

        </div>

        {/* Bottom copyright and jump to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} AUV-9 Subsea Robotics Engineering Platform. Academic Proof of Concept.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>

      </div>
    </footer>
  );
}

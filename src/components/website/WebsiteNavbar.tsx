import React, { useState, useEffect } from 'react';
import { 
  Sparkles,
  Terminal, 
  Menu,
  X,
  ArrowRight,
  Radio
} from 'lucide-react';
import { useTelemetry } from '../../hooks/useTelemetry';

interface WebsiteNavbarProps {
  onOpenConsole: () => void;
  activeSection: string;
}

export function WebsiteNavbar({ onOpenConsole, activeSection }: WebsiteNavbarProps) {
  const { depth, busVoltageV, batterySocPct } = useTelemetry();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'System', href: '#overview' },
    { name: '3D Twin', href: '#digital-twin' },
    { name: 'Subsystems', href: '#subsystems' },
    { name: 'SLAM Autonomy', href: '#autonomy' },
    { name: 'Telemetry', href: '#telemetry' },
    { name: 'Specs', href: '#specs' },
    { name: 'Blueprints', href: '#blueprints' },
    { name: 'Missions', href: '#missions' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#060709]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3' 
        : 'bg-[#060709]/60 backdrop-blur-md border-b border-white/[0.04] py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo - 4-Point Star / Sparkle matching template */}
        <a href="#overview" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all">
            <Sparkles size={14} className="fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm tracking-tight text-white">AUV-9</span>
            <span className="text-[10px] text-neutral-400 font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
              SUBSEA
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-sans tracking-tight transition-all rounded-md ${
                  isActive
                    ? 'text-white font-medium bg-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Area matching template: Subtle status + Pill button */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DEPTH {depth.toFixed(1)}m</span>
            <span className="text-neutral-600">•</span>
            <span className="text-emerald-400">{busVoltageV}V</span>
          </div>

          <button
            onClick={onOpenConsole}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 text-xs font-sans font-medium tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all group"
          >
            <span>Operator Console</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenConsole}
            className="p-1.5 bg-white/10 border border-white/20 text-white rounded-full text-xs"
            title="Launch Mission Deck"
          >
            <Terminal size={14} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-300 hover:text-white bg-white/5 border border-white/10 rounded-lg"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0c10] border-b border-white/10 px-4 pt-3 pb-5 space-y-2 mt-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-neutral-400 font-mono">
            <span>LIVE TELEMETRY: {depth.toFixed(1)}m</span>
            <span className="text-emerald-400">● 3S {batterySocPct}%</span>
          </div>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-sans text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenConsole();
            }}
            className="w-full mt-3 py-2.5 bg-white text-black font-semibold font-sans text-xs tracking-tight rounded-full flex items-center justify-center gap-2"
          >
            <Terminal size={14} />
            Launch Operator Console
          </button>
        </div>
      )}
    </header>
  );
}

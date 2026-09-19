export function AuvSchematic() {
  return (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-4 overflow-hidden bg-[#020617] group">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-slam-grid opacity-30"></div>

      <div className="relative w-full max-w-2xl aspect-[3/1]">
        <svg viewBox="0 0 800 300" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a16207" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="battGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#9d174d" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="cpuGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="sonarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="propGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* HDPE HULL (Amber Isobaric Shell) */}
          <path d="M 150 150 C 150 110, 650 110, 700 150 C 650 190, 150 190, 150 150 Z" fill="url(#hullGrad)" stroke="#fef08a" strokeWidth="2" className="drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />

          {/* NOSE CONE */}
          <path d="M 50 150 C 50 120, 150 110, 150 150 C 150 190, 50 180, 50 150 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />

          {/* TAIL & KORT DUCT */}
          <path d="M 700 150 L 750 120 L 760 120 L 760 180 L 750 180 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />

          {/* INTERNALS */}
          {/* Battery Pack */}
          <g className="hover:opacity-80 transition-opacity cursor-pointer">
            <rect x="300" y="130" width="120" height="40" rx="4" fill="url(#battGrad)" stroke="#fbcfe8" strokeWidth="1" className="animate-pulse" />
            <line x1="360" y1="130" x2="300" y2="70" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 2" />
            <text x="290" y="60" fill="#00f0ff" fontSize="12" fontFamily="monospace" textAnchor="middle">LI-ION 24V (94%)</text>
          </g>

          {/* SLAM CPU */}
          <g className="hover:opacity-80 transition-opacity cursor-pointer">
            <rect x="440" y="135" width="80" height="30" rx="4" fill="url(#cpuGrad)" stroke="#bfdbfe" strokeWidth="1" />
            <line x1="480" y1="165" x2="520" y2="230" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 2" />
            <text x="530" y="245" fill="#00f0ff" fontSize="12" fontFamily="monospace" textAnchor="middle">SLAM CORE (STM32)</text>
          </g>

          {/* Sonar */}
          <g className="hover:opacity-80 transition-opacity cursor-pointer">
            <rect x="180" y="140" width="40" height="20" rx="4" fill="url(#sonarGrad)" stroke="#bbf7d0" strokeWidth="1" />
            <line x1="200" y1="160" x2="200" y2="230" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 2" />
            <text x="200" y="245" fill="#00f0ff" fontSize="12" fontFamily="monospace" textAnchor="middle">450kHz SWATH</text>
          </g>

          {/* BLDC Motor */}
          <g className="hover:opacity-80 transition-opacity cursor-pointer">
            <rect x="630" y="140" width="60" height="20" rx="4" fill="url(#propGrad)" stroke="#fed7aa" strokeWidth="1" />
            <line x1="660" y1="130" x2="680" y2="70" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 2" />
            <text x="690" y="60" fill="#00f0ff" fontSize="12" fontFamily="monospace" textAnchor="middle">BLDC & KORT DUCT</text>
          </g>
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-4 bg-abyssal-base/80 p-2 border border-abyssal-border backdrop-blur">
         <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-abyssal-text">
            <div className="w-3 h-3 bg-pink-500 rounded-sm"></div> Energy
         </div>
         <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-abyssal-text">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Compute
         </div>
         <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-abyssal-text">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Sensors
         </div>
         <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-abyssal-text">
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Propulsion
         </div>
      </div>
    </div>
  )
}

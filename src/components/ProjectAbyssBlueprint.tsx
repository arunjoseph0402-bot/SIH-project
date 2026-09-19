import React, { useState } from 'react';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Zap, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  Check, 
  Copy, 
  Info,
  ChevronRight
} from 'lucide-react';

interface ComponentDetail {
  id: string;
  name: string;
  bay: 'bow' | 'main' | 'tail';
  specs: string;
  voltage: string;
  role: string;
  pins: string;
}

const BLUEPRINT_COMPONENTS: Record<string, ComponentDetail> = {
  pzt: {
    id: 'pzt',
    name: 'PZT Piezoceramic Transducer (200kHz)',
    bay: 'bow',
    specs: '200kHz resonance frequency, 60° conical beam angle, 1200 pF capacitance',
    voltage: 'Driven by 24V-36Vpp Class-D half-bridge push-pull pulse',
    role: 'Acoustic ping emitter and primary echo receptor for forward obstacle ranging',
    pins: 'TIM1_CH1 (PA8 via gate driver) -> High-Pass LC Filter'
  },
  ms5837: {
    id: 'ms5837',
    name: 'MS5837-30BA Depth Pressure Sensor',
    bay: 'bow',
    specs: '0 to 30 bar (0-300m water depth), 0.2 mbar resolution, gel-encapsulated stainless steel',
    voltage: '3.3V VCC via MP1584 Buck Rail',
    role: 'Real-time vehicle depth telemetry and water pressure sounding feedback',
    pins: 'I2C1 (SCL: PB8, SDA: PB9) at Address 0x76'
  },
  camera: {
    id: 'camera',
    name: 'Forward Camera & LED Module',
    bay: 'bow',
    specs: '1080p subsea wide-angle lens (120° FOV) with dual 100-lumen high-CRI white LEDs',
    voltage: '5.0V VCC (PWM dimmable brightness)',
    role: 'Visual optical inspection and obstacle boundary confirmation in clear water',
    pins: 'DVP / USB Interface + TIM3_CH2 LED Dimmer'
  },
  mcu: {
    id: 'mcu',
    name: 'STM32F407 Payload Master MCU',
    bay: 'main',
    specs: 'ARM Cortex-M4F @ 168 MHz, 1MB Flash, 192KB SRAM, Hardware FPU',
    voltage: '3.3V VCC (65mA typical operating current)',
    role: 'Executes 200kHz PWM pulse timing, DSP echo processing, and mission autonomy',
    pins: 'PA8 (PWM), PB8/PB9 (I2C1), PA2/PA3 (USART2 Telemetry), PC13 (Bilge IRQ)'
  },
  battery: {
    id: 'battery',
    name: '3S 11.1V Li-Ion Battery Pack',
    bay: 'main',
    specs: '3S1P 18650 cylindrical cells, 11.1V nominal (12.6V peak), 2600 mAh capacity (~28.8 Wh)',
    voltage: '11.1V Nominal (9.0V cutoff, 12.6V charge termination)',
    role: 'Primary energy reservoir powering ESC, servos, logic buck converters, and sensors',
    pins: 'XT30 connector to 15A hardware BMS + 10A blade fuse'
  },
  tp4055: {
    id: 'tp4055',
    name: 'TP4055 Charging Module',
    bay: 'main',
    specs: 'Standalone linear Li-ion management IC with thermal regulation and reverse polarity protection',
    voltage: '5V USB-C input -> 12.6V CC/CV balanced charging profile',
    role: 'Allows external benchtop recharging without opening the sealed acrylic pressure hull',
    pins: 'Watertight SubConn external bulkhead penetration'
  },
  ina219: {
    id: 'ina219',
    name: 'INA219 Current/Voltage Monitor',
    bay: 'main',
    specs: '0-26V sensing range, ±3.2A continuous via 0.1Ω 1% high-side shunt, 12-bit ADC',
    voltage: '3.3V Logic, monitors 11.1V battery bus',
    role: 'High-speed I2C telemetry reporting real-time battery voltage, current draw, and power consumption',
    pins: 'I2C1 (Address 0x40), Alert interrupt pin to STM32 PE2'
  },
  buck5v: {
    id: 'buck5v',
    name: 'MP1584 5V Buck Regulator',
    bay: 'main',
    specs: 'High-frequency step-down DC-DC converter, up to 3A output, >92% efficiency',
    voltage: 'Input: 11.1V Bus -> Output: 5.0V Regulated',
    role: 'Powers rudder steering servos, brushless motor ESC logic, and LED illumination',
    pins: 'Direct connection to battery bus after INA219 shunt'
  },
  buck33v: {
    id: 'buck33v',
    name: 'MP1584 3.3V Buck Regulator',
    bay: 'main',
    specs: 'Low-ripple step-down converter with ceramic output capacitors (<15mV ripple)',
    voltage: 'Input: 11.1V Bus -> Output: 3.3V Regulated',
    role: 'Clean power rail for STM32F407 MCU, ADS1115 ADC, and sensitive analog sensors',
    pins: 'Power rail filtering with 10µF + 100nF decoupling capacitors'
  },
  tl072: {
    id: 'tl072',
    name: 'TL072 LNA Preamp Board',
    bay: 'main',
    specs: 'Low-noise JFET dual operational amplifier, +38dB acoustic voltage gain, 3MHz GBW',
    voltage: 'Dual rail / virtual ground biased at 1.65V',
    role: 'Amplifies microvolt acoustic echo returns reflected off subsea pool obstacles',
    pins: 'PZT AC-coupled input -> 2-stage bandpass filter (190-210kHz) -> Output to ADS1115'
  },
  ads1115: {
    id: 'ads1115',
    name: 'ADS1115 16-Bit ADC (ASP)',
    bay: 'main',
    specs: '16-bit ultra-compact analog-to-digital converter, programmable gain up to 860 SPS',
    voltage: '3.3V VCC via precision rail',
    role: 'Digitizes the amplified TL072 sonar echo signal for threshold detection and ToF timing',
    pins: 'I2C1 (Address 0x48), ALERT pin to STM32 PA4'
  },
  motor: {
    id: 'motor',
    name: 'Brushless DC Motor & ESC',
    bay: 'tail',
    specs: 'Outrunner BLDC motor (1400 KV) coupled with 20A waterproof sensorless ESC',
    voltage: '11.1V direct from 3S Li-ion battery pack',
    role: 'Delivers hydrodynamic forward thrust up to 9.8 N (2.5 knots cruising velocity)',
    pins: 'TIM3_CH1 50Hz PWM (1.0ms stop - 2.0ms full forward)'
  },
  propeller: {
    id: 'propeller',
    name: '3-Blade Marine Propeller',
    bay: 'tail',
    specs: '55mm diameter, high-skew 3-blade hydrodynamic pitch optimized for high bollard pull',
    voltage: 'Mechanical torque coupling',
    role: 'Converts motor shaft rotation into low-cavitation water thrust',
    pins: 'Threaded M4 stainless steel drive shaft'
  },
  shaft_seal: {
    id: 'shaft_seal',
    name: "Waterproof Shaft Seal (Stuffing Box)",
    bay: 'tail',
    specs: 'Dual NBR-70 lip seals with PTFE grease-packed packing gland, rated to 3.0 bar',
    voltage: 'Passive mechanical barrier',
    role: 'Prevents water intrusion along the spinning 4mm drive shaft into the tail compartment',
    pins: 'M8 gland nut with Molykote 111 marine silicone grease'
  },
  servos: {
    id: 'servos',
    name: 'Dual Steering Servos (Rudders)',
    bay: 'tail',
    specs: 'Metal-gear waterproof micro servos (2.2 kg-cm torque @ 5V), 60°/0.10s transit speed',
    voltage: '5.0V VCC via MP1584 Buck Regulator',
    role: 'Drives horizontal elevons (pitch control) and vertical rudders (yaw steering)',
    pins: 'TIM2_CH1 (Horizontal) and TIM2_CH2 (Vertical) 50Hz PWM'
  }
};

export function ProjectAbyssBlueprint() {
  const [selectedPartId, setSelectedPartId] = useState<string>('pzt');
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'power_tree' | 'sonar_flow'>('blueprint');
  const [copiedText, setCopiedText] = useState(false);

  const selectedPart = BLUEPRINT_COMPONENTS[selectedPartId] || BLUEPRINT_COMPONENTS['pzt'];

  const handleCopySpec = () => {
    const text = `COMPONENT: ${selectedPart.name}
BAY: ${selectedPart.bay.toUpperCase()}
SPECS: ${selectedPart.specs}
VOLTAGE: ${selectedPart.voltage}
ROLE: ${selectedPart.role}
PINS: ${selectedPart.pins}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="w-full bg-[#07101e] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] font-mono text-xs select-none">
      
      {/* Top Engineering Blueprint Header Bar */}
      <div className="bg-[#050b15] px-4 sm:px-6 py-3 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-sm animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
          <div>
            <h2 className="text-white font-bold tracking-wider uppercase text-sm sm:text-base flex items-center gap-2">
              <span>AUV PROTOTYPE: PROJECT ABYSS-PoC</span>
              <span className="text-cyan-400 font-normal text-xs sm:text-sm">SYSTEM ARCHITECTURE BLUEPRINT</span>
            </h2>
            <p className="text-[10px] text-cyan-300/70">
              100mm Outer Diameter • Modular 3-Bay Torpedo Chassis • 200kHz PZT Acoustic SLAM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 rounded text-center">
            <span className="text-[9px] text-cyan-400 block tracking-widest uppercase">REVISION</span>
            <span className="text-white font-bold text-xs">REV: 1.1</span>
          </div>
          <div className="border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 rounded text-center">
            <span className="text-[9px] text-cyan-400 block tracking-widest uppercase">DATE</span>
            <span className="text-white font-bold text-xs">OCT 2023</span>
          </div>
        </div>
      </div>

      {/* Sub-header Navigation Tabs */}
      <div className="bg-[#081526] px-4 sm:px-6 py-2 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 ${
              activeTab === 'blueprint'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-950/60'
            }`}
          >
            <Layers size={13} />
            <span>FULL ARCHITECTURE CUTAWAY</span>
          </button>
          <button
            onClick={() => setActiveTab('power_tree')}
            className={`px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 ${
              activeTab === 'power_tree'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-950/60'
            }`}
          >
            <Zap size={13} />
            <span>ELECTRICAL POWER TREE</span>
          </button>
          <button
            onClick={() => setActiveTab('sonar_flow')}
            className={`px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 ${
              activeTab === 'sonar_flow'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-950/60'
            }`}
          >
            <Radio size={13} />
            <span>SONAR SIGNAL FLOW</span>
          </button>
        </div>

        <div className="text-[10px] text-cyan-400/80 flex items-center gap-1">
          <Info size={12} />
          <span>Click any component or callout to view schematics & pinouts</span>
        </div>
      </div>

      {/* Main Blueprint Canvas Area */}
      <div className="relative p-3 sm:p-6 bg-[#040a14] overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        
        {/* CAD Blueprint Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 240, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 240, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Fine Sub-grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 240, 255, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 240, 255, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '8px 8px'
          }}
        />

        {/* SVG Cutaway Schematic matching User Blueprint */}
        <div className="relative w-full max-w-5xl aspect-[16/9] sm:aspect-[2/1] my-2">
          <svg 
            viewBox="0 0 1200 620" 
            className="w-full h-full drop-shadow-[0_0_20px_rgba(0,240,255,0.15)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glow filter */}
              <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="hullCutawayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a2038" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#071526" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0a2038" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* --- TOP DIMENSIONAL BAY BOUNDS --- */}
            {/* Bow Section Dimension (Top) */}
            <g stroke="#00f0ff" strokeWidth="1" opacity="0.6">
              <line x1="80" y1="50" x2="250" y2="50" />
              <line x1="80" y1="42" x2="80" y2="58" />
              <line x1="250" y1="42" x2="250" y2="58" />
              {/* Arrowheads */}
              <polyline points="88,46 80,50 88,54" fill="none" />
              <polyline points="242,46 250,50 242,54" fill="none" />
            </g>
            <text x="165" y="38" fill="#00f0ff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              BOW NOSE CONE (SENSOR BAY)
            </text>

            {/* Main Cylinder Dimension (Top) */}
            <g stroke="#00f0ff" strokeWidth="1" opacity="0.6">
              <line x1="255" y1="50" x2="685" y2="50" />
              <line x1="255" y1="42" x2="255" y2="58" />
              <line x1="685" y1="42" x2="685" y2="58" />
              <polyline points="263,46 255,50 263,54" fill="none" />
              <polyline points="677,46 685,50 677,54" fill="none" />
            </g>
            <text x="470" y="38" fill="#00f0ff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              MAIN PRESSURE CYLINDER (ELECTRONICS & POWER CHASSIS)
            </text>

            {/* Tail Section Dimension (Top) */}
            <g stroke="#00f0ff" strokeWidth="1" opacity="0.6">
              <line x1="690" y1="50" x2="870" y2="50" />
              <line x1="690" y1="42" x2="690" y2="58" />
              <line x1="870" y1="42" x2="870" y2="58" />
              <polyline points="698,46 690,50 698,54" fill="none" />
              <polyline points="862,46 870,50 862,54" fill="none" />
            </g>
            <text x="780" y="38" fill="#00f0ff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              TAIL PROPULSION & ACTUATION SECTION
            </text>

            {/* --- BOTTOM DIMENSIONAL BAY BOUNDS --- */}
            <g stroke="#00f0ff" strokeWidth="1" opacity="0.6">
              <line x1="80" y1="490" x2="250" y2="490" />
              <line x1="80" y1="482" x2="80" y2="498" />
              <line x1="250" y1="482" x2="250" y2="498" />
              <polyline points="88,486 80,490 88,494" fill="none" />
              <polyline points="242,486 250,490 242,494" fill="none" />
            </g>
            <text x="165" y="515" fill="#00f0ff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              BOW NOSE CONE (SENSOR BAY)
            </text>

            <g stroke="#00f0ff" strokeWidth="1" opacity="0.6">
              <line x1="255" y1="490" x2="685" y2="490" />
              <line x1="255" y1="482" x2="255" y2="498" />
              <line x1="685" y1="482" x2="685" y2="498" />
              <polyline points="263,486 255,490 263,494" fill="none" />
              <polyline points="677,486 685,490 677,494" fill="none" />
            </g>
            <text x="470" y="515" fill="#00f0ff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              MAIN PRESSURE CYLINDER (ELECTRONICS & POWER CHASSIS)
            </text>

            <g stroke="#00f0ff" strokeWidth="1" opacity="0.6">
              <line x1="690" y1="490" x2="870" y2="490" />
              <line x1="690" y1="482" x2="690" y2="498" />
              <line x1="870" y1="482" x2="870" y2="498" />
              <polyline points="698,486 690,490 698,494" fill="none" />
              <polyline points="862,486 870,490 862,494" fill="none" />
            </g>
            <text x="780" y="515" fill="#00f0ff" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              TAIL PROPULSION & ACTUATION SECTION
            </text>

            {/* --- LEFT 100mm DIAMETER DIMENSION --- */}
            <g stroke="#00f0ff" strokeWidth="1" opacity="0.7">
              <line x1="45" y1="210" x2="45" y2="350" />
              <line x1="38" y1="210" x2="52" y2="210" />
              <line x1="38" y1="350" x2="52" y2="350" />
              <polyline points="41,218 45,210 49,218" fill="none" />
              <polyline points="41,342 45,350 49,342" fill="none" />
            </g>
            <text x="38" y="280" fill="#00f0ff" fontSize="12" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 38 280)" fontWeight="bold">
              100mm
            </text>

            {/* --- AUV HULL SHELL CUTAWAY --- */}
            {/* Nose Cone Outline */}
            <path 
              d="M 250,210 C 170,210 80,240 80,280 C 80,320 170,350 250,350 Z" 
              fill="url(#hullCutawayGrad)" 
              stroke="#00f0ff" 
              strokeWidth="2" 
            />

            {/* Main Cylinder Hull Outline */}
            <rect 
              x="250" 
              y="210" 
              width="435" 
              height="140" 
              fill="url(#hullCutawayGrad)" 
              stroke="#00f0ff" 
              strokeWidth="2" 
            />

            {/* Tail Cone Outline */}
            <path 
              d="M 685,210 L 860,250 L 860,310 L 685,350 Z" 
              fill="url(#hullCutawayGrad)" 
              stroke="#00f0ff" 
              strokeWidth="2" 
            />

            {/* Bulkhead Dividers */}
            <line x1="250" y1="205" x2="250" y2="355" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="3 2" />
            <line x1="685" y1="205" x2="685" y2="355" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="3 2" />

            {/* --- INTERNAL COMPONENTS (INTERACTIVE NODES) --- */}

            {/* 1. PZT Transducer (Bow Tip) */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('pzt')}
              onMouseEnter={() => setHoveredPartId('pzt')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="88" 
                y="262" 
                width="22" 
                height="36" 
                rx="3" 
                fill={selectedPartId === 'pzt' ? '#00f0ff' : '#059669'} 
                stroke="#34d399" 
                strokeWidth="1.5" 
              />
              <line x1="99" y1="262" x2="99" y2="298" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
            </g>

            {/* 2. MS5837-30BA Depth Pressure Sensor (Nose center) */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('ms5837')}
              onMouseEnter={() => setHoveredPartId('ms5837')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <circle 
                cx="145" 
                cy="280" 
                r="11" 
                fill={selectedPartId === 'ms5837' ? '#00f0ff' : '#0284c7'} 
                stroke="#38bdf8" 
                strokeWidth="1.5" 
              />
              <circle cx="145" cy="280" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            </g>

            {/* 3. Forward Camera & LED Module (Aft nose) */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('camera')}
              onMouseEnter={() => setHoveredPartId('camera')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="200" 
                y="260" 
                width="28" 
                height="40" 
                rx="4" 
                fill={selectedPartId === 'camera' ? '#00f0ff' : '#4338ca'} 
                stroke="#818cf8" 
                strokeWidth="1.5" 
              />
              <rect x="218" y="268" width="8" height="24" rx="2" fill="#6366f1" />
            </g>

            {/* Internal Acrylic / 3D-Printed Sled Rails in Main Cylinder */}
            <rect x="260" y="222" width="415" height="116" rx="4" fill="#091424" stroke="#1e3a5f" strokeWidth="1" />
            <line x1="260" y1="228" x2="675" y2="228" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="260" y1="332" x2="675" y2="332" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.3" />

            {/* 4. STM32F407 Payload Master MCU */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('mcu')}
              onMouseEnter={() => setHoveredPartId('mcu')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="280" 
                y="238" 
                width="84" 
                height="84" 
                rx="4" 
                fill={selectedPartId === 'mcu' ? '#00f0ff' : '#1e3a8a'} 
                stroke="#60a5fa" 
                strokeWidth="1.5" 
              />
              {/* QFP Chip Graphic */}
              <rect x="296" y="254" width="52" height="52" fill="#0f172a" stroke="#93c5fd" strokeWidth="1" />
              <text x="322" y="284" fill="#60a5fa" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                STM32F407
              </text>
              {/* Header Pins */}
              <line x1="284" y1="242" x2="284" y2="318" stroke="#93c5fd" strokeWidth="2" strokeDasharray="3 3" />
            </g>

            {/* 5. 3S 11.1V Li-Ion Battery Pack */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('battery')}
              onMouseEnter={() => setHoveredPartId('battery')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="376" 
                y="236" 
                width="64" 
                height="54" 
                rx="3" 
                fill={selectedPartId === 'battery' ? '#00f0ff' : '#991b1b'} 
                stroke="#f87171" 
                strokeWidth="1.5" 
              />
              {/* Cylindrical cell dividers */}
              <line x1="397" y1="236" x2="397" y2="290" stroke="#fca5a5" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="418" y1="236" x2="418" y2="290" stroke="#fca5a5" strokeWidth="1" strokeDasharray="2 2" />
              <text x="408" y="267" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                3S LI-ION
              </text>
            </g>

            {/* 6. TP4055 Charging Module */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('tp4055')}
              onMouseEnter={() => setHoveredPartId('tp4055')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="448" 
                y="238" 
                width="34" 
                height="44" 
                rx="3" 
                fill={selectedPartId === 'tp4055' ? '#00f0ff' : '#d97706'} 
                stroke="#fbbf24" 
                strokeWidth="1.5" 
              />
              <rect x="454" y="244" width="22" height="12" fill="#451a03" stroke="#fef08a" strokeWidth="0.5" />
            </g>

            {/* 7. INA219 Current/Voltage Monitor */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('ina219')}
              onMouseEnter={() => setHoveredPartId('ina219')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="428" 
                y="298" 
                width="34" 
                height="28" 
                rx="3" 
                fill={selectedPartId === 'ina219' ? '#00f0ff' : '#0891b2'} 
                stroke="#22d3ee" 
                strokeWidth="1.5" 
              />
              <rect x="434" y="304" width="12" height="8" fill="#164e63" />
            </g>

            {/* 8. MP1584 5V Buck Regulator */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('buck5v')}
              onMouseEnter={() => setHoveredPartId('buck5v')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="468" 
                y="298" 
                width="34" 
                height="28" 
                rx="3" 
                fill={selectedPartId === 'buck5v' ? '#00f0ff' : '#c2410c'} 
                stroke="#fb923c" 
                strokeWidth="1.5" 
              />
              <circle cx="485" cy="312" r="5" fill="#7c2d12" stroke="#fdba74" strokeWidth="1" />
            </g>

            {/* 9. MP1584 3.3V Buck Regulator */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('buck33v')}
              onMouseEnter={() => setHoveredPartId('buck33v')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="508" 
                y="298" 
                width="34" 
                height="28" 
                rx="3" 
                fill={selectedPartId === 'buck33v' ? '#00f0ff' : '#b45309'} 
                stroke="#fcd34d" 
                strokeWidth="1.5" 
              />
              <circle cx="525" cy="312" r="5" fill="#78350f" stroke="#fde68a" strokeWidth="1" />
            </g>

            {/* 10. TL072 LNA Preamp Board */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('tl072')}
              onMouseEnter={() => setHoveredPartId('tl072')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="490" 
                y="238" 
                width="40" 
                height="44" 
                rx="3" 
                fill={selectedPartId === 'tl072' ? '#00f0ff' : '#7e22ce'} 
                stroke="#c084fc" 
                strokeWidth="1.5" 
              />
              <rect x="498" y="248" width="24" height="14" fill="#3b0764" />
            </g>

            {/* 11. ADS1115 16-Bit ADC (ASP) */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('ads1115')}
              onMouseEnter={() => setHoveredPartId('ads1115')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="538" 
                y="238" 
                width="38" 
                height="44" 
                rx="3" 
                fill={selectedPartId === 'ads1115' ? '#00f0ff' : '#4c1d95'} 
                stroke="#a855f7" 
                strokeWidth="1.5" 
              />
              <circle cx="557" cy="260" r="7" fill="#2e1065" stroke="#d8b4fe" strokeWidth="1" />
            </g>

            {/* Additional PCB Modules / Terminal Blocks */}
            <rect x="584" y="242" width="46" height="38" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <rect x="584" y="290" width="46" height="36" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />

            {/* 12. Waterproof Shaft Seal (Stuffing Box) */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('shaft_seal')}
              onMouseEnter={() => setHoveredPartId('shaft_seal')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="678" 
                y="272" 
                width="20" 
                height="16" 
                rx="2" 
                fill={selectedPartId === 'shaft_seal' ? '#00f0ff' : '#475569'} 
                stroke="#94a3b8" 
                strokeWidth="1.5" 
              />
              <line x1="688" y1="272" x2="688" y2="288" stroke="#cbd5e1" strokeWidth="1.5" />
            </g>

            {/* 13. Dual Steering Servos (Rudders) */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('servos')}
              onMouseEnter={() => setHoveredPartId('servos')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="725" 
                y="248" 
                width="36" 
                height="64" 
                rx="3" 
                fill={selectedPartId === 'servos' ? '#00f0ff' : '#334155'} 
                stroke="#64748b" 
                strokeWidth="1.5" 
              />
              {/* Linkage arms */}
              <line x1="743" y1="255" x2="775" y2="230" stroke="#00f0ff" strokeWidth="1.5" />
              <line x1="743" y1="305" x2="775" y2="330" stroke="#00f0ff" strokeWidth="1.5" />
            </g>

            {/* 14. Brushless DC Motor & ESC */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('motor')}
              onMouseEnter={() => setHoveredPartId('motor')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              <rect 
                x="770" 
                y="262" 
                width="46" 
                height="36" 
                rx="4" 
                fill={selectedPartId === 'motor' ? '#00f0ff' : '#0f172a'} 
                stroke="#38bdf8" 
                strokeWidth="1.5" 
              />
              <rect x="806" y="270" width="10" height="20" fill="#0284c7" />
            </g>

            {/* Drive Shaft */}
            <line x1="816" y1="280" x2="865" y2="280" stroke="#94a3b8" strokeWidth="4" />

            {/* 15. 3-Blade Propeller */}
            <g 
              className="cursor-pointer"
              onClick={() => setSelectedPartId('propeller')}
              onMouseEnter={() => setHoveredPartId('propeller')}
              onMouseLeave={() => setHoveredPartId(null)}
            >
              {/* Prop Hub */}
              <ellipse cx="865" cy="280" rx="6" ry="10" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
              {/* Upper Blade */}
              <path 
                d="M 865,274 C 885,250 895,220 885,210 C 875,200 855,230 865,274 Z" 
                fill={selectedPartId === 'propeller' ? '#00f0ff' : '#d97706'} 
                stroke="#fcd34d" 
                strokeWidth="1.5" 
              />
              {/* Lower Blade */}
              <path 
                d="M 865,286 C 885,310 895,340 885,350 C 875,360 855,330 865,286 Z" 
                fill={selectedPartId === 'propeller' ? '#00f0ff' : '#d97706'} 
                stroke="#fcd34d" 
                strokeWidth="1.5" 
              />
              {/* Leftward Blade */}
              <path 
                d="M 860,280 C 835,285 810,295 815,305 C 825,315 850,295 860,280 Z" 
                fill={selectedPartId === 'propeller' ? '#00f0ff' : '#b45309'} 
                stroke="#fcd34d" 
                strokeWidth="1.5" 
              />
            </g>

            {/* --- CALLOUT LEADERS & LABELS MATCHING BLUEPRINT --- */}

            {/* PZT Leader */}
            <line x1="99" y1="262" x2="99" y2="155" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="99" y1="155" x2="180" y2="155" stroke="#00f0ff" strokeWidth="1" />
            <text x="185" y="152" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              PZT PIEZOCERAMIC
            </text>
            <text x="185" y="164" fill="#00f0ff" fontSize="10" fontFamily="monospace">
              TRANSDUCER (200kHz)
            </text>

            {/* MS5837 Depth Leader */}
            <line x1="145" y1="291" x2="145" y2="400" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="145" y1="400" x2="70" y2="400" stroke="#00f0ff" strokeWidth="1" />
            <text x="65" y="396" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              MS5837-30BA DEPTH
            </text>
            <text x="65" y="408" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              PRESSURE SENSOR
            </text>

            {/* Camera & LED Leader */}
            <line x1="214" y1="300" x2="214" y2="435" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="214" y1="435" x2="70" y2="435" stroke="#00f0ff" strokeWidth="1" />
            <text x="65" y="431" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              FORWARD CAMERA
            </text>
            <text x="65" y="443" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              & LED MODULE
            </text>

            {/* STM32F407 Leader */}
            <line x1="322" y1="238" x2="322" y2="180" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="322" y1="180" x2="270" y2="180" stroke="#00f0ff" strokeWidth="1" />
            <text x="265" y="176" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              STM32F407
            </text>
            <text x="265" y="188" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              PAYLOAD MASTER MCU
            </text>

            {/* 3S Li-ion Battery Leader */}
            <line x1="408" y1="236" x2="408" y2="140" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="408" y1="140" x2="450" y2="140" stroke="#00f0ff" strokeWidth="1" />
            <text x="455" y="136" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              3S 11.1V LI-ION
            </text>
            <text x="455" y="148" fill="#00f0ff" fontSize="10" fontFamily="monospace">
              BATTERY PACK
            </text>

            {/* TP4055 Charger Leader */}
            <line x1="465" y1="238" x2="465" y2="165" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="465" y1="165" x2="520" y2="165" stroke="#00f0ff" strokeWidth="1" />
            <text x="525" y="161" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              TP4055
            </text>
            <text x="525" y="173" fill="#00f0ff" fontSize="10" fontFamily="monospace">
              CHARGING MODULE
            </text>

            {/* INA219 Leader */}
            <line x1="445" y1="298" x2="445" y2="200" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="445" y1="200" x2="480" y2="200" stroke="#00f0ff" strokeWidth="1" />
            <text x="485" y="196" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              INA219
            </text>
            <text x="485" y="208" fill="#00f0ff" fontSize="10" fontFamily="monospace">
              CURRENT/VOLTAGE
            </text>

            {/* MP1584 5V Buck Leader */}
            <line x1="485" y1="326" x2="485" y2="395" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="485" y1="395" x2="420" y2="395" stroke="#00f0ff" strokeWidth="1" />
            <text x="415" y="391" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              INA219 CURRENT/VOLTAGE
            </text>
            <text x="415" y="403" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              MP1584 5V BUCK REGULATOR
            </text>

            {/* MP1584 3.3V Buck Leader */}
            <line x1="525" y1="326" x2="525" y2="425" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="525" y1="425" x2="420" y2="425" stroke="#00f0ff" strokeWidth="1" />
            <text x="415" y="428" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              MP1584 3.3V BUCK REGULATOR
            </text>

            {/* TL072 LNA Leader */}
            <line x1="510" y1="282" x2="510" y2="448" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="510" y1="448" x2="420" y2="448" stroke="#00f0ff" strokeWidth="1" />
            <text x="415" y="451" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              TL072 LNA PREAMP BOARD
            </text>

            {/* ADS1115 ADC Leader */}
            <line x1="557" y1="282" x2="557" y2="470" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="557" y1="470" x2="420" y2="470" stroke="#00f0ff" strokeWidth="1" />
            <text x="415" y="473" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              ADS1115 16-BIT ADC (ASP)
            </text>

            {/* Brushless Motor & ESC Leader */}
            <line x1="793" y1="262" x2="793" y2="160" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="793" y1="160" x2="750" y2="160" stroke="#00f0ff" strokeWidth="1" />
            <text x="745" y="156" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              BRUSHLESS DC
            </text>
            <text x="745" y="168" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              MOTOR & ESC
            </text>

            {/* 3-Blade Propeller Leader */}
            <line x1="865" y1="265" x2="865" y2="190" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="865" y1="190" x2="800" y2="190" stroke="#00f0ff" strokeWidth="1" />
            <text x="795" y="186" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end" fontWeight="bold">
              3-BLADE
            </text>
            <text x="795" y="198" fill="#00f0ff" fontSize="10" fontFamily="monospace" textAnchor="end">
              PROPELLER
            </text>

            {/* Waterproof Shaft Seal Leader */}
            <line x1="688" y1="288" x2="688" y2="400" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="688" y1="400" x2="730" y2="400" stroke="#00f0ff" strokeWidth="1" />
            <text x="735" y="396" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              WATERPROOF SHAFT SEAL (STUFFING
            </text>
            <text x="735" y="408" fill="#00f0ff" fontSize="10" fontFamily="monospace">
              SHAFT 1 'SEAL (STUFFING BOX)
            </text>

            {/* Dual Steering Servos Leader */}
            <line x1="743" y1="312" x2="743" y2="435" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="743" y1="435" x2="730" y2="435" stroke="#00f0ff" strokeWidth="1" />
            <text x="735" y="431" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">
              DUAL STEERING
            </text>
            <text x="735" y="443" fill="#00f0ff" fontSize="10" fontFamily="monospace">
              SERVOS (RUDDERS)
            </text>

            {/* --- UPPER RIGHT: ELECTRICAL POWER TREE & CIRCUITRY SCHEMATIC --- */}
            <g transform="translate(930, 20)">
              {/* Border Box */}
              <rect x="0" y="0" width="250" height="290" rx="4" fill="#050d1a" stroke="#00f0ff" strokeWidth="1.5" />
              <rect x="0" y="0" width="250" height="34" rx="4" fill="#0a192f" stroke="#00f0ff" strokeWidth="1.5" />
              <text x="125" y="16" fill="#ffffff" fontSize="9.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                ELECTRICAL POWER TREE &
              </text>
              <text x="125" y="27" fill="#00f0ff" fontSize="9.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CIRCUITRY SCHEMATIC
              </text>

              {/* 3S Li-ion Battery */}
              <rect x="45" y="44" width="160" height="24" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1" />
              <text x="125" y="60" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">
                3S LI-ION BATTERY
              </text>

              {/* Arrow down */}
              <line x1="125" y1="68" x2="125" y2="80" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="121,78 125,83 129,78" fill="#00f0ff" />

              {/* TP4055 Charger */}
              <rect x="45" y="84" width="160" height="24" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1" />
              <text x="125" y="100" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">
                TP4055 CHARGER
              </text>

              {/* Arrow down */}
              <line x1="125" y1="108" x2="125" y2="120" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="121,118 125,123 129,118" fill="#00f0ff" />

              {/* INA219 Monitor */}
              <rect x="45" y="124" width="160" height="24" rx="3" fill="#1e293b" stroke="#00f0ff" strokeWidth="1" />
              <text x="125" y="140" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">
                INA219 MONITOR
              </text>

              {/* Arrow down */}
              <line x1="125" y1="148" x2="125" y2="160" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="121,158 125,163 129,158" fill="#00f0ff" />

              {/* Split Rail Distribution */}
              <rect x="30" y="164" width="190" height="22" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="125" y="179" fill="#38bdf8" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                SPLIT RAIL DISTRIBUTION
              </text>

              {/* Fork Lines */}
              <line x1="75" y1="186" x2="75" y2="200" stroke="#00f0ff" strokeWidth="1.5" />
              <line x1="175" y1="186" x2="175" y2="200" stroke="#00f0ff" strokeWidth="1.5" />

              {/* 5.0V Rail */}
              <rect x="20" y="202" width="100" height="20" rx="2" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
              <text x="70" y="216" fill="#34d399" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                5.0V RAIL
              </text>

              {/* 3.3V Rail */}
              <rect x="130" y="202" width="100" height="20" rx="2" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
              <text x="180" y="216" fill="#60a5fa" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                3.3V RAIL
              </text>

              {/* 5V Loads */}
              <rect x="20" y="228" width="100" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <text x="70" y="241" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                SERVO MOTORS
              </text>

              <rect x="20" y="250" width="100" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <text x="70" y="263" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                BRUSHLESS ESC
              </text>

              {/* 3.3V Loads */}
              <rect x="130" y="228" width="100" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <text x="180" y="241" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                STM32F407 MCU
              </text>

              <rect x="130" y="250" width="100" height="18" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <text x="180" y="263" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                ADS1115 ASP
              </text>

              <rect x="130" y="270" width="100" height="14" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <text x="180" y="281" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                SENSORS
              </text>
            </g>

            {/* --- LOWER RIGHT: SOFTWARE-DEFINED SONAR SIGNAL FLOW --- */}
            <g transform="translate(890, 360)">
              {/* Border Box */}
              <rect x="0" y="0" width="290" height="185" rx="4" fill="#050d1a" stroke="#00f0ff" strokeWidth="1.5" />
              <rect x="0" y="0" width="290" height="26" rx="4" fill="#0a192f" stroke="#00f0ff" strokeWidth="1.5" />
              <text x="145" y="17" fill="#00f0ff" fontSize="9.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                SOFTWARE-DEFINED SONAR SIGNAL FLOW
              </text>

              {/* Row 1: TX Flow */}
              {/* STM32F407 PWM (TX) */}
              <rect x="14" y="38" width="76" height="32" rx="3" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
              <text x="52" y="52" fill="#ffffff" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                STM32F407
              </text>
              <text x="52" y="63" fill="#93c5fd" fontSize="7" fontFamily="monospace" textAnchor="middle">
                PWM (TX)
              </text>

              <line x1="90" y1="54" x2="105" y2="54" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="103,51 108,54 103,57" fill="#00f0ff" />

              {/* CLASS-D AMP */}
              <rect x="110" y="38" width="65" height="32" rx="3" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
              <text x="142" y="52" fill="#ffffff" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                CLASS-D
              </text>
              <text x="142" y="63" fill="#a7f3d0" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                AMP
              </text>

              <line x1="175" y1="54" x2="190" y2="54" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="188,51 193,54 188,57" fill="#00f0ff" />

              {/* [Water] */}
              <rect x="195" y="42" width="78" height="24" rx="3" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
              <text x="234" y="57" fill="#38bdf8" fontSize="8.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                [Water]
              </text>

              {/* Acoustic propagation loop arrow */}
              <line x1="234" y1="66" x2="234" y2="100" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3 2" />
              <polygon points="231,98 234,103 237,98" fill="#00f0ff" />

              {/* Row 2: RX Echo Return */}
              {/* ECHO RETURN */}
              <rect x="14" y="115" width="60" height="34" rx="3" fill="#78350f" stroke="#fbbf24" strokeWidth="1" />
              <text x="44" y="130" fill="#ffffff" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                ECHO
              </text>
              <text x="44" y="141" fill="#fde68a" fontSize="7" fontFamily="monospace" textAnchor="middle">
                RETURN
              </text>

              <line x1="88" y1="132" x2="74" y2="132" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="77,129 72,132 77,135" fill="#00f0ff" />

              {/* TL072 LNA ASP (ADC) */}
              <rect x="90" y="115" width="85" height="34" rx="3" fill="#581c87" stroke="#c084fc" strokeWidth="1" />
              <text x="132" y="130" fill="#ffffff" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                TL072 LNA
              </text>
              <text x="132" y="141" fill="#e9d5ff" fontSize="7" fontFamily="monospace" textAnchor="middle">
                ASP (ADC)
              </text>

              <line x1="190" y1="132" x2="175" y2="132" stroke="#00f0ff" strokeWidth="1.5" />
              <polygon points="178,129 173,132 178,135" fill="#00f0ff" />

              {/* STM32F407 SLAM MAPPING */}
              <rect x="192" y="110" width="85" height="42" rx="3" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
              <text x="234" y="125" fill="#ffffff" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                STM32F407
              </text>
              <text x="234" y="135" fill="#93c5fd" fontSize="7" fontFamily="monospace" textAnchor="middle">
                SLAM MAPPING
              </text>
              <text x="234" y="145" fill="#60a5fa" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                [PREVIEW]
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Component Inspection Drawer */}
      <div className="bg-[#050c18] border-t border-cyan-500/30 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedPart.bay === 'bow' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                selectedPart.bay === 'main' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {selectedPart.bay === 'bow' ? 'Bow Sensor Bay' : selectedPart.bay === 'main' ? 'Main Electronics Chassis' : 'Tail Propulsion Section'}
              </span>
              <span className="text-cyan-400 font-bold text-sm sm:text-base">
                {selectedPart.name}
              </span>
            </div>
            <p className="text-neutral-300 text-xs leading-relaxed max-w-3xl">
              {selectedPart.role}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopySpec}
              className="px-3.5 py-2 bg-cyan-500/15 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-cyan-300 font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              {copiedText ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedText ? 'COPIED TO CLIPBOARD' : 'EXPORT COMPONENT SPEC'}</span>
            </button>
          </div>
        </div>

        {/* Technical Data Grid for Selected Part */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-cyan-500/20 text-xs">
          <div className="bg-[#081526] p-3 rounded border border-cyan-500/20">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block mb-1">ELECTRICAL & VOLTAGE SPEC</span>
            <span className="text-white font-mono">{selectedPart.voltage}</span>
          </div>
          <div className="bg-[#081526] p-3 rounded border border-cyan-500/20">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block mb-1">HARDWARE CHARACTERISTICS</span>
            <span className="text-white font-mono">{selectedPart.specs}</span>
          </div>
          <div className="bg-[#081526] p-3 rounded border border-cyan-500/20">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block mb-1">MICROCONTROLLER BUS / PINOUT</span>
            <span className="text-cyan-300 font-mono">{selectedPart.pins}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

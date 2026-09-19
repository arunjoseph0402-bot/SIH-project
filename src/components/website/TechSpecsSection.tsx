import React, { useState } from 'react';
import { 
  Download, 
  Check, 
  Sparkles,
  FileText,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export function TechSpecsSection() {
  const [downloaded, setDownloaded] = useState(false);

  const specCategories = [
    {
      category: 'HULL & PHYSICAL DIMENSIONS',
      specs: [
        { parameter: 'Length Overall (LOA)', value: '450 mm (0.45 m)' },
        { parameter: 'Hull Diameter (OD)', value: '100 mm nominal' },
        { parameter: 'Displacement Volume', value: '3.53 Liters' },
        { parameter: 'Dry Weight in Air', value: '2.4 kg' },
        { parameter: 'Net Buoyancy in Seawater', value: '+1.2 N (Positively buoyant fail-safe)' },
        { parameter: 'Primary Hull Material', value: 'PLA 3D-Print Thermoplastic (Gyroid/Cubic core) + Epoxy seal' },
        { parameter: 'Sealing Gaskets', value: 'Dual NBR-70 Nitrile radial O-rings' },
        { parameter: 'Max Operating Depth', value: '25 – 30 meters (Proof-of-concept prototype & test tank)' },
      ]
    },
    {
      category: 'PROPULSION & ATTITUDE VECTORING',
      specs: [
        { parameter: 'Main Thruster Motor', value: 'Brushless DC (BLDC) outrunner' },
        { parameter: 'Electronic Speed Controller', value: '20A Bi-directional ESC with dynamic braking' },
        { parameter: 'Propeller Assembly', value: '3-Blade high-pitch torpedo screw' },
        { parameter: 'Fin Actuation', value: 'Dual waterproof micro servos (elevon/rudder vectoring)' },
        { parameter: 'Survey Cruise Speed', value: '2.5 knots (1.28 m/s)' },
        { parameter: 'Sprint Max Speed', value: '3.8 knots (1.95 m/s)' },
        { parameter: 'Attitude Stabilization', value: '±0.2° PID closed-loop orientation correction' },
      ]
    },
    {
      category: 'POWER & ENERGY MANAGEMENT',
      specs: [
        { parameter: 'Battery Chemistry', value: '3S1P 18650 Lithium-ion cylindrical array' },
        { parameter: 'Nominal Bus Voltage', value: '11.18 VDC (Operating: 9.6V – 12.6V)' },
        { parameter: 'Energy Capacity', value: '28.8 Wh (2600 mAh)' },
        { parameter: 'Power Telemetry Sensor', value: 'Texas Instruments INA219 High-Side I2C Shunt' },
        { parameter: 'Battery Management (BMS)', value: 'Hardware 3S balance board with UVLO & thermal cutoff' },
        { parameter: 'Mission Endurance', value: '1.5 – 2.0 hours continuous acoustic survey' },
        { parameter: 'Logic Power Rails', value: 'Synchronous buck regulators (5.0V / 3.3V dual-rail)' },
      ]
    },
    {
      category: 'ACOUSTIC PAYLOAD & AUTONOMOUS SLAM',
      specs: [
        { parameter: 'Acoustic Transceiver', value: '200kHz Disc Piezoceramic (PZT) Transducer' },
        { parameter: 'Transmitter Topology', value: 'Half-bridge transistor excitation pulse driver' },
        { parameter: 'Preamplifier & Filter', value: 'TL072 low-noise operational amplifier + active bandpass' },
        { parameter: 'Analog-to-Digital Converter', value: 'Texas Instruments ADS1115 16-Bit I2C ADC @ 860 SPS' },
        { parameter: 'Sound Speed Compensation', value: 'Mackenzie algorithm using MS5837 pressure + DS18B20 temp' },
        { parameter: 'Master Payload Controller', value: 'STM32F407 ARM Cortex-M4 @ 168MHz' },
        { parameter: 'Nav & Servo Sub-processor', value: 'STM32F103 ARM Cortex-M3 @ 72MHz' },
        { parameter: 'Autonomy Pattern', value: 'RoboVac-Style Boustrophedon Sweep + Artificial Potential Fields' },
      ]
    }
  ];

  const handleDownloadSpecs = () => {
    const specSheetText = `AUV-9 AUTONOMOUS SUBSEA VEHICLE - TECHNICAL SPECIFICATION DOSSIER
================================================================================
Generated: ${new Date().toISOString()}
Classification: PROOF-OF-CONCEPT PROTOTYPE

1. PHYSICAL SPECIFICATIONS
- Form Factor: Cylindrical Torpedo (450 mm L x 100 mm OD)
- Material: PLA 3D-Print Plastic (Gyroid Core) + Outer Epoxy Seal
- Sealing: Dual NBR-70 Radial O-rings
- Net Buoyancy: +1.2 N in Seawater (Positive Fail-Safe)
- Depth Rating: 25-30 meters (Proof-of-Concept Prototype)

2. PROPULSION & STEERING
- Motor: Sensorless Brushless DC (BLDC) Outrunner
- ESC: 20A Bi-directional ESC
- Propeller: 3-Blade Torpedo Screw
- Fins: Dual Waterproof Micro Servos
- Cruise Speed: 2.5 knots

3. POWER SUBSYSTEM
- Battery: 3S1P 18650 Li-ion (11.1V Nominal, 2600 mAh)
- Shunt Telemetry: Texas Instruments INA219 (I2C)
- Protection: 3S Hardware BMS with UVLO & Thermal Cutoff

4. ACOUSTIC PAYLOAD & SLAM
- Sonar: 200kHz PZT Piezoceramic Disc Transducer
- Analog Front-End: TL072 LNA + ADS1115 16-bit ADC (860 SPS)
- Master MCU: STM32F407 (168MHz)
- Navigation MCU: STM32F103 (72MHz)
- SLAM: RoboVac Boustrophedon Sweep + Artificial Potential Field
================================================================================`;

    const blob = new Blob([specSheetText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUV9-Subsea-Specs-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <section id="specs" className="py-24 bg-[#060709] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching template */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-sans text-neutral-300 mb-3">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Full Engineering Dossier</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-white tracking-tight">
              Technical Specifications
            </h2>
            <p className="text-sm text-neutral-400 font-sans mt-2 max-w-xl leading-relaxed">
              Exhaustive engineering parameters for the AUV-9 prototype, verified in academic test-tanks and shallow marine environments.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={handleDownloadSpecs}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 font-sans text-xs font-semibold tracking-tight transition-all flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              {downloaded ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span>Dossier Downloaded</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Export Spec Sheet (.TXT)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Specifications Category Tables matching template bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specCategories.map((cat, idx) => (
            <div key={idx} className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.6)]">
              <div className="bg-white/[0.02] px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="font-sans font-semibold text-xs text-white tracking-tight">
                  {cat.category}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">SEC 0{idx + 1}</span>
              </div>

              <div className="divide-y divide-white/[0.04] font-sans text-xs">
                {cat.specs.map((item, i) => (
                  <div 
                    key={i} 
                    className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-neutral-400">{item.parameter}</span>
                    <span className="text-white font-medium sm:text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Material Comparison Banner */}
        <div className="mt-12 rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="text-xs font-sans font-semibold text-neutral-300 block mb-4">
            MATERIAL BENCHMARK: 3D-PRINTED PLA VS. CONVENTIONAL AEROSPACE METALS
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-neutral-500 text-[11px]">
                  <th className="py-2.5 pr-4">MATERIAL OPTION</th>
                  <th className="py-2.5 px-4">DENSITY</th>
                  <th className="py-2.5 px-4">PROTOTYPING TIME</th>
                  <th className="py-2.5 px-4">BUOYANCY BALANCE</th>
                  <th className="py-2.5 pl-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                <tr className="bg-cyan-500/[0.04] text-white">
                  <td className="py-3 pr-4 font-semibold text-cyan-400">PLA 3D-Print + Epoxy Coat</td>
                  <td className="py-3 px-4 text-emerald-400">1.24 g/cm³ (Gyroid Buoyant)</td>
                  <td className="py-3 px-4 text-emerald-400">Overnight (Campus 3D Printer)</td>
                  <td className="py-3 px-4 text-emerald-400">+1.2 N Net Positive</td>
                  <td className="py-3 pl-4 text-cyan-400 font-semibold">✓ AUV-9 CONFIG</td>
                </tr>
                <tr className="text-neutral-400">
                  <td className="py-3 pr-4">6061-T6 Billet Aluminum</td>
                  <td className="py-3 px-4">2.70 g/cm³ (Negative)</td>
                  <td className="py-3 px-4 text-amber-400">3-4 weeks CNC tooling lead</td>
                  <td className="py-3 px-4 text-amber-400">Requires foam blocks</td>
                  <td className="py-3 pl-4 text-neutral-500">Excluded</td>
                </tr>
                <tr className="text-neutral-400">
                  <td className="py-3 pr-4">316L Stainless Steel</td>
                  <td className="py-3 px-4">8.00 g/cm³ (Extremely heavy)</td>
                  <td className="py-3 px-4 text-red-400">Cost prohibitive for students</td>
                  <td className="py-3 px-4 text-red-400">Heavy negative ballast</td>
                  <td className="py-3 pl-4 text-neutral-500">Excluded</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

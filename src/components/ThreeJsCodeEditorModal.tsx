import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  X, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Box,
  Layers,
  FileCode
} from 'lucide-react';
import { 
  USER_PLA_TORPEDO_CODE, 
  PRESET_KORT_SONAR_CODE, 
  PRESET_DEEP_EXPLORER_CODE, 
  compileThreeJsCode, 
  updateCustomModelCode,
  CompilationResult 
} from '../utils/threeJsModelStore';

interface ThreeJsCodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelUpdated?: () => void;
}

export function ThreeJsCodeEditorModal({
  isOpen,
  onClose,
  onModelUpdated
}: ThreeJsCodeEditorModalProps) {
  const [code, setCode] = useState<string>(USER_PLA_TORPEDO_CODE);
  const [compilationStatus, setCompilationStatus] = useState<CompilationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'parametric'>('code');
  const [copied, setCopied] = useState(false);
  const [autoRun, setAutoRun] = useState(true);

  // Parametric controls state
  const [bodyRadius, setBodyRadius] = useState(0.5);
  const [bodyLength, setBodyLength] = useState(3.5);
  const [noseLength, setNoseLength] = useState(1.2);
  const [propBlades, setPropBlades] = useState(3);
  const [hullColor, setHullColor] = useState('#ffcc00');
  const [hullRoughness, setHullRoughness] = useState(0.3);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initial compilation on mount
  useEffect(() => {
    const result = compileThreeJsCode(code);
    setCompilationStatus(result);
  }, []);

  if (!isOpen) return null;

  const handleCompileAndRun = (customSource?: string) => {
    const sourceToRun = customSource ?? code;
    const result = updateCustomModelCode(sourceToRun);
    setCompilationStatus(result);
    if (result.success && onModelUpdated) {
      onModelUpdated();
    }
  };

  const handlePresetSelect = (presetCode: string) => {
    setCode(presetCode);
    handleCompileAndRun(presetCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'createAuvModel.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut: Tab support & Ctrl+Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCompileAndRun();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      textarea.value = val.substring(0, start) + '  ' + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      setCode(textarea.value);
    }
  };

  // Sync parametric sliders into code
  const applyParametricValues = (newRadius: number, newLength: number, newNose: number, newBlades: number, newColor: string, newRoughness: number) => {
    const hexClean = newColor.replace('#', '0x');
    const updatedCode = `import * as THREE from 'three';

/**
 * Generates a complete 3D CAD model group for the PLA-hulk torpedo AUV prototype
 * using Three.js. Parametrically configured.
 */
export function createAuvModel() {
  const auvGroup = new THREE.Group();

  // Materials optimized for a PLA-printed prototype and metallic components
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: ${hexClean}, // Custom Hull Color
    roughness: ${newRoughness.toFixed(2)},
    metalness: 0.1
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a5568, // Brushed metal / aluminum components
    roughness: 0.2,
    metalness: 0.8
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a202c, // Optical glass / sensor housing black
    roughness: 0.5,
    metalness: 0.2
  });

  // 1. Main Cylindrical Hull (Core body housing batteries and electronics tray)
  const bodyGeometry = new THREE.CylinderGeometry(${newRadius.toFixed(2)}, ${newRadius.toFixed(2)}, ${newLength.toFixed(2)}, 32);
  bodyGeometry.rotateZ(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeometry, hullMaterial);
  bodyMesh.name = "Main Cylindrical Hull";
  auvGroup.add(bodyMesh);

  // 2. Forward Nose Cone (Sensor and Camera Bay)
  const noseGeometry = new THREE.ConeGeometry(${newRadius.toFixed(2)}, ${newNose.toFixed(2)}, 32);
  noseGeometry.rotateZ(-Math.PI / 2);
  const noseMesh = new THREE.Mesh(noseGeometry, hullMaterial);
  noseMesh.name = "Forward Nose Cone";
  noseMesh.position.set(${((newLength / 2) + (newNose / 2)).toFixed(2)}, 0, 0);
  auvGroup.add(noseMesh);

  // Forward Camera Lens / Sonar Window Inset
  const lensGeometry = new THREE.CylinderGeometry(${(newRadius * 0.4).toFixed(2)}, ${(newRadius * 0.4).toFixed(2)}, 0.1, 16);
  lensGeometry.rotateZ(-Math.PI / 2);
  const lensMesh = new THREE.Mesh(lensGeometry, darkMat);
  lensMesh.name = "Camera Lens / Sonar Window";
  lensMesh.position.set(${((newLength / 2) + newNose + 0.05).toFixed(2)}, 0, 0);
  auvGroup.add(lensMesh);

  // 3. Tail Propulsion & Motor Housing Section
  const tailGeometry = new THREE.CylinderGeometry(${newRadius.toFixed(2)}, ${(newRadius * 0.6).toFixed(2)}, 1.0, 32);
  tailGeometry.rotateZ(Math.PI / 2);
  const tailMesh = new THREE.Mesh(tailGeometry, hullMaterial);
  tailMesh.name = "Tail Propulsion Housing";
  tailMesh.position.set(${(-(newLength / 2) - 0.5).toFixed(2)}, 0, 0);
  auvGroup.add(tailMesh);

  // 4. Tail Stabilization Fins (Cross configuration)
  const finShape = new THREE.BoxGeometry(0.05, ${(newRadius * 1.6).toFixed(2)}, ${(newRadius * 1.2).toFixed(2)});
  
  // Top Vertical Rudder Fin
  const topFin = new THREE.Mesh(finShape, hullMaterial);
  topFin.name = "Top Vertical Rudder Fin";
  topFin.position.set(${(-(newLength / 2) - 0.25).toFixed(2)}, ${(newRadius * 1.2).toFixed(2)}, 0);
  auvGroup.add(topFin);

  // Starboard (Right) Horizontal Fin
  const rightFin = new THREE.Mesh(finShape, hullMaterial);
  rightFin.name = "Starboard Horizontal Fin";
  rightFin.rotation.z = Math.PI / 2;
  rightFin.position.set(${(-(newLength / 2) - 0.25).toFixed(2)}, 0, ${(newRadius * 1.2).toFixed(2)});
  auvGroup.add(rightFin);

  // Port (Left) Horizontal Fin
  const leftFin = new THREE.Mesh(finShape, hullMaterial);
  leftFin.name = "Port Horizontal Fin";
  leftFin.rotation.z = Math.PI / 2;
  leftFin.position.set(${(-(newLength / 2) - 0.25).toFixed(2)}, 0, ${(-(newRadius * 1.2)).toFixed(2)});
  auvGroup.add(leftFin);

  // 5. Brushless Motor Propeller Assembly (${newBlades}-Blade configuration)
  const propGroup = new THREE.Group();
  propGroup.name = "propellerGroup";
  propGroup.position.set(${(-(newLength / 2) - 1.05).toFixed(2)}, 0, 0);
  
  for (let i = 0; i < ${newBlades}; i++) {
    const bladeGeo = new THREE.BoxGeometry(0.02, ${(newRadius * 0.6).toFixed(2)}, 0.1);
    const blade = new THREE.Mesh(bladeGeo, metalMaterial);
    blade.name = "Propeller Blade " + (i + 1);
    blade.rotation.x = (i * Math.PI * 2) / ${newBlades};
    propGroup.add(blade);
  }
  auvGroup.add(propGroup);

  return auvGroup;
}
`;
    setCode(updatedCode);
    handleCompileAndRun(updatedCode);
  };

  const linesCount = code.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] flex flex-col bg-[#070e1a] border border-abyssal-cyan/40 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden font-mono">
        
        {/* Modal Top Bar */}
        <div className="h-14 border-b border-abyssal-border bg-[#0a1424] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-abyssal-cyan/15 border border-abyssal-cyan/40 text-abyssal-cyan">
              <FileCode size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm tracking-wider">
                  THREE.JS CAD MODEL ENGINE
                </span>
                <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 text-[9px] font-bold rounded">
                  LIVE COMPILER
                </span>
              </div>
              <p className="text-[11px] text-abyssal-muted">
                Edit JavaScript geometry & materials live. Updates 3D digital twin in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-[#0d1829] hover:bg-abyssal-border border border-abyssal-border text-abyssal-text text-xs flex items-center gap-1.5 transition-colors"
              title="Copy source code to clipboard"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1 rounded bg-[#0d1829] hover:bg-abyssal-border border border-abyssal-border text-abyssal-text text-xs flex items-center gap-1.5 transition-colors"
              title="Download createAuvModel.js"
            >
              <Download size={13} />
              <span className="hidden sm:inline">EXPORT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-[#0d1829] hover:bg-red-500/20 text-abyssal-muted hover:text-red-300 border border-abyssal-border hover:border-red-400/50 transition-colors ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Presets & View Controls Hotbar */}
        <div className="px-4 py-2 border-b border-abyssal-border bg-[#09111e] flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Preset buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] text-abyssal-muted uppercase tracking-wider mr-1">PRESETS:</span>
            
            <button
              onClick={() => handlePresetSelect(USER_PLA_TORPEDO_CODE)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 transition-all whitespace-nowrap"
            >
              ★ PLA Torpedo (Your createAuvModel)
            </button>

            <button
              onClick={() => handlePresetSelect(PRESET_KORT_SONAR_CODE)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#0d1829] hover:bg-abyssal-cyan/20 text-abyssal-cyan border border-abyssal-border hover:border-abyssal-cyan transition-all whitespace-nowrap"
            >
              Kort Duct & Sonar Swath
            </button>

            <button
              onClick={() => handlePresetSelect(PRESET_DEEP_EXPLORER_CODE)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#0d1829] hover:bg-orange-500/20 text-orange-300 border border-abyssal-border hover:border-orange-400 transition-all whitespace-nowrap"
            >
              Twin-Pod Deep Trench
            </button>
          </div>

          {/* Mode Switcher: Code vs Parametric */}
          <div className="flex items-center bg-[#0d1728] border border-abyssal-border rounded p-0.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
                activeTab === 'code'
                  ? 'bg-abyssal-cyan text-black font-bold'
                  : 'text-abyssal-muted hover:text-white'
              }`}
            >
              <Code2 size={13} />
              <span>RAW THREE.JS</span>
            </button>
            <button
              onClick={() => setActiveTab('parametric')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
                activeTab === 'parametric'
                  ? 'bg-abyssal-cyan text-black font-bold'
                  : 'text-abyssal-muted hover:text-white'
              }`}
            >
              <Sliders size={13} />
              <span>PARAMETRIC TUNER</span>
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* TAB 1: RAW CODE EDITOR */}
          {activeTab === 'code' && (
            <div className="flex-1 flex overflow-hidden bg-[#040811] relative">
              {/* Line Numbers Gutter */}
              <div className="w-12 py-3 px-2 bg-[#060c18] border-r border-abyssal-border/60 text-right select-none text-abyssal-muted/50 text-xs font-mono shrink-0 overflow-hidden leading-6">
                {Array.from({ length: Math.max(linesCount, 40) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Textarea */}
              <div className="flex-1 relative flex flex-col h-full">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (autoRun) {
                      const res = compileThreeJsCode(e.target.value);
                      setCompilationStatus(res);
                      if (res.success && res.group) {
                        updateCustomModelCode(e.target.value);
                      }
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  placeholder="// Paste or write Three.js code returning a THREE.Group here..."
                  className="flex-1 w-full h-full p-3 bg-transparent text-emerald-300 font-mono text-xs leading-6 resize-none focus:outline-none selection:bg-abyssal-cyan/30"
                  style={{ tabSize: 2 }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL PARAMETRIC TUNER */}
          {activeTab === 'parametric' && (
            <div className="flex-1 p-6 bg-[#040811] overflow-y-auto">
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                
                <div className="pb-3 border-b border-abyssal-border">
                  <h3 className="text-white font-bold text-sm tracking-wide">
                    PARAMETRIC TORPEDO AUV GENERATOR
                  </h3>
                  <p className="text-xs text-abyssal-muted mt-0.5">
                    Adjust CAD dimensions and hull finishes. Generates clean Three.js source code in real time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Body Radius */}
                  <div className="bg-[#09111e] border border-abyssal-border p-3.5 rounded-lg">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-abyssal-muted uppercase">BODY RADIUS:</span>
                      <span className="text-abyssal-cyan font-bold">{bodyRadius} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.2"
                      step="0.05"
                      value={bodyRadius}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setBodyRadius(val);
                        applyParametricValues(val, bodyLength, noseLength, propBlades, hullColor, hullRoughness);
                      }}
                      className="w-full accent-abyssal-cyan cursor-pointer"
                    />
                    <span className="text-[10px] text-abyssal-muted block mt-1">
                      Scaled LOA beam diameter: {(bodyRadius * 2).toFixed(2)}m
                    </span>
                  </div>

                  {/* Body Length */}
                  <div className="bg-[#09111e] border border-abyssal-border p-3.5 rounded-lg">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-abyssal-muted uppercase">BODY CYLINDER LENGTH:</span>
                      <span className="text-abyssal-cyan font-bold">{bodyLength} m</span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="6.0"
                      step="0.1"
                      value={bodyLength}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setBodyLength(val);
                        applyParametricValues(bodyRadius, val, noseLength, propBlades, hullColor, hullRoughness);
                      }}
                      className="w-full accent-abyssal-cyan cursor-pointer"
                    />
                    <span className="text-[10px] text-abyssal-muted block mt-1">
                      Internal battery & electronics payload bay volume
                    </span>
                  </div>

                  {/* Nose Cone Length */}
                  <div className="bg-[#09111e] border border-abyssal-border p-3.5 rounded-lg">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-abyssal-muted uppercase">NOSE CONE LENGTH:</span>
                      <span className="text-amber-400 font-bold">{noseLength} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.4"
                      max="2.5"
                      step="0.1"
                      value={noseLength}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNoseLength(val);
                        applyParametricValues(bodyRadius, bodyLength, val, propBlades, hullColor, hullRoughness);
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <span className="text-[10px] text-abyssal-muted block mt-1">
                      Acoustic & optical forward dome geometry
                    </span>
                  </div>

                  {/* Propeller Blades Count */}
                  <div className="bg-[#09111e] border border-abyssal-border p-3.5 rounded-lg">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-abyssal-muted uppercase">PROPELLER BLADES:</span>
                      <span className="text-emerald-400 font-bold">{propBlades} BLADES</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setPropBlades(num);
                            applyParametricValues(bodyRadius, bodyLength, noseLength, num, hullColor, hullRoughness);
                          }}
                          className={`flex-1 py-1.5 rounded border text-xs font-bold transition-all ${
                            propBlades === num
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                              : 'bg-[#060c18] border-abyssal-border text-abyssal-muted hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hull Material Preset Colors */}
                  <div className="bg-[#09111e] border border-abyssal-border p-3.5 rounded-lg sm:col-span-2">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-abyssal-muted uppercase">HULL MATERIAL COLOR & FINISH:</span>
                      <span className="font-mono text-white font-bold">{hullColor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={hullColor}
                        onChange={(e) => {
                          setHullColor(e.target.value);
                          applyParametricValues(bodyRadius, bodyLength, noseLength, propBlades, e.target.value, hullRoughness);
                        }}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'PLA Yellow', hex: '#ffcc00' },
                          { name: 'HDPE Amber', hex: '#e0a938' },
                          { name: 'Stealth Cyan', hex: '#00f0ff' },
                          { name: 'Marine Orange', hex: '#f97316' },
                          { name: 'Subsea Matte Black', hex: '#1e293b' },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => {
                              setHullColor(c.hex);
                              applyParametricValues(bodyRadius, bodyLength, noseLength, propBlades, c.hex, hullRoughness);
                            }}
                            className="px-2 py-1 rounded border border-abyssal-border text-[11px] flex items-center gap-1.5 bg-[#060c18] hover:border-abyssal-cyan transition-colors"
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }}></span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-abyssal-cyan/5 border border-abyssal-cyan/30 rounded-lg text-xs flex items-center justify-between">
                  <span className="text-abyssal-muted">
                    Total Hydrodynamic Hull Length: <strong className="text-white">{(bodyLength + noseLength + 1.05).toFixed(2)} meters</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-abyssal-cyan hover:underline font-bold flex items-center gap-1"
                  >
                    <span>View Generated Code</span>
                    <Code2 size={13} />
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Execution Bar */}
        <div className="border-t border-abyssal-border bg-[#09111e] p-3 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Compilation Feedback Message */}
          <div className="flex items-center gap-2 text-xs">
            {compilationStatus?.success ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={15} />
                <span className="font-bold">
                  ✓ Model compiled successfully
                </span>
                <span className="text-abyssal-muted text-[11px] hidden sm:inline">
                  ({compilationStatus.meshCount} meshes, {compilationStatus.vertexCount.toLocaleString()} vertices)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle size={15} />
                <span className="font-bold truncate max-w-md">
                  {compilationStatus?.error || 'Compilation syntax error'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCode(USER_PLA_TORPEDO_CODE);
                handleCompileAndRun(USER_PLA_TORPEDO_CODE);
              }}
              className="px-3 py-1.5 rounded border border-abyssal-border bg-[#0d1829] hover:bg-abyssal-border text-abyssal-muted hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} />
              <span>RESTORE DEFAULT</span>
            </button>

            <button
              onClick={() => handleCompileAndRun()}
              className="px-4 py-1.5 rounded bg-abyssal-cyan hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
            >
              <Play size={13} className="fill-black" />
              <span>COMPILE & RUN TO 3D VIEWPORT</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

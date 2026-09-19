import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Eye, EyeOff, RotateCcw, Play, Pause, Code2, Sliders, ChevronRight, Info } from 'lucide-react';

interface AuvCadViewerProps {
  onOpenCodeEditor?: () => void;
}

export function AuvCadViewer({ onOpenCodeEditor }: AuvCadViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isHullGhost, setIsHullGhost] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [showSubsystemsList, setShowSubsystemsList] = useState(true);
  const [selectedPart, setSelectedPart] = useState('Overview: PLA Torpedo Hull & Internal Payload');
  
  const hullMeshesRef = useRef<THREE.Mesh[]>([]);
  const allMaterialsRef = useRef<THREE.Material[]>([]);
  const explodablePartsRef = useRef<{ mesh: THREE.Object3D; basePos: THREE.Vector3; offsetDir: THREE.Vector3 }[]>([]);
  const resetCameraRef = useRef<() => void>(() => {});
  const controlsRef = useRef<OrbitControls | null>(null);

  // Update hull transparency
  useEffect(() => {
    hullMeshesRef.current.forEach((mesh) => {
      if (mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = isHullGhost ? 0.18 : 1.0;
        mat.depthWrite = !isHullGhost;
        mat.needsUpdate = true;
      }
    });
  }, [isHullGhost]);

  // Update wireframe
  useEffect(() => {
    allMaterialsRef.current.forEach((mat) => {
      if ('wireframe' in mat) {
        (mat as THREE.MeshStandardMaterial).wireframe = isWireframe;
        mat.needsUpdate = true;
      }
    });
  }, [isWireframe]);

  // Update explode factor
  useEffect(() => {
    explodablePartsRef.current.forEach(({ mesh, basePos, offsetDir }) => {
      mesh.position.copy(basePos).addScaledVector(offsetDir, explodeFactor);
    });
  }, [explodeFactor]);

  // Update auto rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
      controlsRef.current.autoRotateSpeed = 1.0;
    }
  }, [isAutoRotating]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;
    
    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);

    const width = currentMount.clientWidth || 800;
    const height = currentMount.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(7.5, 3.2, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controls.target.set(0, 0, 0);
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    resetCameraRef.current = () => {
      camera.position.set(7.5, 3.2, 6.5);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    
    const dirLight = new THREE.DirectionalLight(0x00f2ff, 1.5);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const warmFill = new THREE.DirectionalLight(0xffeedd, 0.6);
    warmFill.position.set(-10, -10, -10);
    scene.add(warmFill);

    // Grid Floor
    const grid = new THREE.GridHelper(14, 28, 0x00f2ff, 0x1e293b);
    grid.position.y = -1.8;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.2;
    scene.add(grid);

    // Master AUV Assembly Group
    const auvGroup = new THREE.Group();

    // 1. Outer PLA Hull (Cylinder + Nose + Tail + Fins)
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00, // PLA Yellow
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: isHullGhost ? 0.18 : 1.0,
      wireframe: isWireframe,
      depthWrite: !isHullGhost
    });

    const hullMeshes: THREE.Mesh[] = [];
    const allMaterials: THREE.Material[] = [hullMat];
    const explodableParts: { mesh: THREE.Object3D; basePos: THREE.Vector3; offsetDir: THREE.Vector3 }[] = [];

    // Main Torpedo Cylinder
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 3.5, 32);
    bodyGeo.rotateZ(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
    bodyMesh.userData = { name: 'PLA Torpedo Hull: 450 mm × 100 mm 3D-printed watertight fuselage with O-ring bulkheads.' };
    hullMeshes.push(bodyMesh);
    auvGroup.add(bodyMesh);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.6, 1.2, 32);
    noseGeo.rotateZ(-Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, hullMat);
    noseMesh.position.set(2.35, 0, 0);
    noseMesh.userData = { name: 'PLA Nose Cone: Hydrodynamic fairing housing the 200kHz bow acoustic transducer.' };
    hullMeshes.push(noseMesh);
    auvGroup.add(noseMesh);
    explodableParts.push({ mesh: noseMesh, basePos: noseMesh.position.clone(), offsetDir: new THREE.Vector3(1.6, 0, 0) });

    // Tail Cone
    const tailGeo = new THREE.CylinderGeometry(0.6, 0.3, 1.0, 32);
    tailGeo.rotateZ(Math.PI / 2);
    const tailMesh = new THREE.Mesh(tailGeo, hullMat);
    tailMesh.position.set(-2.25, 0, 0);
    tailMesh.userData = { name: 'PLA Tail Cone: Propulsion and servo control surface mounting section.' };
    hullMeshes.push(tailMesh);
    auvGroup.add(tailMesh);
    explodableParts.push({ mesh: tailMesh, basePos: tailMesh.position.clone(), offsetDir: new THREE.Vector3(-1.4, 0, 0) });

    // Tail Fins (Horizontal Elevons & Vertical Rudders)
    const finMat = hullMat;
    const finGeo = new THREE.BoxGeometry(0.5, 0.05, 0.6);
    const hFin = new THREE.Mesh(finGeo, finMat);
    hFin.position.set(-2.4, 0, 0);
    hFin.userData = { name: 'Horizontal Elevon Fins: Servo-driven pitch stabilization surfaces.' };
    hullMeshes.push(hFin);
    auvGroup.add(hFin);
    explodableParts.push({ mesh: hFin, basePos: hFin.position.clone(), offsetDir: new THREE.Vector3(-1.8, 0, 0) });

    const vFinGeo = new THREE.BoxGeometry(0.5, 0.6, 0.05);
    const vFin = new THREE.Mesh(vFinGeo, finMat);
    vFin.position.set(-2.4, 0, 0);
    vFin.userData = { name: 'Vertical Rudder Fin: Servo-driven yaw steering control surface.' };
    hullMeshes.push(vFin);
    auvGroup.add(vFin);
    explodableParts.push({ mesh: vFin, basePos: vFin.position.clone(), offsetDir: new THREE.Vector3(-1.8, 0, 0) });

    hullMeshesRef.current = hullMeshes;

    // --- INTERNAL COMPONENTS (Visible when Hull is Ghost/Transparent) ---
    const interactiveParts: THREE.Mesh[] = [];

    // Internal Electronics Tray
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.5, metalness: 0.2, wireframe: isWireframe });
    allMaterials.push(trayMat);
    const trayGeo = new THREE.BoxGeometry(2.8, 0.05, 0.4);
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0, -0.2, 0);
    trayMesh.userData = { name: 'Internal Electronics Tray: Rigid 3D-printed chassis anchoring all PCBs and battery cells.' };
    interactiveParts.push(trayMesh);
    auvGroup.add(trayMesh);
    explodableParts.push({ mesh: trayMesh, basePos: trayMesh.position.clone(), offsetDir: new THREE.Vector3(0, -0.6, 0) });

    // PZT Transducer (Forward Bow)
    const pztMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2, wireframe: isWireframe });
    allMaterials.push(pztMat);
    const pztGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16);
    pztGeo.rotateZ(Math.PI / 2);
    const pztMesh = new THREE.Mesh(pztGeo, pztMat);
    pztMesh.position.set(2.7, 0, 0);
    pztMesh.userData = { name: 'PZT Piezoceramic Transducer (200kHz): Bow-mounted acoustic transducer for active sounding & obstacle ToF.' };
    interactiveParts.push(pztMesh);
    auvGroup.add(pztMesh);
    explodableParts.push({ mesh: pztMesh, basePos: pztMesh.position.clone(), offsetDir: new THREE.Vector3(2.2, 0, 0) });

    // MS5837-30BA Depth Pressure Sensor (Bow Nose Cone)
    const depthMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2, wireframe: isWireframe });
    allMaterials.push(depthMat);
    const depthGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 16);
    depthGeo.rotateZ(Math.PI / 2);
    const depthMesh = new THREE.Mesh(depthGeo, depthMat);
    depthMesh.position.set(2.2, -0.15, 0);
    depthMesh.userData = { name: 'MS5837-30BA Depth Pressure Sensor: 30-bar high-resolution I2C pressure transducer for subsea depth telemetry.' };
    interactiveParts.push(depthMesh);
    auvGroup.add(depthMesh);
    explodableParts.push({ mesh: depthMesh, basePos: depthMesh.position.clone(), offsetDir: new THREE.Vector3(1.7, -0.4, 0) });

    // Forward Camera & LED Module (Bow Nose Cone)
    const camMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.5, roughness: 0.3, wireframe: isWireframe });
    allMaterials.push(camMat);
    const camGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(2.2, 0.15, 0);
    camMesh.userData = { name: 'Forward Camera & LED Module: 1080p optical subsea imaging aperture with integrated white LED illumination.' };
    interactiveParts.push(camMesh);
    auvGroup.add(camMesh);
    explodableParts.push({ mesh: camMesh, basePos: camMesh.position.clone(), offsetDir: new THREE.Vector3(1.7, 0.4, 0) });

    // Sonar Sounding Beam Cone (Subtle acoustic pulse visual)
    const beamGeo = new THREE.ConeGeometry(0.7, 1.8, 24, 1, true);
    beamGeo.rotateZ(-Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f2ff,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(3.7, 0, 0);
    auvGroup.add(beamMesh);

    // STM32F407 Payload Master Microcontroller
    const mcuMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3, metalness: 0.4, wireframe: isWireframe });
    allMaterials.push(mcuMat);
    const mcuGeo = new THREE.BoxGeometry(0.6, 0.08, 0.4);
    const mcuMesh = new THREE.Mesh(mcuGeo, mcuMat);
    mcuMesh.position.set(1.2, 0.05, 0);
    mcuMesh.userData = { name: 'STM32F407 Payload Master MCU: ARM Cortex-M4F @ 168MHz running 200kHz PWM, DSP acoustic echo analysis, and autonomy.' };
    interactiveParts.push(mcuMesh);
    auvGroup.add(mcuMesh);
    explodableParts.push({ mesh: mcuMesh, basePos: mcuMesh.position.clone(), offsetDir: new THREE.Vector3(0.5, 0.6, 0) });

    // TL072 LNA & ADS1115 Sonar Preamp ASP Board
    const aspMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.4, wireframe: isWireframe });
    allMaterials.push(aspMat);
    const aspGeo = new THREE.BoxGeometry(0.5, 0.08, 0.35);
    const aspMesh = new THREE.Mesh(aspGeo, aspMat);
    aspMesh.position.set(0.5, 0.05, 0);
    aspMesh.userData = { name: 'TL072 LNA Preamp & ADS1115 ASP: 16-Bit analog signal processing sub-board for +38dB echo amplification and digitization.' };
    interactiveParts.push(aspMesh);
    auvGroup.add(aspMesh);
    explodableParts.push({ mesh: aspMesh, basePos: aspMesh.position.clone(), offsetDir: new THREE.Vector3(0.2, 0.6, -0.4) });

    // Li-ion Battery Pack (3S 11.1V 2600mAh)
    const batMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.5, wireframe: isWireframe });
    allMaterials.push(batMat);
    const batGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.1, 16);
    batGeo.rotateZ(Math.PI / 2);
    const batMesh = new THREE.Mesh(batGeo, batMat);
    batMesh.position.set(-0.3, 0.05, 0);
    batMesh.userData = { name: '3S 11.1V Li-Ion Battery Pack: 3S1P cylindrical cell pack (2600 mAh) delivering primary 11.1V system power bus.' };
    interactiveParts.push(batMesh);
    auvGroup.add(batMesh);
    explodableParts.push({ mesh: batMesh, basePos: batMesh.position.clone(), offsetDir: new THREE.Vector3(-0.2, 0.8, 0) });

    // TP4055 Charging Module & INA219 Power Monitor
    const pmuGeo = new THREE.BoxGeometry(0.3, 0.08, 0.25);
    const pmuMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, wireframe: isWireframe });
    allMaterials.push(pmuMat);
    const pmuMesh = new THREE.Mesh(pmuGeo, pmuMat);
    pmuMesh.position.set(-1.1, 0.05, 0.1);
    pmuMesh.userData = { name: 'TP4055 Charging Module: CC/CV Li-ion battery charge management sub-circuit.' };
    interactiveParts.push(pmuMesh);
    auvGroup.add(pmuMesh);
    explodableParts.push({ mesh: pmuMesh, basePos: pmuMesh.position.clone(), offsetDir: new THREE.Vector3(-0.5, 0.5, 0.5) });

    // INA219 Current/Voltage Monitor
    const inaMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, wireframe: isWireframe });
    allMaterials.push(inaMat);
    const inaGeo = new THREE.BoxGeometry(0.2, 0.06, 0.2);
    const inaMesh = new THREE.Mesh(inaGeo, inaMat);
    inaMesh.position.set(-1.1, 0.05, -0.12);
    inaMesh.userData = { name: 'INA219 Current/Voltage Monitor: High-side shunt reporting real-time bus telemetry over I2C.' };
    interactiveParts.push(inaMesh);
    auvGroup.add(inaMesh);
    explodableParts.push({ mesh: inaMesh, basePos: inaMesh.position.clone(), offsetDir: new THREE.Vector3(-0.5, 0.5, -0.5) });

    // MP1584 5V & 3.3V Dual Buck Regulators
    const buckMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, wireframe: isWireframe });
    allMaterials.push(buckMat);
    const buckGeo = new THREE.BoxGeometry(0.3, 0.08, 0.25);
    const buckMesh = new THREE.Mesh(buckGeo, buckMat);
    buckMesh.position.set(-1.45, 0.05, 0);
    buckMesh.userData = { name: 'MP1584 5V & 3.3V Buck Regulators: High-efficiency step-down DC-DC split power rails.' };
    interactiveParts.push(buckMesh);
    auvGroup.add(buckMesh);
    explodableParts.push({ mesh: buckMesh, basePos: buckMesh.position.clone(), offsetDir: new THREE.Vector3(-0.8, 0.5, 0) });

    // Dual Steering Servos (Tail Rudders & Elevons)
    const servoMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4, wireframe: isWireframe });
    allMaterials.push(servoMat);
    const servoGeo = new THREE.BoxGeometry(0.35, 0.25, 0.3);
    const servoMesh = new THREE.Mesh(servoGeo, servoMat);
    servoMesh.position.set(-2.05, 0.05, 0);
    servoMesh.userData = { name: 'Dual Steering Servos (Rudders): Waterproof micro-servos actuating dive planes and steering fins.' };
    interactiveParts.push(servoMesh);
    auvGroup.add(servoMesh);
    explodableParts.push({ mesh: servoMesh, basePos: servoMesh.position.clone(), offsetDir: new THREE.Vector3(-1.2, 0.3, 0) });

    // Waterproof Shaft Seal (Stuffing Box)
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2, wireframe: isWireframe });
    allMaterials.push(sealMat);
    const sealGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16);
    sealGeo.rotateZ(Math.PI / 2);
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.set(-2.28, 0, 0);
    sealMesh.userData = { name: 'Waterproof Shaft Seal (Stuffing Box): Nitrile lip seals with PTFE packing preventing water ingress.' };
    interactiveParts.push(sealMesh);
    auvGroup.add(sealMesh);
    explodableParts.push({ mesh: sealMesh, basePos: sealMesh.position.clone(), offsetDir: new THREE.Vector3(-1.5, 0, 0) });

    // Brushless DC Motor & ESC (Tail)
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.1, wireframe: isWireframe });
    allMaterials.push(motorMat);
    const motorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
    motorGeo.rotateZ(Math.PI / 2);
    const motorMesh = new THREE.Mesh(motorGeo, motorMat);
    motorMesh.position.set(-1.7, 0, 0);
    motorMesh.userData = { name: 'Brushless DC Motor & ESC: High-efficiency propulsion motor coupled to 3-blade propeller.' };
    interactiveParts.push(motorMesh);
    auvGroup.add(motorMesh);
    explodableParts.push({ mesh: motorMesh, basePos: motorMesh.position.clone(), offsetDir: new THREE.Vector3(-1.0, 0, 0) });

    // 3-Blade Propeller Assembly
    const propGroup = new THREE.Group();
    propGroup.position.set(-2.8, 0, 0);

    const hubMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2, wireframe: isWireframe });
    allMaterials.push(hubMat);
    const hubMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 16), hubMat);
    hubMesh.rotateZ(-Math.PI / 2);
    propGroup.add(hubMesh);

    const bladeGeo = new THREE.BoxGeometry(0.08, 0.45, 0.02);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.3, roughness: 0.2, wireframe: isWireframe });
    allMaterials.push(bladeMat);

    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.x = (i * Math.PI * 2) / 3;
      blade.position.y = Math.cos((i * Math.PI * 2) / 3) * 0.25;
      blade.position.z = Math.sin((i * Math.PI * 2) / 3) * 0.25;
      blade.rotation.y = 0.4;
      propGroup.add(blade);
    }
    propGroup.userData = { name: '3-Blade Propeller: Hydrodynamic 55mm rotor producing forward thrust with minimal acoustic cavitation.' };
    auvGroup.add(propGroup);
    explodableParts.push({ mesh: propGroup, basePos: propGroup.position.clone(), offsetDir: new THREE.Vector3(-2.4, 0, 0) });

    allMaterialsRef.current = allMaterials;
    explodablePartsRef.current = explodableParts;

    scene.add(auvGroup);

    // Raycasting for interactive click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([...interactiveParts, ...hullMeshes, propGroup], true);

      if (intersects.length > 0) {
        let chosen = intersects[0].object;
        while (chosen.parent && chosen.parent !== auvGroup && !chosen.userData.name) {
          chosen = chosen.parent;
        }
        if (chosen.userData && chosen.userData.name) {
          setSelectedPart(chosen.userData.name);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Continuous propeller spin
      propGroup.rotation.x -= delta * 12;

      // Acoustic beam pulsation
      const pulse = 0.2 + 0.15 * Math.sin(elapsed * 4);
      beamMat.opacity = pulse;

      // Subtle resting water bobbing
      auvGroup.position.y = Math.sin(elapsed * 1.5) * 0.03;
      auvGroup.rotation.z = Math.sin(elapsed * 1.2) * 0.012;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
      controls.dispose();
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#050811] text-cyan-400 font-mono select-none overflow-hidden rounded-xl border border-cyan-500/25">
      {/* Sleek Top Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#090d19] border-b border-white/[0.08] gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wider">
            AUV-9 DIGITAL TWIN
          </span>
          <span className="text-[10px] text-cyan-300/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            PLA 100mm TORPEDO
          </span>
        </div>

        {/* Quick Viewport Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Ghost Hull Mode Toggle */}
          <button
            onClick={() => setIsHullGhost(!isHullGhost)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
              isHullGhost
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                : 'bg-white/[0.05] text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Transparent Hull to inspect interior electronics"
          >
            {isHullGhost ? <Eye size={12} className="text-cyan-400" /> : <EyeOff size={12} />}
            <span>{isHullGhost ? 'Hull: Ghost (X-Ray)' : 'Hull: Solid PLA'}</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all border ${
              isWireframe
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-white/[0.05] text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Wireframe CAD Mesh"
          >
            <Box size={12} />
            <span>Wireframe</span>
          </button>

          {/* Explode Slider */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/10 text-[11px]">
            <Sliders size={12} className="text-amber-400" />
            <span className="text-neutral-400">Explode:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={explodeFactor}
              onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
              className="w-20 accent-amber-400 cursor-pointer h-1"
            />
            <span className="text-amber-400 font-mono text-[10px] w-6 text-right">
              {Math.round(explodeFactor * 100)}%
            </span>
          </div>

          {/* Auto Rotation Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all border ${
              isAutoRotating
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/[0.05] text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle Auto-Rotation"
          >
            {isAutoRotating ? <Pause size={11} /> : <Play size={11} />}
            <span>Spin</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => resetCameraRef.current()}
            className="px-2 py-1 rounded text-[11px] bg-white/[0.05] hover:bg-white/10 text-neutral-300 border border-white/10 flex items-center gap-1 transition-all"
            title="Reset Camera View"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>

          {/* Edit 3D Script Button */}
          {onOpenCodeEditor && (
            <button
              onClick={onOpenCodeEditor}
              className="px-2.5 py-1 rounded text-[11px] bg-cyan-400/20 hover:bg-cyan-400 hover:text-black text-cyan-300 border border-cyan-400/50 font-bold flex items-center gap-1.5 transition-all"
              title="Open Three.js Procedural Geometry Editor"
            >
              <Code2 size={12} />
              <span>3D SCRIPT</span>
            </button>
          )}

          {/* Toggle Subsystems Drawer */}
          <button
            onClick={() => setShowSubsystemsList(!showSubsystemsList)}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border transition-all ${
              showSubsystemsList
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                : 'bg-white/[0.05] text-neutral-400 border-white/10'
            }`}
            title="Toggle Subsystem Selection Drawer"
          >
            <Info size={11} />
            <span>Parts ({showSubsystemsList ? 'Hide' : 'Show'})</span>
          </button>
        </div>
      </div>

      {/* Main Viewport + Subsystem Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D WebGL Canvas */}
        <div className="flex-1 relative h-full cursor-grab active:cursor-grabbing">
          <div ref={mountRef} className="w-full h-full" />
          
          {/* Subtle Bottom Controls Hint */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-neutral-400 pointer-events-none flex items-center gap-2">
            <span>🖱️ Drag to Rotate</span>
            <span>•</span>
            <span>Scroll to Zoom</span>
            <span>•</span>
            <span>Click part in 3D to inspect</span>
          </div>

          {/* Active Selected Part Floating Card */}
          <div className="absolute bottom-3 right-3 max-w-sm bg-black/85 backdrop-blur-md p-3 rounded-lg border border-cyan-500/40 text-xs shadow-[0_10px_25px_rgba(0,0,0,0.8)] pointer-events-auto">
            <div className="flex items-center justify-between gap-2 mb-1 border-b border-white/10 pb-1">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1">
                <Info size={11} /> Selected Component
              </span>
              <span className="text-[9px] text-neutral-400 bg-white/10 px-1.5 py-0.5 rounded">
                REV 1.1
              </span>
            </div>
            <p className="text-cyan-100 text-[11px] leading-relaxed">
              {selectedPart}
            </p>
          </div>
        </div>

        {/* Subsystems Quick Select Drawer */}
        {showSubsystemsList && (
          <aside className="w-72 bg-[#080c16] border-l border-white/[0.08] flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 border-b border-white/[0.08] bg-[#0b101d] flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Subsystem Selector
              </span>
              <span className="text-[10px] text-neutral-400">13 Parts</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
              {[
                { name: 'PZT Piezoceramic Transducer (200kHz): Bow-mounted acoustic transducer for active sounding & obstacle ToF.', label: 'PZT Transducer (200kHz)', icon: '🟢' },
                { name: 'MS5837-30BA Depth Pressure Sensor: 30-bar high-resolution I2C pressure transducer for subsea depth telemetry.', label: 'MS5837 Depth Sensor', icon: '🔵' },
                { name: 'Forward Camera & LED Module: 1080p optical subsea imaging aperture with integrated white LED illumination.', label: 'Forward Camera & LED', icon: '🟣' },
                { name: 'STM32F407 Payload Master MCU: ARM Cortex-M4F @ 168MHz running 200kHz PWM, DSP acoustic echo analysis, and autonomy.', label: 'STM32F407 Payload Master', icon: '🔷' },
                { name: '3S 11.1V Li-Ion Battery Pack: 3S1P cylindrical cell pack (2600 mAh) delivering primary 11.1V system power bus.', label: '3S 11.1V Li-Ion Battery', icon: '🔴' },
                { name: 'TP4055 Charging Module: CC/CV Li-ion battery charge management sub-circuit.', label: 'TP4055 Charging Module', icon: '🟠' },
                { name: 'INA219 Current/Voltage Monitor: High-side shunt reporting real-time bus voltage and current over I2C.', label: 'INA219 Power Monitor', icon: '⚡' },
                { name: 'MP1584 5V & 3.3V Buck Regulators: Dual DC-DC step-down modules powering servos, ESC logic, and MCU.', label: 'MP1584 Buck Regulators', icon: '🟡' },
                { name: 'TL072 LNA Preamp & ADS1115 ASP: 16-Bit analog signal processing sub-board for +38dB echo amplification and digitization.', label: 'TL072 LNA Preamp & ADC', icon: '🎛️' },
                { name: 'Waterproof Shaft Seal (Stuffing Box): Nitrile lip seals with PTFE packing preventing water ingress.', label: 'Waterproof Shaft Seal', icon: '🛡️' },
                { name: 'Dual Steering Servos (Rudders): Waterproof micro-servos actuating dive planes and steering fins.', label: 'Dual Steering Servos', icon: '🧭' },
                { name: 'Brushless DC Motor & ESC: High-efficiency propulsion motor coupled to 3-blade propeller.', label: 'Brushless Motor & ESC', icon: '⚙️' },
                { name: '3-Blade Propeller: Hydrodynamic 55mm rotor producing forward thrust with minimal acoustic cavitation.', label: '3-Blade Propeller', icon: '🌀' }
              ].map((part, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPart(part.name);
                    if (!isHullGhost) setIsHullGhost(true);
                  }}
                  className={`w-full text-left p-2 rounded transition-all flex items-center gap-2 text-[11px] border ${
                    selectedPart.startsWith(part.label.split(' ')[0]) || selectedPart === part.name
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-semibold'
                      : 'bg-black/30 border-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-xs shrink-0">{part.icon}</span>
                  <span className="truncate">{part.label}</span>
                  <ChevronRight size={11} className="ml-auto opacity-40 shrink-0" />
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Target, 
  XSquare, 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Radio, 
  Waves,
  Zap,
  Activity
} from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';

interface Obstacle {
  id: number;
  x: number; // in meters (0 to 24)
  y: number; // in meters (0 to 16)
  radius: number; // meters
}

interface Waypoint {
  x: number;
  y: number;
}

export function SlamMap() {
  const telemetry = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation Configuration & World Dimensions
  const WORLD_WIDTH = 24;  // meters
  const WORLD_HEIGHT = 16; // meters
  const GRID_COLS = 48;    // 0.5m cell resolution
  const GRID_ROWS = 32;

  // Simulation State
  const [isRunning, setIsRunning] = useState(true);
  const [dwaAvoidance, setDwaAvoidance] = useState(true);
  const [pattern, setPattern] = useState<'lawnmower' | 'spiral' | 'frontier'>('lawnmower');
  const [viewMode, setViewMode] = useState<'2d' | '3d_iso'>('2d');
  const [stats, setStats] = useState({
    coveragePct: 0,
    areaMappedM2: 0,
    fAttMag: 1.85,
    fAttDeg: 180,
    fRepMag: 0.0,
    fRepDeg: 0,
    fResDeg: 180,
    dangerIndex: 0.05,
    clearanceM: 5.2,
    linearVel: 1.25,
    rotVel: 0.02
  });

  // Obstacles
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { id: 1, x: 8.5, y: 5.0, radius: 1.2 },
    { id: 2, x: 9.2, y: 5.8, radius: 1.0 },
    { id: 3, x: 14.0, y: 10.5, radius: 1.4 },
    { id: 4, x: 17.5, y: 6.2, radius: 1.1 },
    { id: 5, x: 6.0, y: 12.0, radius: 1.3 },
  ]);

  // AUV Internal State Ref (for 60fps animation without React re-renders)
  const simState = useRef({
    x: 2.0,
    y: 2.5,
    heading: 0, // radians
    speed: 1.25, // m/s
    trackIndex: 0,
    waypoints: [] as Waypoint[],
    pathHistory: [] as { x: number; y: number }[],
    grid: new Float32Array(GRID_COLS * GRID_ROWS), // 0: unexplored, >0: probability
    pingPhase: 0,
    obstacleRepulsion: { x: 0, y: 0, mag: 0, angle: 0 },
    targetAttraction: { x: 0, y: 0, mag: 0, angle: 0 }
  });

  // Generate Lawnmower (Boustrophedon) Waypoints
  const generateWaypoints = useCallback((mode: 'lawnmower' | 'spiral' | 'frontier') => {
    const pts: Waypoint[] = [];
    if (mode === 'lawnmower') {
      const stepY = 2.4; // 2.4m swath spacing
      let goingRight = true;
      for (let y = 2.5; y <= WORLD_HEIGHT - 2.0; y += stepY) {
        if (goingRight) {
          pts.push({ x: 2.5, y });
          pts.push({ x: WORLD_WIDTH - 2.5, y });
        } else {
          pts.push({ x: WORLD_WIDTH - 2.5, y });
          pts.push({ x: 2.5, y });
        }
        goingRight = !goingRight;
      }
    } else if (mode === 'spiral') {
      let minX = 2.5, maxX = WORLD_WIDTH - 2.5;
      let minY = 2.5, maxY = WORLD_HEIGHT - 2.5;
      while (minX < maxX && minY < maxY) {
        pts.push({ x: minX, y: minY });
        pts.push({ x: maxX, y: minY });
        pts.push({ x: maxX, y: maxY });
        pts.push({ x: minX, y: maxY });
        minX += 2.5;
        maxX -= 2.5;
        minY += 2.5;
        maxY -= 2.5;
      }
    } else { // frontier exploration
      pts.push({ x: 6, y: 4 });
      pts.push({ x: 18, y: 5 });
      pts.push({ x: 16, y: 12 });
      pts.push({ x: 6, y: 11 });
      pts.push({ x: 12, y: 8 });
    }
    return pts;
  }, [WORLD_HEIGHT, WORLD_WIDTH]);

  // Reset simulation
  const handleReset = useCallback(() => {
    const pts = generateWaypoints(pattern);
    simState.current.x = pts[0]?.x || 2.0;
    simState.current.y = pts[0]?.y || 2.5;
    simState.current.heading = 0;
    simState.current.trackIndex = 0;
    simState.current.waypoints = pts;
    simState.current.pathHistory = [];
    simState.current.grid.fill(0);
  }, [generateWaypoints, pattern]);

  // Initialize waypoints when pattern changes
  useEffect(() => {
    handleReset();
  }, [pattern, handleReset]);

  // Click canvas to plant an obstacle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * WORLD_WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * WORLD_HEIGHT;

    // Check if clicked near an existing obstacle to delete it
    const existingIdx = obstacles.findIndex(obs => {
      const dist = Math.hypot(obs.x - clickX, obs.y - clickY);
      return dist < obs.radius + 0.5;
    });

    if (existingIdx >= 0) {
      setObstacles(prev => prev.filter((_, i) => i !== existingIdx));
    } else {
      setObstacles(prev => [
        ...prev,
        { id: Date.now(), x: clickX, y: clickY, radius: 0.9 + Math.random() * 0.6 }
      ]);
    }
  };

  // Inject random obstacle
  const handleInjectObstacle = () => {
    setObstacles(prev => [
      ...prev,
      {
        id: Date.now(),
        x: 3.5 + Math.random() * (WORLD_WIDTH - 7),
        y: 2.5 + Math.random() * (WORLD_HEIGHT - 5),
        radius: 0.8 + Math.random() * 0.7
      }
    ]);
  };

  // Main 60fps SLAM Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let statsUpdateTimer = 0;

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const sim = simState.current;
      sim.pingPhase += dt * 3.5;

      // ==========================================
      // 1. VEHICLE DYNAMICS & DWA / APF NAVIGATION
      // ==========================================
      if (isRunning && sim.waypoints.length > 0) {
        const target = sim.waypoints[sim.trackIndex];
        let targetAngle = 0;
        let distToTarget = 0;

        if (target) {
          const dx = target.x - sim.x;
          const dy = target.y - sim.y;
          distToTarget = Math.hypot(dx, dy);
          targetAngle = Math.atan2(dy, dx);

          if (distToTarget < 1.0) {
            // Reached waypoint, advance to next
            sim.trackIndex = (sim.trackIndex + 1) % sim.waypoints.length;
          }
        }

        // Attractive Force F_att
        const kAtt = 1.5;
        const fAttX = Math.cos(targetAngle) * kAtt;
        const fAttY = Math.sin(targetAngle) * kAtt;
        sim.targetAttraction = {
          x: fAttX,
          y: fAttY,
          mag: +(kAtt).toFixed(2),
          angle: Math.round(((targetAngle * 180 / Math.PI) + 360) % 360)
        };

        // Repulsive Force F_rep from Obstacles (Artificial Potential Field)
        let fRepX = 0;
        let fRepY = 0;
        let minClearance = 999;
        const kRep = 4.2;
        const barrierDist = 2.8; // meters

        obstacles.forEach(obs => {
          const dx = sim.x - obs.x;
          const dy = sim.y - obs.y;
          const dist = Math.hypot(dx, dy) - obs.radius;
          if (dist < minClearance) minClearance = dist;

          if (dwaAvoidance && dist < barrierDist && dist > 0.01) {
            const force = kRep * Math.pow((1 / dist - 1 / barrierDist), 2);
            const angle = Math.atan2(dy, dx);
            fRepX += Math.cos(angle) * force;
            fRepY += Math.sin(angle) * force;
          }
        });

        const fRepMag = Math.hypot(fRepX, fRepY);
        const fRepAngle = Math.atan2(fRepY, fRepX);
        sim.obstacleRepulsion = {
          x: fRepX,
          y: fRepY,
          mag: +fRepMag.toFixed(2),
          angle: Math.round(((fRepAngle * 180 / Math.PI) + 360) % 360)
        };

        // Resultant Force & Steering Angle
        const fResX = fAttX + fRepX;
        const fResY = fAttY + fRepY;
        const desiredHeading = Math.atan2(fResY, fResX);

        // Turn rate limits (hydrodynamic fin response)
        let headingDiff = desiredHeading - sim.heading;
        while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
        while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;

        const maxTurnRate = 2.4; // rad/s
        const rotVel = Math.max(-maxTurnRate, Math.min(maxTurnRate, headingDiff * 3.5));
        sim.heading += rotVel * dt;

        // Speed regulation (slow down when turning sharply or dodging obstacles)
        const speedFactor = Math.max(0.4, 1.0 - (fRepMag * 0.15) - Math.abs(rotVel) * 0.2);
        sim.speed = 1.35 * speedFactor;

        // Move vehicle
        sim.x += Math.cos(sim.heading) * sim.speed * dt;
        sim.y += Math.sin(sim.heading) * sim.speed * dt;

        // Boundary containment
        sim.x = Math.max(1.0, Math.min(WORLD_WIDTH - 1.0, sim.x));
        sim.y = Math.max(1.0, Math.min(WORLD_HEIGHT - 1.0, sim.y));

        // Record breadcrumb path
        if (sim.pathHistory.length === 0 || Math.hypot(sim.pathHistory[sim.pathHistory.length - 1].x - sim.x, sim.pathHistory[sim.pathHistory.length - 1].y - sim.y) > 0.25) {
          sim.pathHistory.push({ x: sim.x, y: sim.y });
          if (sim.pathHistory.length > 600) sim.pathHistory.shift();
        }

        // ==========================================
        // 2. SONAR OCCUPANCY GRID MAPPING (200kHz CONE)
        // ==========================================
        const coneAngle = Math.PI / 3; // 60 deg cone
        const sonarRange = 5.0; // 5 meters
        const startAngle = sim.heading - coneAngle / 2;
        const endAngle = sim.heading + coneAngle / 2;

        // Map cells inside the sonar swath
        const cellW = WORLD_WIDTH / GRID_COLS;
        const cellH = WORLD_HEIGHT / GRID_ROWS;

        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const cellX = (c + 0.5) * cellW;
            const cellY = (r + 0.5) * cellH;
            const dx = cellX - sim.x;
            const dy = cellY - sim.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= sonarRange) {
              const angleToCell = Math.atan2(dy, dx);
              let angleDiff = angleToCell - sim.heading;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

              if (Math.abs(angleDiff) <= coneAngle / 2) {
                // Check if cell contains an obstacle
                let isOccupied = false;
                for (const obs of obstacles) {
                  if (Math.hypot(cellX - obs.x, cellY - obs.y) <= obs.radius) {
                    isOccupied = true;
                    break;
                  }
                }

                const idx = r * GRID_COLS + c;
                if (isOccupied) {
                  sim.grid[idx] = Math.min(1.0, sim.grid[idx] + 0.25); // high occupancy prob
                } else {
                  // If cell was 0, set to 0.05 (free path), if already free increment slightly
                  sim.grid[idx] = sim.grid[idx] === 0 ? 0.08 : Math.min(0.2, sim.grid[idx] + 0.01);
                }
              }
            }
          }
        }

        // Update React stats periodically (every 100ms)
        statsUpdateTimer += dt;
        if (statsUpdateTimer > 0.1) {
          statsUpdateTimer = 0;
          let exploredCount = 0;
          for (let i = 0; i < sim.grid.length; i++) {
            if (sim.grid[i] > 0) exploredCount++;
          }
          const coverage = (exploredCount / sim.grid.length) * 100;
          const areaM2 = exploredCount * (cellW * cellH);
          const danger = Math.min(1.0, Math.max(0, 1.0 - (minClearance / barrierDist)));

          setStats({
            coveragePct: +coverage.toFixed(1),
            areaMappedM2: +areaM2.toFixed(1),
            fAttMag: sim.targetAttraction.mag,
            fAttDeg: sim.targetAttraction.angle,
            fRepMag: sim.obstacleRepulsion.mag,
            fRepDeg: sim.obstacleRepulsion.angle,
            fResDeg: Math.round(((desiredHeading * 180 / Math.PI) + 360) % 360),
            dangerIndex: +danger.toFixed(2),
            clearanceM: Math.max(0, +minClearance.toFixed(2)),
            linearVel: +sim.speed.toFixed(2),
            rotVel: +rotVel.toFixed(2)
          });
        }
      }

      // ==========================================
      // 3. CANVAS RENDERING ENGINE
      // ==========================================
      const w = Math.max(1, canvas.width);
      const h = Math.max(1, canvas.height);
      const scaleX = w / WORLD_WIDTH;
      const scaleY = h / WORLD_HEIGHT;

      ctx.clearRect(0, 0, w, h);

      // A. Deep Oceanic Seafloor Background
      ctx.fillStyle = '#060c18';
      ctx.fillRect(0, 0, w, h);

      // B. Metric Sounding Grid (1m grid lines)
      ctx.strokeStyle = '#0f1d35';
      ctx.lineWidth = 1;
      for (let x = 0; x <= WORLD_WIDTH; x += 2) {
        ctx.beginPath();
        ctx.moveTo(x * scaleX, 0);
        ctx.lineTo(x * scaleX, h);
        ctx.stroke();
      }
      for (let y = 0; y <= WORLD_HEIGHT; y += 2) {
        ctx.beginPath();
        ctx.moveTo(0, y * scaleY);
        ctx.lineTo(w, y * scaleY);
        ctx.stroke();
      }

      // C. Render Occupancy Grid Cells
      const cellWPix = (WORLD_WIDTH / GRID_COLS) * scaleX;
      const cellHPix = (WORLD_HEIGHT / GRID_ROWS) * scaleY;

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const val = sim.grid[r * GRID_COLS + c];
          if (val > 0) {
            const px = c * cellWPix;
            const py = r * cellHPix;
            if (val > 0.4) {
              // Occupied Hazard (Red/Amber)
              ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + val * 0.45})`;
              ctx.fillRect(px, py, cellWPix + 0.5, cellHPix + 0.5);
            } else {
              // Free Charted Path (Acoustic Cyan)
              ctx.fillStyle = `rgba(0, 240, 255, ${0.12 + val * 0.35})`;
              ctx.fillRect(px, py, cellWPix + 0.5, cellHPix + 0.5);
            }
          }
        }
      }

      // D. Draw Survey Waypoint Path (Lawnmower Corridors)
      if (sim.waypoints.length > 1) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        sim.waypoints.forEach((pt, i) => {
          const px = pt.x * scaleX;
          const py = pt.y * scaleY;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Active Target Waypoint Marker
        const targetPt = sim.waypoints[sim.trackIndex];
        if (targetPt) {
          const tx = targetPt.x * scaleX;
          const ty = targetPt.y * scaleY;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tx, ty, Math.max(0, 8), 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(tx, ty, Math.max(0, 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // E. Draw AUV Traversed Trail
      if (sim.pathHistory.length > 1) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        sim.pathHistory.forEach((pt, i) => {
          const px = pt.x * scaleX;
          const py = pt.y * scaleY;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      // F. Render Obstacles (Subsea Boulders & Coral Pinnacles)
      obstacles.forEach(obs => {
        const ox = obs.x * scaleX;
        const oy = obs.y * scaleY;
        const or = Math.max(0, obs.radius * scaleX);

        // Danger Aura
        const grad = ctx.createRadialGradient(ox, oy, Math.max(0, or * 0.4), ox, oy, Math.max(0, or * 1.8));
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.2)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, Math.max(0, or * 1.8), 0, Math.PI * 2);
        ctx.fill();

        // Solid Boulder Core
        ctx.fillStyle = '#1e1b2e';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, Math.max(0, or), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hazard Crosshairs
        ctx.fillStyle = '#f87171';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P>0.90`, ox, oy + 3);
      });

      // G. 200kHz Bow Sonar Acoustic Swath Cone
      const auvPx = sim.x * scaleX;
      const auvPy = sim.y * scaleY;
      const sonarRangePx = Math.max(0, 5.0 * scaleX);
      const coneAngle = Math.PI / 3;

      const coneGrad = ctx.createRadialGradient(auvPx, auvPy, 0, auvPx, auvPy, Math.max(0, sonarRangePx));
      coneGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      coneGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.15)');
      coneGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.save();
      ctx.translate(auvPx, auvPy);
      ctx.rotate(sim.heading);

      // Acoustic Conical Projection
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(0, sonarRangePx), -coneAngle / 2, coneAngle / 2);
      ctx.closePath();
      ctx.fill();

      // Sonar Acoustic Wave Pulses (Moving rings)
      const waveOffset = Math.max(0, (sim.pingPhase % 1) * sonarRangePx);
      ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 0.8 - (waveOffset / (sonarRangePx || 1)))})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, waveOffset), -coneAngle / 2, coneAngle / 2);
      ctx.stroke();

      ctx.restore();

      // H. Dynamic Obstacle Avoidance Vectors
      if (dwaAvoidance) {
        // 1. Attractive Vector F_att (Cyan Arrow)
        const fAttLength = 40;
        const fAttTargetAngle = (stats.fAttDeg * Math.PI) / 180;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(auvPx, auvPy);
        ctx.lineTo(auvPx + Math.cos(fAttTargetAngle) * fAttLength, auvPy + Math.sin(fAttTargetAngle) * fAttLength);
        ctx.stroke();

        // 2. Repulsive Vector F_rep (Red Arrow - if active)
        if (stats.fRepMag > 0.05) {
          const fRepLength = Math.min(60, stats.fRepMag * 15);
          const fRepTargetAngle = (stats.fRepDeg * Math.PI) / 180;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(auvPx, auvPy);
          ctx.lineTo(auvPx + Math.cos(fRepTargetAngle) * fRepLength, auvPy + Math.sin(fRepTargetAngle) * fRepLength);
          ctx.stroke();
        }

        // 3. Resultant Course Steering Vector (Green Line)
        const fResTargetAngle = (stats.fResDeg * Math.PI) / 180;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(auvPx, auvPy);
        ctx.lineTo(auvPx + Math.cos(fResTargetAngle) * 45, auvPy + Math.sin(fResTargetAngle) * 45);
        ctx.stroke();
      }

      // I. Render AUV Torpedo Icon
      ctx.save();
      ctx.translate(auvPx, auvPy);
      ctx.rotate(sim.heading);

      // Torpedo Body (PLA Yellow)
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Elliptical torpedo body with nose cone
      ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Nose Sonar Apex
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(14, 0, Math.max(0, 3), 0, Math.PI * 2);
      ctx.fill();

      // Tail Fins
      ctx.fillStyle = '#334155';
      ctx.fillRect(-16, -7, 4, 14);

      // Propeller Spinner
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-18, -3, 3, 6);

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, dwaAvoidance, obstacles, WORLD_WIDTH, WORLD_HEIGHT, GRID_COLS, GRID_ROWS, stats.fAttDeg, stats.fRepDeg, stats.fRepMag, stats.fResDeg]);

  return (
    <div className="flex flex-col lg:flex-row border border-abyssal-border bg-[#050911] rounded overflow-hidden relative shadow-2xl">
      
      {/* Left Column: Interactive Map Canvas */}
      <div className="flex-1 flex flex-col relative overflow-hidden min-h-[480px]">
        {/* Header HUD */}
        <div className="p-3 pb-2 flex flex-wrap items-center justify-between gap-3 bg-[#08101e]/90 border-b border-abyssal-border/80 backdrop-blur z-10 font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-abyssal-cyan"></div>
            <div>
              <h3 className="text-white font-bold tracking-wider uppercase text-xs flex items-center gap-2">
                ROBOVAC OCCUPANCY GRID & SLAM SONAR MATRIX
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-normal">
                  200kHz PZT SWEEP
                </span>
              </h3>
              <p className="text-[10px] text-abyssal-muted">
                Boustrophedon frontier sweeping with Artificial Potential Field repulsion & Bayesian log-odds mapping.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all text-[11px] ${
                isRunning 
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300' 
                  : 'bg-green-500/20 border border-green-500/50 text-green-300'
              }`}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              <span>{isRunning ? 'PAUSE AUV' : 'RESUME SWEEP'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-2 py-1 rounded bg-[#0b1424] hover:bg-[#111f38] border border-abyssal-border text-abyssal-muted hover:text-white flex items-center gap-1 text-[11px]"
              title="Reset Path and Clear Grid"
            >
              <RotateCcw size={12} />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Legend Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 bg-[#060d1a] border-b border-abyssal-border/60 text-[10px] font-mono tracking-wider text-abyssal-muted">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-abyssal-text font-bold uppercase">// 24m × 16m SOUNDING ARENA</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-abyssal-cyan shadow-[0_0_6px_rgba(0,240,255,0.6)]"></span>
              <span>FREE PATH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"></span>
              <span>HAZARD (P &gt; 0.85)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
              <span>SWEEP WAYPOINT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500"></span>
              <span>STEERING VECTOR</span>
            </div>
          </div>

          <div className="text-[10px] text-abyssal-cyan">
            CLICK CANVAS TO ADD / REMOVE BOULDERS
          </div>
        </div>

        {/* Canvas Sounding Area */}
        <div className="flex-1 relative bg-[#060c18] overflow-hidden min-h-[380px]">
          <canvas
            ref={canvasRef}
            width={960}
            height={640}
            onClick={handleCanvasClick}
            className="w-full h-full object-contain cursor-crosshair block"
          />

          {/* Canvas Floating Overlay Indicators */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none font-mono text-[10px]">
            <div className="bg-[#08101e]/85 backdrop-blur px-2 py-1 rounded border border-abyssal-border text-abyssal-text">
              <span className="text-abyssal-muted">SONAR PAYLOAD: </span>
              <span className="text-abyssal-cyan font-bold">200kHz PZT (60° BEAM)</span>
            </div>
            <div className="bg-[#08101e]/85 backdrop-blur px-2 py-1 rounded border border-abyssal-border text-abyssal-text">
              <span className="text-abyssal-muted">CURRENT DEPTH: </span>
              <span className="text-white font-bold">{telemetry.depth} m</span>
              <span className="text-abyssal-muted ml-2">SOUND VELOCITY: </span>
              <span className="text-abyssal-amber font-bold">{telemetry.speedOfSoundMs} m/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Vectors & Autonomous Mission Control */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-abyssal-border bg-[#08101e] p-4 flex flex-col font-mono text-xs">
        
        {/* Mission Pattern Selection */}
        <div className="mb-4">
          <div className="text-[10px] text-abyssal-muted uppercase tracking-widest mb-2 flex items-center gap-1">
            <Compass size={12} className="text-abyssal-cyan" />
            <span>SWEEP PATTERN ALGORITHM</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setPattern('lawnmower')}
              className={`py-1.5 px-2 text-[10px] uppercase font-bold rounded border transition-all ${
                pattern === 'lawnmower'
                  ? 'bg-abyssal-cyan text-black border-abyssal-cyan'
                  : 'bg-black/40 text-abyssal-muted border-abyssal-border hover:text-white'
              }`}
              title="Equidistant parallel survey corridors"
            >
              LAWNMOWER
            </button>
            <button
              onClick={() => setPattern('spiral')}
              className={`py-1.5 px-2 text-[10px] uppercase font-bold rounded border transition-all ${
                pattern === 'spiral'
                  ? 'bg-abyssal-cyan text-black border-abyssal-cyan'
                  : 'bg-black/40 text-abyssal-muted border-abyssal-border hover:text-white'
              }`}
              title="Concentric inward spiral sweep"
            >
              SPIRAL
            </button>
            <button
              onClick={() => setPattern('frontier')}
              className={`py-1.5 px-2 text-[10px] uppercase font-bold rounded border transition-all ${
                pattern === 'frontier'
                  ? 'bg-abyssal-cyan text-black border-abyssal-cyan'
                  : 'bg-black/40 text-abyssal-muted border-abyssal-border hover:text-white'
              }`}
              title="Unexplored frontier goal nodes"
            >
              FRONTIER
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleInjectObstacle}
            className="py-1.5 px-2 bg-black/50 hover:bg-[#111f38] border border-abyssal-border text-abyssal-text text-[10px] uppercase rounded flex items-center justify-center gap-1"
          >
            <Target size={12} className="text-abyssal-cyan" />
            <span>INJECT BOULDER</span>
          </button>

          <button
            onClick={() => setDwaAvoidance(!dwaAvoidance)}
            className={`py-1.5 px-2 border text-[10px] uppercase font-bold rounded flex items-center justify-center gap-1 ${
              dwaAvoidance 
                ? 'bg-green-500/20 border-green-500 text-green-300' 
                : 'bg-red-500/20 border-red-500 text-red-300'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${dwaAvoidance ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>DWA AVOID: {dwaAvoidance ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Dynamic Vector Diagnostics HUD */}
        <div className="text-[10px] text-abyssal-muted uppercase tracking-widest mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-abyssal-amber">
            <Radio size={12} />
            <span>DYNAMIC AVOIDANCE VECTORS</span>
          </span>
          <span className="text-[9px] text-abyssal-cyan">POTENTIAL FIELDS</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* F_rep */}
          <div className="border border-abyssal-border bg-black/40 p-2 rounded">
            <span className="text-[9px] text-abyssal-muted uppercase block">
              REPULSIVE FORCE (F_rep)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-red-400">
                {stats.fRepDeg}°
              </span>
              <span className="text-[9px] text-abyssal-muted">
                ({stats.fRepMag.toFixed(1)} N)
              </span>
            </div>
            <span className="text-[9px] text-abyssal-muted block mt-0.5">
              Obstacle Repulsion
            </span>
          </div>

          {/* F_att */}
          <div className="border border-abyssal-border bg-black/40 p-2 rounded">
            <span className="text-[9px] text-abyssal-muted uppercase block">
              ATTRACTIVE TARGET (F_att)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-amber-300">
                {stats.fAttDeg}°
              </span>
              <span className="text-[9px] text-abyssal-muted">Bearing</span>
            </div>
            <span className="text-[9px] text-abyssal-muted block mt-0.5">
              Waypoint Goal
            </span>
          </div>

          {/* F_res */}
          <div className="border border-abyssal-border bg-black/40 p-2 rounded">
            <span className="text-[9px] text-abyssal-muted uppercase block">
              STEERING VECTOR (F_res)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-green-400">
                {stats.fResDeg}°
              </span>
              <span className="text-[9px] text-abyssal-muted">Course</span>
            </div>
            <span className="text-[9px] text-abyssal-muted block mt-0.5">
              Net Heading Cmd
            </span>
          </div>

          {/* Collision Danger */}
          <div className="border border-abyssal-border bg-black/40 p-2 rounded">
            <span className="text-[9px] text-abyssal-muted uppercase block">
              COLLISION HAZARD INDEX
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-sm font-bold ${
                stats.dangerIndex > 0.5 ? 'text-red-400 animate-pulse' : stats.dangerIndex > 0.2 ? 'text-amber-400' : 'text-abyssal-cyan'
              }`}>
                {stats.dangerIndex.toFixed(2)}
              </span>
              <span className="text-[9px] text-abyssal-muted">/ 1.0</span>
            </div>
            <span className="text-[9px] text-abyssal-muted block mt-0.5">
              {stats.dangerIndex > 0.5 ? 'CRITICAL EVADE' : stats.dangerIndex > 0.2 ? 'DWA ACTIVE' : 'CLEAR CORRIDOR'}
            </span>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="border border-abyssal-border bg-black/50 p-2.5 rounded mt-auto">
          <div className="flex justify-between items-center text-[10px] text-abyssal-muted uppercase mb-1">
            <span>AUTONOMOUS SWEEP COVERAGE</span>
            <span className="text-abyssal-cyan font-bold">{stats.coveragePct}%</span>
          </div>

          <div className="w-full h-1.5 bg-abyssal-border rounded overflow-hidden mb-1.5">
            <div 
              className="h-full bg-abyssal-cyan transition-all duration-300"
              style={{ width: `${stats.coveragePct}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-abyssal-muted">
            <span>Area: {stats.areaMappedM2} m² / 384 m²</span>
            <span>Speed: {stats.linearVel.toFixed(2)} m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

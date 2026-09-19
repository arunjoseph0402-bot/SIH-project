import { useState, useEffect } from 'react';

export interface TelemetryData {
  // Attitude & Navigation (STM32F103)
  pitch: number;
  roll: number;
  yaw: number;
  depth: number;
  heading: number;
  speedKnots: number;
  rudderAngle: number;
  elevatorAngle: number;
  motorRpm: number;

  // Environmental Sensors (MS5837-30BA, DS18B20, Optical Leak)
  pressureMbar: number;
  waterTempC: number;
  speedOfSoundMs: number; // Mackenzie formula: v = 1449.2 + 4.6T - 0.055T^2 + 0.00029T^3 + ...
  bilgeLeakDetected: boolean;
  internalHumidityPct: number;
  internalTempC: number;

  // Power Subsystem (INA219 & 3S Li-ion BMS)
  busVoltageV: number;
  busCurrentA: number;
  powerWatts: number;
  consumedMah: number;
  batterySocPct: number;
  cellVoltages: [number, number, number]; // 3S cells
  estRuntimeMinutes: number;

  // Sonar Payload Status (STM32F407)
  sonarPingCount: number;
  sonarPingRateHz: number;
  lastEchoDistanceM: number;
  acousticTargetConfidence: number;
}

let time = 0;
let consumedMahAccumulator = 342.5;
let pingCounter = 1248;

let currentTelemetry: TelemetryData = {
  pitch: -0.4,
  roll: 0.1,
  yaw: 184.2,
  depth: 14.82,
  heading: 184.2,
  speedKnots: 2.3,
  rudderAngle: 1.4,
  elevatorAngle: -0.8,
  motorRpm: 1240,

  pressureMbar: 2482.4,
  waterTempC: 14.2,
  speedOfSoundMs: 1502.4,
  bilgeLeakDetected: false,
  internalHumidityPct: 32.4,
  internalTempC: 22.8,

  busVoltageV: 11.18,
  busCurrentA: 3.42,
  powerWatts: 38.2,
  consumedMah: consumedMahAccumulator,
  batterySocPct: 88,
  cellVoltages: [3.73, 3.72, 3.73],
  estRuntimeMinutes: 44,

  sonarPingCount: pingCounter,
  sonarPingRateHz: 5.0,
  lastEchoDistanceM: 4.85,
  acousticTargetConfidence: 96.4
};

const listeners = new Set<(data: TelemetryData) => void>();

setInterval(() => {
  time += 0.05;
  const currentDraw = 3.3 + Math.sin(time * 0.4) * 0.4 + (Math.random() * 0.15 - 0.07);
  consumedMahAccumulator += (currentDraw * 1000 / 3600) * 0.05;
  pingCounter += 1;

  const waterT = 14.2 + Math.sin(time * 0.05) * 0.3;
  // Mackenzie simplified acoustic speed equation in seawater
  const cSound = 1449.2 + 4.6 * waterT - 0.055 * Math.pow(waterT, 2) + 0.00029 * Math.pow(waterT, 3) + 1.34 * (35 - 35) + 0.016 * 14.8;
  const nominalVolts = 11.2 - (consumedMahAccumulator / 2600) * 2.0;
  const cell1 = +(nominalVolts / 3 + (Math.random() * 0.01 - 0.005)).toFixed(2);
  const cell2 = +(nominalVolts / 3 + (Math.random() * 0.01 - 0.005)).toFixed(2);
  const cell3 = +(nominalVolts / 3 + (Math.random() * 0.01 - 0.005)).toFixed(2);

  const depthVal = +(14.82 + Math.sin(time * 0.15) * 0.45).toFixed(2);
  const pressVal = +(1013.25 + depthVal * 98.0665).toFixed(1);

  currentTelemetry = {
    pitch: +(-0.4 + Math.sin(time * 0.5) * 6).toFixed(1),
    roll: +(0.1 + Math.cos(time * 0.7) * 8).toFixed(1),
    yaw: +(184.2 + Math.sin(time * 0.2) * 15).toFixed(1),
    depth: depthVal,
    heading: +((184.2 + Math.sin(time * 0.2) * 15 + 360) % 360).toFixed(1),
    speedKnots: +(2.3 + Math.sin(time * 0.3) * 0.2).toFixed(1),
    rudderAngle: +(Math.sin(time * 0.6) * 4.5).toFixed(1),
    elevatorAngle: +(Math.cos(time * 0.4) * 3.2).toFixed(1),
    motorRpm: Math.round(1240 + Math.sin(time * 0.5) * 40),

    pressureMbar: pressVal,
    waterTempC: +waterT.toFixed(2),
    speedOfSoundMs: +cSound.toFixed(1),
    bilgeLeakDetected: false,
    internalHumidityPct: +(32.4 + Math.sin(time * 0.02) * 1.5).toFixed(1),
    internalTempC: +(22.8 + Math.sin(time * 0.03) * 0.6).toFixed(1),

    busVoltageV: +nominalVolts.toFixed(2),
    busCurrentA: +currentDraw.toFixed(2),
    powerWatts: +(nominalVolts * currentDraw).toFixed(1),
    consumedMah: Math.round(consumedMahAccumulator),
    batterySocPct: Math.max(5, Math.round(((nominalVolts - 9.6) / (12.4 - 9.6)) * 100)),
    cellVoltages: [cell1, cell2, cell3],
    estRuntimeMinutes: Math.max(1, Math.round(((2600 - (consumedMahAccumulator % 2600)) / (currentDraw * 1000)) * 60)),

    sonarPingCount: pingCounter,
    sonarPingRateHz: 5.0,
    lastEchoDistanceM: +(4.85 + Math.sin(time * 0.8) * 1.8).toFixed(2),
    acousticTargetConfidence: +(96.4 + Math.sin(time * 0.2) * 2.5).toFixed(1)
  };

  listeners.forEach(l => l(currentTelemetry));
}, 100);

export function useTelemetry() {
  const [data, setData] = useState<TelemetryData>(currentTelemetry);

  useEffect(() => {
    listeners.add(setData);
    return () => {
      listeners.delete(setData);
    };
  }, []);

  return data;
}


const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Simulated AUV State Variables
let auvState = {
  batteryPercentage: 94.5,
  voltage: 11.8,
  current: 1.42,
  depth: 1.2,
  temperature: 24.8,
  leakDetected: false,
  motorSpeed: 1200,
  heading: 45.0,
  pitch: 2.1,
  roll: -0.5,
  sonarActive: true,
  missionStatus: "AUTO_NAVIGATING"
};

// Function to simulate shifting underwater telemetry
function updateSimulation() {
  // Simulate battery slow drain
  if (auvState.batteryPercentage > 10) {
    auvState.batteryPercentage -= 0.01;
  }

  // Simulate depth fluctuation (diving and surfacing)
  auvState.depth = parseFloat((1.5 + Math.sin(Date.now() / 3000) * 1.2).toFixed(2));
  
  // Simulate micro-fluctuations in orientation
  auvState.pitch = parseFloat((Math.sin(Date.now() / 1000) * 1.5).toFixed(1));
  auvState.roll = parseFloat((Math.cos(Date.now() / 1200) * 0.8).toFixed(1));
}

// Broadcast data to all connected React clients every 1000ms
setInterval(() => {
  updateSimulation();
  const payload = JSON.stringify({
    type: 'TELEMETRY_UPDATE',
    timestamp: new Date().toISOString(),
    data: auvState
  });

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}, 1000);

wss.on('connection', (ws) => {
  console.log('🟢 React Frontend Dashboard Connected via WebSocket');
  
  ws.on('message', (message) => {
    try {
      const command = JSON.parse(message);
      console.log('📥 Received Command from UI:', command);
      
      // Handle UI commands (e.g., arming motor, toggling sonar)
      if (command.action === 'TOGGLE_SONAR') {
        auvState.sonarActive = !auvState.sonarActive;
      }
      if (command.action === 'EMERGENCY_SURFACE') {
        auvState.missionStatus = "EMERGENCY_SURFACING";
        auvState.depth = 0.0;
      }
    } catch (e) {
      console.error('Invalid JSON command received');
    }
  });

  ws.on('close', () => {
    console.log('🔴 Frontend Dashboard Disconnected');
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 AUV Mock Backend Server running on http://localhost:${PORT}`);
});

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Arena Dimensions (meters)
WIDTH = 24.0
HEIGHT = 16.0

# Initialize Matplotlib Figure
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor('#0a0a0a')
ax.set_facecolor('#050b14')

ax.set_xlim(0, WIDTH)
ax.set_ylim(0, HEIGHT)
ax.set_title("SIH AUV Real-Time SLAM & Boustrophedon Sweep Simulation", color='#deff9a', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel("X Position (meters)", color='#ffffff')
ax.set_ylabel("Y Position (meters)", color='#ffffff')
ax.tick_params(colors='#ffffff')

# Grid lines styling
ax.grid(True, color='#1f3a4d', linestyle='--', linewidth=0.5)

# Obstacles (Boulders with P > 0.90 hazard rating)
obstacles = np.array([
    [6.0, 10.0, 1.5],
    [12.0, 12.0, 1.2],
    [16.0, 6.0, 1.8],
    [10.0, 3.0, 1.4]
])

for obs in obstacles:
    circle = plt.Circle((obs[0], obs[1]), obs[2], color='#ff5f5f', alpha=0.6, ec='#ff2222', lw=2)
    ax.add_patch(circle)
    ax.text(obs[0] - 0.6, obs[1], "P > 0.90", color='#ffffff', fontsize=8, fontweight='bold')

# Generate Boustrophedon (Lawnmower) Waypoints
waypoints = []
y_steps = np.arange(2.0, HEIGHT - 1.0, 2.0)
for i, y in enumerate(y_steps):
    if i % 2 == 0:
        waypoints.append((2.0, y))
        waypoints.append((WIDTH - 2.0, y))
    else:
        waypoints.append((WIDTH - 2.0, y))
        waypoints.append((2.0, y))

waypoints = np.array(waypoints)

# Plot Planned Path
ax.plot(waypoints[:, 0], waypoints[:, 1], color='#00ffcc', linestyle=':', alpha=0.5, label="Planned Sweep Path")

# AUV Position & Trail Line
auv_trail_x, auv_trail_y = [], []
trail_line, = ax.plot([], [], color='#00ffcc', lw=2.5, label="AUV Trajectory")
auv_marker, = ax.plot([], [], marker='>', color='#ffaa00', markersize=12, label="AUV Position")
vector_arrow = None

# Telemetry Text Display Box
text_box = ax.text(0.02, 0.92, '', transform=ax.transAxes, color='#deff9a', fontsize=10, 
                   bbox=dict(boxstyle='round,pad=0.5', facecolor='#000000', alpha=0.8, edgecolor='#00ffcc'))

# Simulation State Variables
current_wp_idx = 0
auv_pos = np.array([waypoints[0][0], waypoints[0][1]])

def init():
    trail_line.set_data([], [])
    auv_marker.set_data([], [])
    text_box.set_text('')
    return trail_line, auv_marker, text_box

def update(frame):
    global current_wp_idx, auv_pos, vector_arrow

    if current_wp_idx < len(waypoints):
        target = waypoints[current_wp_idx]
        direction = target - auv_pos
        dist = np.linalg.norm(direction)

        if dist < 0.2:
            current_wp_idx = (current_wp_idx + 1) % len(waypoints)
        else:
            # Move toward waypoint
            direction = direction / dist
            
            # Artificial Potential Field (APF) obstacle repulsion check
            repulsion = np.array([0.0, 0.0])
            for obs in obstacles:
                obs_pos = obs[:2]
                obs_radius = obs[2]
                to_obs = auv_pos - obs_pos
                d_obs = np.linalg.norm(to_obs)
                if d_obs < obs_radius + 3.0: # Influence radius
                    repulsion += (to_obs / (d_obs ** 2)) * 2.0

            # Combined Steering Vector = Attraction + Repulsion
            movement_vector = (direction * 0.1) + repulsion
            auv_pos += movement_vector

    auv_trail_x.append(auv_pos[0])
    auv_trail_y.append(auv_pos[1])

    trail_line.set_data(auv_trail_x, auv_trail_y)
    auv_marker.set_data([auv_pos[0]], [auv_pos[1]])

    # Update Telemetry Stats
    depth_val = round(12.4 + np.sin(frame * 0.1) * 0.5, 2)
    snr_val = round(24.5 - (frame % 5) * 0.2, 1)
    text_box.set_text(f"DEPTH: {depth_val}m | SONAR: 200kHz PZT | SNR: {snr_val} dB\nSTATUS: Active Sweeping (Boustrophedon)")

    return trail_line, auv_marker, text_box

# Run Animation (Save as MP4 or record live screen)
ani = animation.FuncAnimation(fig, update, frames=300, init_func=init, interval=50, blit=False)

plt.legend(loc='upper right', facecolor='#000000', edgecolor='#1f3a4d', labelcolor='#ffffff')
plt.show()
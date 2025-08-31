# Zombie Arena Game

A fast-paced FPS zombie survival game built with TypeScript and Babylon.js. Fight through endless waves of zombies with responsive FPS controls and combo-based scoring.

## 🎮 Game Features

- **FPS Movement**: WASD movement with jump (Space) and sprint (Shift)
- **Wave System**: Progressively harder waves with more zombies
- **Combo System**: Chain kills for score multipliers
- **Soul Collection**: Earn currency from defeated zombies
- **Arena Combat**: Fight in an enclosed arena with cover objects

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (preferred) or npm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Controls
- **WASD** - Move
- **Mouse** - Look around
- **Click** - Shoot
- **Space** - Jump
- **Shift** - Sprint
- **Click canvas** - Lock pointer for FPS controls

## 📁 Project Structure

```
src/
├── main.ts                 # Entry point - initializes game and pointer lock
├── game/
│   └── Game.ts            # Main game orchestrator
│                          # - Manages game loop
│                          # - Coordinates all systems
│                          # - Handles shooting mechanics
│
├── entities/              # Game objects
│   ├── Player.ts          # Player controller
│   │                      # - FPS camera setup
│   │                      # - Movement physics (gravity, jumping)
│   │                      # - Input handling
│   │                      # - Shooting/hit detection
│   │                      # - Health and combo tracking
│   │
│   └── Zombie.ts          # Zombie entity
│                          # - AI movement toward player
│                          # - Health system
│                          # - Death effects
│                          # - Damage feedback
│
├── world/
│   └── Arena.ts           # Level/environment setup
│                          # - Ground and walls creation
│                          # - Cover object placement
│                          # - Lighting configuration
│                          # - Fog effects
│
├── managers/
│   └── WaveManager.ts     # Wave spawning system
│                          # - Spawn timing
│                          # - Difficulty scaling
│                          # - Zombie lifecycle management
│                          # - Wave progression
│
├── ui/
│   └── HUD.ts             # UI updates
│                          # - Health display
│                          # - Soul counter
│                          # - Wave indicator
│                          # - Combo multiplier
│
└── utils/
    └── constants.ts       # Game configuration
                          # - All tweakable values
                          # - Balance settings
                          # - Physics constants
```

## 🔧 Architecture Overview

### Core Systems

#### 1. **Game Loop** (`Game.ts`)
The main orchestrator that:
- Initializes all subsystems
- Runs the update loop at 60 FPS
- Handles collision detection between zombies and player
- Manages game over state

#### 2. **Player System** (`Player.ts`)
- **Camera**: UniversalCamera with custom FOV (1.2 radians)
- **Physics**: Custom gravity system with ground detection
- **Collision**: Invisible collision box that follows camera
- **Movement**: Velocity-based movement with sprint modifier

#### 3. **Wave System** (`WaveManager.ts`)
- Spawns zombies at arena edges
- Increases count by 30% each wave
- Staggers spawns by 500ms
- Tracks kills for progression

#### 4. **Combat System**
- **Damage**: 34 damage per shot (3-hit kill)
- **Range**: 100 units raycast
- **Knockback**: 5 units on hit
- **Combo**: 2-second window for chaining

## 🎯 Key Configuration Values

Located in `src/utils/constants.ts`:

```typescript
PLAYER: {
  INITIAL_HEALTH: 100,    // Starting health
  HEIGHT: 1.8,            // Camera height
  MOVE_SPEED: 8,          // Units per second
  SPRINT_MULTIPLIER: 1.5, // Sprint speed boost
  JUMP_SPEED: 10,         // Jump velocity
  GRAVITY: -30,           // Gravity force
}

ZOMBIE: {
  HEALTH: 100,            // Zombie health
  SPEED: 2,               // Movement speed
  DAMAGE: 10,             // Damage per hit
  ATTACK_RANGE: 2,        // Melee range
}

WEAPON: {
  DAMAGE: 34,             // Damage per shot
  RANGE: 100,             // Raycast distance
}
```

## 🔨 Common Extensions

### Adding New Weapon Types
1. Create `src/entities/weapons/` directory
2. Define weapon interface with damage, fire rate, ammo
3. Modify `Player.ts` to support weapon switching
4. Update shooting logic for different behaviors

### Adding Zombie Variants
1. Extend `Zombie.ts` base class
2. Override speed, health, or behavior
3. Add to `WaveManager.ts` spawn logic
4. Consider different materials/sizes

### Adding Powerups
1. Create `src/entities/Powerup.ts`
2. Add collision detection in `Game.ts`
3. Implement effects (health, speed boost, damage)
4. Add spawn system to `WaveManager.ts`

### Improving AI
1. Add pathfinding around obstacles
2. Implement different zombie behaviors (fast, tank, ranged)
3. Add group coordination for surrounding player

### Adding Multiplayer
1. Integrate Socket.io or WebRTC
2. Sync player positions and zombies
3. Add lobby system
4. Handle authoritative server logic

## 🐛 Debugging Tips

### Performance
- Check zombie count with `waveManager.zombies.length`
- Monitor FPS with Babylon.js inspector: `scene.debugLayer.show()`
- Profile with Chrome DevTools Performance tab

### Movement Issues
- Player collision box: Set `playerMesh.isVisible = true` in `Player.ts`
- Ground detection: Log `isGrounded` state
- Velocity values: Log `velocity.y` for jump debugging

### Combat
- Visualize rays: Use `BABYLON.RayHelper`
- Check hit detection: Log `hit.pickedMesh?.name`
- Damage values: Add console logs in `takeDamage()`

## 📦 Dependencies

- **babylonjs**: 3D engine for rendering and physics
- **typescript**: Type safety and better IDE support
- **vite**: Fast build tool and dev server

## 🎮 Next Steps

1. **Visual Polish**
   - Add zombie models instead of boxes
   - Implement weapon models
   - Add particle effects for impacts
   - Create animated health/soul pickups

2. **Audio**
   - Add shooting sounds
   - Zombie growls and death sounds
   - Background music
   - Footstep sounds

3. **Gameplay**
   - Add weapon variety (shotgun, rifle, etc.)
   - Implement ammo system
   - Create special zombie types
   - Add boss waves

4. **Progression**
   - Save high scores
   - Unlock system for weapons
   - Player upgrades with souls
   - Achievement system

## 📄 License

MIT
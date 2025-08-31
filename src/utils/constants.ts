import * as BABYLON from "babylonjs";

export const GAME_CONFIG = {
  PLAYER: {
    INITIAL_HEALTH: 100,
    HEIGHT: 1.8,
    MOVE_SPEED: 8,
    SPRINT_MULTIPLIER: 1.5,
    JUMP_SPEED: 10,
    GRAVITY: -30,
  },
  
  ZOMBIE: {
    HEALTH: 100,
    SPEED: 2,
    DAMAGE: 10,
    ATTACK_RANGE: 2,
    KNOCKBACK_FORCE: 5,
  },
  
  WEAPON: {
    DAMAGE: 34, // 3-shot kill
    RANGE: 100,
  },
  
  ARENA: {
    SIZE: 60,
    WALL_HEIGHT: 10,
    COVER_COUNT: 8,
  },
  
  WAVE: {
    INITIAL_ZOMBIES: 10,
    MULTIPLIER: 1.3,
    SPAWN_DELAY: 500,
  },
  
  COMBO: {
    TIMEOUT: 2,
    SOUL_MULTIPLIER: 10,
  },
  
  FOG: {
    START: 20,
    END: 50,
    COLOR: new BABYLON.Color3(0.02, 0.02, 0.05),
    DAMAGE_COLOR: new BABYLON.Color3(0.5, 0, 0),
  },
};
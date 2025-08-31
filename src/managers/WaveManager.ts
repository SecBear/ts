import * as BABYLON from "babylonjs";
import { Zombie } from "../entities/Zombie";
import { GAME_CONFIG } from "../utils/constants";

export class WaveManager {
  zombies: Zombie[] = [];
  private wave = 1;
  private zombiesKilled = 0;
  private zombiesPerWave = GAME_CONFIG.WAVE.INITIAL_ZOMBIES;
  
  private scene: BABYLON.Scene;
  private target: BABYLON.Camera;

  constructor(
    scene: BABYLON.Scene,
    target: BABYLON.Camera,
  ) {
    this.scene = scene;
    this.target = target;
  }

  startWave() {
    console.log(`Starting wave ${this.wave}`);

    for (let i = 0; i < this.zombiesPerWave; i++) {
      setTimeout(() => {
        this.spawnZombie();
      }, i * GAME_CONFIG.WAVE.SPAWN_DELAY);
    }

    this.zombiesPerWave = Math.floor(this.zombiesPerWave * GAME_CONFIG.WAVE.MULTIPLIER);
  }

  private spawnZombie() {
    const zombie = new Zombie(this.scene, this.target);

    // Spawn at edge of arena
    const angle = Math.random() * Math.PI * 2;
    zombie.mesh.position = new BABYLON.Vector3(
      Math.cos(angle) * 25,
      1,
      Math.sin(angle) * 25,
    );

    this.zombies.push(zombie);
  }

  update(deltaTime: number): Zombie[] {
    const killedZombies: Zombie[] = [];

    this.zombies = this.zombies.filter((zombie) => {
      if (zombie.isDead) {
        killedZombies.push(zombie);
        this.zombiesKilled++;
        return false;
      }
      zombie.update(deltaTime);
      return true;
    });

    // Check wave complete
    if (this.zombies.length === 0 && this.zombiesKilled >= this.wave * GAME_CONFIG.WAVE.INITIAL_ZOMBIES) {
      this.wave++;
      this.startWave();
    }

    return killedZombies;
  }

  getWave(): number {
    return this.wave;
  }
}
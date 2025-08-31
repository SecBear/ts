import * as BABYLON from "babylonjs";
import { Player } from "../entities/Player";
import { Arena } from "../world/Arena";
import { WaveManager } from "../managers/WaveManager";
import { HUD } from "../ui/HUD";
import { GAME_CONFIG } from "../utils/constants";

export class Game {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private player!: Player;
  private arena!: Arena;
  private waveManager!: WaveManager;
  private hud!: HUD;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);

    this.setupGame();
    this.startGameLoop();
  }

  private setupGame() {
    // Create player
    this.player = new Player(this.scene, this.engine);

    // Create arena
    this.arena = new Arena(this.scene);
    this.arena.create();

    // Create wave manager
    this.waveManager = new WaveManager(this.scene, this.player.camera);
    this.waveManager.startWave();

    // Create HUD
    this.hud = new HUD();

    // Setup shooting
    this.setupShooting();
  }

  private setupShooting() {
    let shootingInterval: any = null;
    
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        // Start automatic fire
        this.player.startShooting();
        
        // Fire immediately
        this.handleShot();
        
        // Continue firing while held
        shootingInterval = setInterval(() => {
          this.handleShot();
        }, 100); // 600 RPM = 10 shots per second = 100ms interval
      } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
        // Stop automatic fire
        this.player.stopShooting();
        
        if (shootingInterval) {
          clearInterval(shootingInterval);
          shootingInterval = null;
        }
      }
    });
  }
  
  private handleShot() {
    const hit = this.player.shoot();
    
    if (hit && hit.pickedMesh) {
      // Find zombie and damage it
      const zombie = this.waveManager.zombies.find((z) => z.mesh === hit.pickedMesh);
      if (zombie) {
        zombie.takeDamage(25); // Tommy gun damage

        // Knockback
        const ray = this.player.camera.getForwardRay(1);
        const knockback = ray.direction.scale(2); // Reduced knockback for tommy gun
        zombie.mesh.position.addInPlace(knockback);
      }
    }
  }

  private startGameLoop() {
    // Main game loop
    this.scene.registerBeforeRender(() => {
      const deltaTime = this.engine.getDeltaTime() / 1000;

      // Update player
      this.player.update(deltaTime);

      // Update zombies and check for kills
      const killedZombies = this.waveManager.update(deltaTime);
      
      // Handle killed zombies
      killedZombies.forEach((zombie) => {
        this.onZombieKilled(zombie);
      });

      // Check zombie attacks
      this.waveManager.zombies.forEach((zombie) => {
        const distance = BABYLON.Vector3.Distance(
          zombie.mesh.position,
          this.player.camera.position,
        );

        if (distance < GAME_CONFIG.ZOMBIE.ATTACK_RANGE) {
          this.player.takeDamage(GAME_CONFIG.ZOMBIE.DAMAGE);
          
          // Knockback zombie
          zombie.mesh.position = zombie.mesh.position.add(
            zombie.mesh.position
              .subtract(this.player.camera.position)
              .normalize()
              .scale(2),
          );
        }
      });

      // Check game over
      if (this.player.health <= 0) {
        this.gameOver();
      }

      // Update UI
      const weapon = this.player.getWeapon();
      this.hud.update({
        health: this.player.health,
        souls: this.player.souls,
        wave: this.waveManager.getWave(),
        combo: this.player.combo,
        ammo: weapon.getAmmo(),
        maxAmmo: weapon.getClipSize(),
        isReloading: weapon.isReloadingNow(),
      });
    });

    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // Handle resize
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private onZombieKilled(zombie: any) {
    this.player.souls += GAME_CONFIG.COMBO.SOUL_MULTIPLIER * Math.max(1, this.player.combo);

    // Spawn soul pickup effect
    const soul = BABYLON.MeshBuilder.CreateSphere(
      "soul",
      { diameter: 0.5 },
      this.scene,
    );
    soul.position = zombie.mesh.position.clone();
    soul.material = new BABYLON.StandardMaterial("soulMat", this.scene);
    (soul.material as BABYLON.StandardMaterial).emissiveColor =
      new BABYLON.Color3(0, 1, 1);

    // Float up and fade
    let time = 0;
    const soulAnimation = () => {
      time += 0.016;
      soul.position.y += 0.02;
      soul.material!.alpha = 1 - time;

      if (time > 1) {
        soul.dispose();
        this.scene.unregisterBeforeRender(soulAnimation);
      }
    };
    this.scene.registerBeforeRender(soulAnimation);
  }

  private gameOver() {
    alert(`Game Over! Wave: ${this.waveManager.getWave()}, Souls: ${this.player.souls}`);
    location.reload();
  }
}
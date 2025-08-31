import * as BABYLON from "babylonjs";
import { GAME_CONFIG } from "../utils/constants";
import { TommyGun } from "./weapons/TommyGun";

export class Player {
  camera!: BABYLON.UniversalCamera;
  private playerMesh!: BABYLON.Mesh;
  private velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private isGrounded = false;
  private weapon!: TommyGun;

  health = GAME_CONFIG.PLAYER.INITIAL_HEALTH;
  souls = 0;
  combo = 0;
  comboTimer = 0;
  
  private scene: BABYLON.Scene;
  private engine: BABYLON.Engine;

  constructor(
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
  ) {
    this.scene = scene;
    this.engine = engine;
    this.setupCamera();
    this.setupControls();
    
    // Create weapon AFTER camera is setup
    this.weapon = new TommyGun(this.scene, this.camera);
  }

  private setupCamera() {
    this.camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, GAME_CONFIG.PLAYER.HEIGHT, -10),
      this.scene,
    );
    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.engine.getRenderingCanvas(), true);

    // Movement settings
    this.camera.speed = 0; // We handle movement manually
    this.camera.angularSensibility = 300;
    this.camera.inertia = 0;
    
    // Increase FOV for better peripheral vision
    this.camera.fov = 1.2; // ~69 degrees (default is ~0.8 or 45 degrees)

    // Create invisible player collision box
    this.playerMesh = BABYLON.MeshBuilder.CreateBox(
      "player",
      { width: 0.8, height: 1.8, depth: 0.8 },
      this.scene,
    );
    this.playerMesh.position = this.camera.position.clone();
    this.playerMesh.isVisible = false;
    this.playerMesh.checkCollisions = true;
    this.playerMesh.ellipsoid = new BABYLON.Vector3(0.4, 0.9, 0.4);

    // Enable collisions
    this.scene.collisionsEnabled = true;
    this.camera.checkCollisions = false;
    this.scene.gravity = new BABYLON.Vector3(0, GAME_CONFIG.PLAYER.GRAVITY, 0);
  }

  private setupControls() {
    const canvas = this.engine.getRenderingCanvas()!;
    const inputMap: { [key: string]: boolean } = {};

    canvas.addEventListener("keydown", (e) => {
      inputMap[e.key.toLowerCase()] = true;

      // Jump on space
      if (e.key === " " && this.isGrounded) {
        this.velocity.y = GAME_CONFIG.PLAYER.JUMP_SPEED;
        this.isGrounded = false;
      }
      
      // Reload on R
      if (e.key.toLowerCase() === "r") {
        this.weapon.reload();
      }
    });

    canvas.addEventListener("keyup", (e) => {
      inputMap[e.key.toLowerCase()] = false;
    });

    // Handle movement in render loop
    this.scene.registerBeforeRender(() => {
      const deltaTime = this.engine.getDeltaTime() / 1000;

      // Get camera direction vectors
      const forward = this.camera.getForwardRay(1).direction;
      forward.y = 0;
      forward.normalize();

      const right = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up());
      right.normalize();

      // Calculate movement
      const moveVector = BABYLON.Vector3.Zero();

      if (inputMap["w"]) moveVector.addInPlace(forward);
      if (inputMap["s"]) moveVector.subtractInPlace(forward);
      if (inputMap["d"]) moveVector.subtractInPlace(right);
      if (inputMap["a"]) moveVector.addInPlace(right);

      if (moveVector.length() > 0) {
        moveVector.normalize();
        const speed = inputMap["shift"]
          ? GAME_CONFIG.PLAYER.MOVE_SPEED * GAME_CONFIG.PLAYER.SPRINT_MULTIPLIER
          : GAME_CONFIG.PLAYER.MOVE_SPEED;
        moveVector.scaleInPlace(speed * deltaTime);
      }

      // Apply gravity
      if (!this.isGrounded) {
        this.velocity.y += GAME_CONFIG.PLAYER.GRAVITY * deltaTime;
      }

      // Calculate new position
      const newPosition = this.camera.position.clone();
      newPosition.addInPlace(moveVector);
      newPosition.y += this.velocity.y * deltaTime;

      // Ground check
      const groundRay = new BABYLON.Ray(
        newPosition,
        new BABYLON.Vector3(0, -1, 0),
        1.85,
      );
      const groundHit = this.scene.pickWithRay(groundRay);

      if (groundHit && groundHit.hit && groundHit.distance < 1.85) {
        this.isGrounded = true;
        this.velocity.y = 0;
        newPosition.y = groundHit.pickedPoint!.y + GAME_CONFIG.PLAYER.HEIGHT;
      } else {
        this.isGrounded = false;
      }

      // Clamp to ground level minimum
      if (newPosition.y < GAME_CONFIG.PLAYER.HEIGHT) {
        newPosition.y = GAME_CONFIG.PLAYER.HEIGHT;
        this.isGrounded = true;
        this.velocity.y = 0;
      }

      // Update positions
      this.camera.position = newPosition;
      this.playerMesh.position = newPosition.clone();
      this.playerMesh.position.y -= 0.9; // Offset for collision box
    });
  }

  shoot(): BABYLON.PickingInfo | null {
    // Use weapon system
    if (!this.weapon.shoot()) {
      return null; // Weapon couldn't fire (reloading, etc)
    }
    
    // Add spread for tommy gun - use a COPY of the forward vector
    const spread = 0.05;
    const spreadX = (Math.random() - 0.5) * spread;
    const spreadY = (Math.random() - 0.5) * spread;
    
    const forward = this.camera.getForwardRay(1).direction.clone(); // CLONE the vector!
    forward.x += spreadX;
    forward.y += spreadY;
    forward.normalize();
    
    const ray = new BABYLON.Ray(this.camera.position, forward, 80);
    const hit = this.scene.pickWithRay(ray);

    if (hit && hit.pickedMesh && hit.pickedMesh.name === "zombie") {
      // Visual feedback
      this.showHitMarker();

      // Combo
      this.combo++;
      this.comboTimer = GAME_CONFIG.COMBO.TIMEOUT;

      return hit;
    }

    return null;
  }

  private showHitMarker() {
    const crosshair = document.getElementById("crosshair");
    if (crosshair) {
      crosshair.style.background = "#ff0000";
      crosshair.style.width = "8px";
      crosshair.style.height = "8px";

      setTimeout(() => {
        crosshair.style.background = "rgba(255,255,255,0.8)";
        crosshair.style.width = "4px";
        crosshair.style.height = "4px";
      }, 100);
    }
  }


  takeDamage(amount: number) {
    this.health -= amount;

    // Red flash
    this.scene.fogColor = GAME_CONFIG.FOG.DAMAGE_COLOR;
    setTimeout(() => {
      this.scene.fogColor = GAME_CONFIG.FOG.COLOR;
    }, 100);
  }

  update(deltaTime: number) {
    // Update combo timer
    this.comboTimer -= deltaTime;
    if (this.comboTimer <= 0) {
      this.combo = 0;
    }
    
    // Update weapon
    this.weapon.update(deltaTime);
  }
  
  startShooting() {
    this.weapon.startFiring();
  }
  
  stopShooting() {
    this.weapon.stopFiring();
  }
  
  getWeapon() {
    return this.weapon;
  }
}


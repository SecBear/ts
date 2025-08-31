import * as BABYLON from "babylonjs";
import { GAME_CONFIG } from "../utils/constants";

export class Arena {
  private scene: BABYLON.Scene;
  
  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  create() {
    this.createGround();
    this.createWalls();
    this.createCover();
    this.setupLighting();
    this.setupFog();
  }

  private createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: GAME_CONFIG.ARENA.SIZE, height: GAME_CONFIG.ARENA.SIZE },
      this.scene,
    );
    
    const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMat;
    ground.checkCollisions = true;
  }

  private createWalls() {
    const wallMat = new BABYLON.StandardMaterial("wallMat", this.scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);

    const halfSize = GAME_CONFIG.ARENA.SIZE / 2;
    const walls = [
      { width: GAME_CONFIG.ARENA.SIZE, height: GAME_CONFIG.ARENA.WALL_HEIGHT, depth: 1, x: 0, y: 5, z: halfSize },
      { width: GAME_CONFIG.ARENA.SIZE, height: GAME_CONFIG.ARENA.WALL_HEIGHT, depth: 1, x: 0, y: 5, z: -halfSize },
      { width: 1, height: GAME_CONFIG.ARENA.WALL_HEIGHT, depth: GAME_CONFIG.ARENA.SIZE, x: halfSize, y: 5, z: 0 },
      { width: 1, height: GAME_CONFIG.ARENA.WALL_HEIGHT, depth: GAME_CONFIG.ARENA.SIZE, x: -halfSize, y: 5, z: 0 },
    ];

    walls.forEach((w) => {
      const wall = BABYLON.MeshBuilder.CreateBox(
        "wall",
        { width: w.width, height: w.height, depth: w.depth },
        this.scene,
      );
      wall.position = new BABYLON.Vector3(w.x, w.y, w.z);
      wall.material = wallMat;
      wall.checkCollisions = true;
    });
  }

  private createCover() {
    for (let i = 0; i < GAME_CONFIG.ARENA.COVER_COUNT; i++) {
      const box = BABYLON.MeshBuilder.CreateBox(
        "cover",
        { width: 3, height: 2, depth: 3 },
        this.scene,
      );
      box.position = new BABYLON.Vector3(
        Math.random() * 40 - 20,
        1,
        Math.random() * 40 - 20,
      );
      box.checkCollisions = true;
    }
  }

  private setupLighting() {
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene,
    );
    light.intensity = 0.7;

    // Spooky ambient
    this.scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.2);
  }

  private setupFog() {
    this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    this.scene.fogStart = GAME_CONFIG.FOG.START;
    this.scene.fogEnd = GAME_CONFIG.FOG.END;
    this.scene.fogColor = GAME_CONFIG.FOG.COLOR;
  }
}
import * as BABYLON from "babylonjs";
import { GAME_CONFIG } from "../utils/constants";

export class Zombie {
  mesh: BABYLON.Mesh;
  health = GAME_CONFIG.ZOMBIE.HEALTH;
  isDead = false;
  speed = GAME_CONFIG.ZOMBIE.SPEED;

  private target: BABYLON.Camera;
  
  constructor(
    scene: BABYLON.Scene,
    target: BABYLON.Camera,
  ) {
    this.target = target;
    this.mesh = BABYLON.MeshBuilder.CreateBox(
      "zombie",
      { width: 1, height: 2, depth: 1 },
      scene,
    );

    const mat = new BABYLON.StandardMaterial("zombieMat", scene);
    mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    mat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.1);
    this.mesh.material = mat;
  }

  update(deltaTime: number) {
    if (this.isDead) return;

    // Look at player
    this.mesh.lookAt(this.target.position, Math.PI);

    // Move towards player
    const direction = this.target.position.subtract(this.mesh.position);
    direction.y = 0;
    direction.normalize();

    this.mesh.position.addInPlace(direction.scale(this.speed * deltaTime));

    // Bob animation
    this.mesh.position.y = 1 + Math.sin(Date.now() * 0.005) * 0.1;
  }

  takeDamage(amount: number) {
    this.health -= amount;

    // Flash red
    (this.mesh.material as BABYLON.StandardMaterial).emissiveColor =
      new BABYLON.Color3(1, 0, 0);
    setTimeout(() => {
      (this.mesh.material as BABYLON.StandardMaterial).emissiveColor =
        new BABYLON.Color3(0.1, 0.2, 0.1);
    }, 100);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.mesh.dispose();
  }
}
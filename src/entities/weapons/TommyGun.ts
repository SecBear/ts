import * as BABYLON from "babylonjs";
import { Weapon } from "./Weapon";
import type { WeaponConfig } from "./Weapon";

export class TommyGun extends Weapon {
  private rightHand!: BABYLON.Mesh;
  private leftHand!: BABYLON.Mesh;
  
  constructor(scene: BABYLON.Scene, camera: BABYLON.Camera) {
    const config: WeaponConfig = {
      name: "Tommy Gun",
      damage: 25,
      fireRate: 600, // 600 rounds per minute
      automatic: true,
      clipSize: 50,
      reloadTime: 2.5,
      spread: 0.05,
      range: 80,
      knockback: 2,
    };
    
    super(scene, config, camera);
    
    // Create hands
    this.createHands();
  }
  
  createWeaponMesh() {
    // Create cartoonish Tommy Gun
    const group = new BABYLON.Mesh("tommyGun", this.scene);
    
    // Main body (receiver)
    const body = BABYLON.MeshBuilder.CreateBox("body", {
      width: 0.15,
      height: 0.2,
      depth: 0.8,
    }, this.scene);
    body.position = new BABYLON.Vector3(0, 0, 0);
    body.parent = group;
    
    // Barrel
    const barrel = BABYLON.MeshBuilder.CreateCylinder("barrel", {
      diameter: 0.08,
      height: 0.6,
    }, this.scene);
    barrel.rotation.x = Math.PI / 2;
    barrel.position = new BABYLON.Vector3(0, 0.02, 0.55);
    barrel.parent = group;
    
    // Drum magazine (iconic tommy gun feature)
    const drum = BABYLON.MeshBuilder.CreateCylinder("drum", {
      diameter: 0.25,
      height: 0.08,
    }, this.scene);
    drum.rotation.z = Math.PI / 2;
    drum.position = new BABYLON.Vector3(0, -0.15, -0.1);
    drum.parent = group;
    
    // Wooden stock
    const stock = BABYLON.MeshBuilder.CreateBox("stock", {
      width: 0.12,
      height: 0.15,
      depth: 0.4,
    }, this.scene);
    stock.position = new BABYLON.Vector3(0, -0.05, -0.5);
    stock.parent = group;
    
    // Foregrip
    const foregrip = BABYLON.MeshBuilder.CreateCylinder("foregrip", {
      diameter: 0.05,
      height: 0.15,
    }, this.scene);
    foregrip.position = new BABYLON.Vector3(0, -0.12, 0.25);
    foregrip.parent = group;
    
    // Trigger guard
    const triggerGuard = BABYLON.MeshBuilder.CreateTorus("triggerGuard", {
      diameter: 0.08,
      thickness: 0.015,
    }, this.scene);
    triggerGuard.rotation.z = Math.PI / 2;
    triggerGuard.position = new BABYLON.Vector3(0, -0.08, -0.05);
    triggerGuard.parent = group;
    
    // Apply materials
    const gunMetal = new BABYLON.StandardMaterial("gunMetal", this.scene);
    gunMetal.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
    gunMetal.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    gunMetal.specularPower = 32;
    
    const wood = new BABYLON.StandardMaterial("wood", this.scene);
    wood.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    wood.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    body.material = gunMetal;
    barrel.material = gunMetal;
    drum.material = gunMetal;
    triggerGuard.material = gunMetal;
    stock.material = wood;
    foregrip.material = wood;
    
    // Position muzzle flash at barrel end
    if (this.muzzleFlash) {
      this.muzzleFlash.position = new BABYLON.Vector3(0, 0.02, 0.85);
    }
    
    // Scale for cartoonish look
    group.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
    
    // IMPORTANT: Disable collisions for all weapon parts
    group.checkCollisions = false;
    group.getChildMeshes().forEach(mesh => {
      mesh.checkCollisions = false;
      mesh.isPickable = false; // Don't interfere with shooting rays
    });
    
    this.mesh = group;
  }
  
  private createHands() {
    // Create cartoonish hands
    
    // Right hand (trigger hand)
    this.rightHand = this.createHand("rightHand");
    this.rightHand.parent = this.mesh;
    this.rightHand.position = new BABYLON.Vector3(0.08, -0.08, -0.1);
    this.rightHand.rotation = new BABYLON.Vector3(0, 0, -0.2);
    
    // Left hand (foregrip hand)
    this.leftHand = this.createHand("leftHand");
    this.leftHand.parent = this.mesh;
    this.leftHand.position = new BABYLON.Vector3(-0.08, -0.12, 0.25);
    this.leftHand.rotation = new BABYLON.Vector3(0, 0, 0.2);
  }
  
  private createHand(name: string): BABYLON.Mesh {
    const hand = new BABYLON.Mesh(name, this.scene);
    
    // Palm
    const palm = BABYLON.MeshBuilder.CreateBox("palm", {
      width: 0.08,
      height: 0.1,
      depth: 0.04,
    }, this.scene);
    palm.parent = hand;
    
    // Thumb
    const thumb = BABYLON.MeshBuilder.CreateCylinder("thumb", {
      diameter: 0.02,
      height: 0.06,
    }, this.scene);
    thumb.position = new BABYLON.Vector3(0.04, 0, 0);
    thumb.rotation.z = -Math.PI / 4;
    thumb.parent = hand;
    
    // Fingers
    for (let i = 0; i < 4; i++) {
      const finger = BABYLON.MeshBuilder.CreateCylinder(`finger${i}`, {
        diameter: 0.018,
        height: 0.07,
      }, this.scene);
      finger.position = new BABYLON.Vector3(-0.02 + i * 0.02, -0.055, 0);
      finger.rotation.x = -0.3; // Slight curl for gripping
      finger.parent = hand;
    }
    
    // Cartoonish skin material
    const skinMat = new BABYLON.StandardMaterial("skin", this.scene);
    skinMat.diffuseColor = new BABYLON.Color3(0.95, 0.8, 0.7);
    skinMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    // Apply material to all hand parts and disable collisions
    hand.getChildMeshes().forEach(mesh => {
      mesh.material = skinMat;
      mesh.checkCollisions = false;
      mesh.isPickable = false;
    });
    
    hand.checkCollisions = false;
    hand.isPickable = false;
    
    return hand;
  }
  
  protected updateWeaponPosition() {
    if (!this.camera) return;
    
    // Get camera direction vectors - CLONE them to avoid modifying originals
    const forward = this.camera.getForwardRay(1).direction.clone();
    const right = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up());
    const up = BABYLON.Vector3.Cross(right, forward);
    
    // Position gun at bottom-right of screen (FPS view)
    const basePosition = this.camera.position.clone();
    basePosition.addInPlace(forward.scale(0.5));
    basePosition.addInPlace(right.scale(0.25));
    basePosition.addInPlace(up.scale(-0.25));
    
    this.mesh.position = basePosition;
    
    // Rotate to match camera direction
    const lookAt = basePosition.add(forward);
    this.mesh.lookAt(lookAt, Math.PI, 0, 0);
    
    // Add slight weapon sway based on camera movement
    const time = Date.now() * 0.001;
    this.mesh.rotation.y += Math.sin(time * 2) * 0.01;
    this.mesh.rotation.x += Math.sin(time * 1.5) * 0.005;
  }
  
  protected animateRecoil() {
    // Quick punch back animation
    const originalZ = this.mesh.position.z;
    const recoilDistance = 0.08;
    
    // Kick back
    const kickBack = () => {
      this.mesh.position.z -= recoilDistance;
      this.mesh.rotation.x -= 0.05;
      
      // Barrel climb for automatic fire
      if (this.isFiring) {
        this.mesh.rotation.x -= 0.02;
      }
    };
    
    // Return to position
    const returnToPosition = () => {
      this.mesh.position.z = originalZ;
      this.mesh.rotation.x += 0.05;
      
      if (this.isFiring) {
        this.mesh.rotation.x += 0.02;
      }
    };
    
    kickBack();
    setTimeout(returnToPosition, 50);
    
    // Add hand shake
    if (this.rightHand) {
      this.rightHand.rotation.z -= 0.1;
      setTimeout(() => {
        this.rightHand.rotation.z += 0.1;
      }, 50);
    }
  }
  
  // Simplified - no shell ejection to avoid collision issues
}
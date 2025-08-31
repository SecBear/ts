import * as BABYLON from "babylonjs";

export interface WeaponConfig {
  name: string;
  damage: number;
  fireRate: number; // rounds per minute
  automatic: boolean;
  clipSize: number;
  reloadTime: number; // seconds
  spread: number; // accuracy cone
  range: number;
  knockback: number;
}

export abstract class Weapon {
  protected mesh!: BABYLON.Mesh;
  protected muzzleFlash: BABYLON.Mesh | null = null;
  protected currentAmmo: number;
  protected isReloading = false;
  protected lastShotTime = 0;
  protected isFiring = false;
  
  protected scene: BABYLON.Scene;
  protected config: WeaponConfig;
  protected camera: BABYLON.Camera;
  
  constructor(
    scene: BABYLON.Scene,
    config: WeaponConfig,
    camera: BABYLON.Camera,
  ) {
    this.scene = scene;
    this.config = config;
    this.camera = camera;
    this.currentAmmo = config.clipSize;
    this.createWeaponMesh();
    this.setupMuzzleFlash();
  }
  
  abstract createWeaponMesh(): void;
  
  protected setupMuzzleFlash() {
    // Create cartoonish muzzle flash
    this.muzzleFlash = BABYLON.MeshBuilder.CreatePlane("muzzleFlash", {
      width: 0.4,
      height: 0.4,
    }, this.scene);
    
    const flashMat = new BABYLON.StandardMaterial("flashMat", this.scene);
    flashMat.diffuseTexture = this.createFlashTexture();
    flashMat.emissiveColor = new BABYLON.Color3(1, 1, 0.5);
    flashMat.opacityTexture = flashMat.diffuseTexture;
    flashMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    
    this.muzzleFlash.material = flashMat;
    this.muzzleFlash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    this.muzzleFlash.isVisible = false;
    this.muzzleFlash.checkCollisions = false;
    this.muzzleFlash.isPickable = false;
    this.muzzleFlash.parent = this.mesh;
  }
  
  protected createFlashTexture(): BABYLON.DynamicTexture {
    const texture = new BABYLON.DynamicTexture("flashTexture", 256, this.scene);
    const ctx = texture.getContext();
    
    // Draw cartoonish star-burst muzzle flash
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, 256, 256);
    
    const centerX = 128;
    const centerY = 128;
    
    // Draw multiple star points
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Create gradient for each spike
      const gradient = ctx.createLinearGradient(0, 0, 0, -100);
      gradient.addColorStop(0, "rgba(255, 255, 200, 1)");
      gradient.addColorStop(0.5, "rgba(255, 200, 50, 0.8)");
      gradient.addColorStop(1, "rgba(255, 100, 0, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(0, -100);
      ctx.lineTo(15, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
    
    // Add bright center
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    centerGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    centerGradient.addColorStop(0.5, "rgba(255, 255, 100, 0.8)");
    centerGradient.addColorStop(1, "rgba(255, 200, 0, 0)");
    
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
    
    texture.update();
    return texture;
  }
  
  startFiring() {
    this.isFiring = true;
  }
  
  stopFiring() {
    this.isFiring = false;
  }
  
  update(_deltaTime: number) {
    // Update weapon position to follow camera
    this.updateWeaponPosition();
    
    // Handle automatic fire
    if (this.isFiring && this.config.automatic && !this.isReloading) {
      const fireInterval = 60000 / this.config.fireRate; // Convert RPM to milliseconds
      const currentTime = Date.now();
      
      if (currentTime - this.lastShotTime >= fireInterval) {
        this.shoot();
      }
    }
  }
  
  protected updateWeaponPosition() {
    // Override in subclass for specific positioning
  }
  
  shoot(): boolean {
    if (this.isReloading || this.currentAmmo <= 0) {
      if (this.currentAmmo <= 0 && !this.isReloading) {
        this.reload();
      }
      return false;
    }
    
    const currentTime = Date.now();
    const fireInterval = 60000 / this.config.fireRate;
    
    if (currentTime - this.lastShotTime < fireInterval) {
      return false;
    }
    
    this.lastShotTime = currentTime;
    this.currentAmmo--;
    
    // Show muzzle flash
    this.showMuzzleFlash();
    
    // Add weapon recoil animation
    this.animateRecoil();
    
    return true;
  }
  
  protected showMuzzleFlash() {
    if (!this.muzzleFlash) return;
    
    this.muzzleFlash.isVisible = true;
    
    // Random rotation for variety
    this.muzzleFlash.rotation.z = Math.random() * Math.PI * 2;
    
    // Scale animation
    this.muzzleFlash.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
    
    // Hide after brief time
    setTimeout(() => {
      if (this.muzzleFlash) {
        this.muzzleFlash.isVisible = false;
      }
    }, 50);
  }
  
  protected animateRecoil() {
    // Override in subclass for specific recoil animation
  }
  
  reload() {
    if (this.isReloading) return;
    
    this.isReloading = true;
    console.log(`Reloading ${this.config.name}...`);
    
    setTimeout(() => {
      this.currentAmmo = this.config.clipSize;
      this.isReloading = false;
      console.log(`${this.config.name} reloaded!`);
    }, this.config.reloadTime * 1000);
  }
  
  getAmmo() {
    return this.currentAmmo;
  }
  
  getClipSize() {
    return this.config.clipSize;
  }
  
  isReloadingNow() {
    return this.isReloading;
  }
  
  dispose() {
    this.mesh.dispose();
    if (this.muzzleFlash) {
      this.muzzleFlash.dispose();
    }
  }
}
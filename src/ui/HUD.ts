export class HUD {
  private healthElement: HTMLElement;
  private soulsElement: HTMLElement;
  private waveElement: HTMLElement;
  private comboElement: HTMLElement;
  private ammoElement: HTMLElement;
  private maxAmmoElement: HTMLElement;
  private reloadingElement: HTMLElement;

  constructor() {
    this.healthElement = document.getElementById("health")!;
    this.soulsElement = document.getElementById("souls")!;
    this.waveElement = document.getElementById("wave")!;
    this.comboElement = document.getElementById("combo")!;
    this.ammoElement = document.getElementById("ammo")!;
    this.maxAmmoElement = document.getElementById("maxAmmo")!;
    this.reloadingElement = document.getElementById("reloading")!;
  }

  update(stats: {
    health: number;
    souls: number;
    wave: number;
    combo: number;
    ammo: number;
    maxAmmo: number;
    isReloading: boolean;
  }) {
    this.healthElement.textContent = stats.health.toString();
    this.soulsElement.textContent = stats.souls.toString();
    this.waveElement.textContent = stats.wave.toString();
    this.comboElement.textContent = stats.combo > 0 ? `x${stats.combo}` : "";
    this.ammoElement.textContent = stats.ammo.toString();
    this.maxAmmoElement.textContent = stats.maxAmmo.toString();
    
    // Show reloading indicator
    this.reloadingElement.style.display = stats.isReloading ? "inline" : "none";
    
    // Change ammo color when low
    if (stats.ammo <= 10) {
      this.ammoElement.style.color = "#ff0000";
    } else if (stats.ammo <= 20) {
      this.ammoElement.style.color = "#ffaa00";
    } else {
      this.ammoElement.style.color = "";
    }
  }
}
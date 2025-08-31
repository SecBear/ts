import { Game } from "./game/Game";

// Initialize game
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  new Game(canvas);

  // Lock pointer for FPS controls
  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });
});
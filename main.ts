import { GameManager } from "./modules/GameManager";
import { MenuManager } from "./modules/MenuManager";

// Initialize game manager
const game = new GameManager();
game.initialize();

// Initialize menu manager
const menuManager = new MenuManager();

// When game starts from menu
menuManager.onGameStart = () => {
    game.start();
};

// Start animation loop (for menu background and game rendering)
game.startAnimationLoop();

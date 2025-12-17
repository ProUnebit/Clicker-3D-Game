/**
 * Menu manager
 * Handles start menu and game state transitions
 */
export class MenuManager {
    private startMenu: HTMLElement | null;
    private gameHud: HTMLElement | null;
    private btnStart: HTMLElement | null;
    private btnExit: HTMLElement | null;

    private gameStarted: boolean;
    public onGameStart: (() => void) | null; // Callback when game starts

    constructor() {
        this.startMenu = document.getElementById("start-menu");
        this.gameHud = document.getElementById("game-hud");
        this.btnStart = document.getElementById("btn-start");
        this.btnExit = document.getElementById("btn-exit");

        this.gameStarted = false;
        this.onGameStart = null;

        this.setupEventListeners();
    }

    /**
     * Setup button event listeners
     */
    private setupEventListeners(): void {
        // Start game button
        if (this.btnStart) {
            this.btnStart.addEventListener("click", () => {
                this.startGame();
            });
        }

        // Exit button
        if (this.btnExit) {
            this.btnExit.addEventListener("click", () => {
                this.exitGame();
            });
        }

        // Optional: Start game on Enter key
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter" && !this.gameStarted) {
                this.startGame();
            }
        });
    }

    /**
     * Start the game
     */
    private startGame(): void {
        if (this.gameStarted) return;

        this.gameStarted = true;

        // Hide start menu
        if (this.startMenu) {
            this.startMenu.classList.add("hidden");
        }

        // Show game HUD
        if (this.gameHud) {
            setTimeout(() => {
                this.gameHud?.classList.add("visible");
            }, 500); // Delay to match menu fade-out
        }

        // Trigger game start callback
        if (this.onGameStart) {
            this.onGameStart();
        }
    }

    /**
     * Exit game (close window/tab)
     */
    private exitGame(): void {
        // Try to close the window
        window.close();

        // If window.close() doesn't work (browser security),
        // show a message
        setTimeout(() => {
            if (!window.closed) {
                alert(
                    "Используйте Ctrl+W (Cmd+W на Mac) чтобы закрыть вкладку"
                );
            }
        }, 100);
    }

    /**
     * Check if game has started
     * @returns True if game is started
     */
    isGameStarted(): boolean {
        return this.gameStarted;
    }

    /**
     * Show menu again (for restart functionality)
     */
    showMenu(): void {
        this.gameStarted = false;

        if (this.startMenu) {
            this.startMenu.classList.remove("hidden");
        }

        if (this.gameHud) {
            this.gameHud.classList.remove("visible");
        }
    }
}

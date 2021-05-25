import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Button from "../Wolfie2D/Nodes/UIElements/Button";

export default class GameOver extends Scene {
    private retry_constr: new (...args: any) => Scene;
    private game_over: Layer;
    private game_over_background: Layer;

    initScene(init: Record<string, any>): void {
        console.log(init.retry);
        this.retry_constr = init.retry;
    }

    loadScene() {
        this.load.spritesheet("gameOverImage", "game_assets/spritesheets/gameover_bg.json");
    }

    startScene() {
        const center = this.viewport.getCenter();

        // The splash screen
        this.game_over = this.addUILayer("gameOver");

        // Add a background to the scene
        this.game_over_background = this.addParallaxLayer("game_over_background", new Vec2(0.5, 1), -1);
        let go = this.add.animatedSprite("gameOverImage", "game_over_background");
        go.position.set(go.size.x/2, go.size.y/2);
        go.animation.play("IDLE");
        // Add buttons
        const retry = <Button>this.add.uiElement(UIElementType.BUTTON, "gameOver", {position: new Vec2(center.x, center.y), text: "Retry"});
        retry.size.set(200, 70);
        retry.font = "HellText";
        retry.textColor = Color.BLACK;
        retry.fontSize = 64;
        retry.borderWidth = 2;
        retry.borderColor = Color.TRANSPARENT;
        retry.backgroundColor = Color.TRANSPARENT;
        retry.onClickEventId = "retry";
        retry.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        retry.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };


        const exit = <Button>this.add.uiElement(UIElementType.BUTTON, "gameOver", {position: new Vec2(center.x, center.y + 150), text: "Exit to Main Menu"});
        exit.size.set(540, 70);
        exit.font = "HellText";
        exit.textColor = Color.BLACK;
        exit.fontSize = 64;
        exit.borderWidth = 2;
        exit.borderColor = Color.TRANSPARENT;
        exit.backgroundColor = Color.TRANSPARENT;
        exit.onClickEventId = "confirm";
        exit.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        exit.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };
        
        // Subscribe to the button events
        this.receiver.subscribe("confirm");
        this.receiver.subscribe("retry");
    }

    updateScene() {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            if(event.type === "confirm") {
                this.game_over_background.disable();
                this.sceneManager.changeToScene(MainMenu, {});
            }
            if (event.type === "retry") {
                console.log(this.retry_constr);
                this.sceneManager.changeToScene(this.retry_constr, {
                    health: 5,
                    coins: 0,
                    damage: 1
                }, {
                    physics: {
                        groupNames: ["wall", "player", "enemy", "coin"],
                        collisions:
                        [
                            [0, 1, 1, 1],
                            [1, 0, 0, 0],
                            [1, 0, 0, 0],
                            [1, 0, 0, 0]
                        ]
                    }
                })
            }
        }
    }
}


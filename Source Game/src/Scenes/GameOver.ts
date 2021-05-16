import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";

export default class GameOver extends Scene {
    private game_over: Layer;
    private game_over_background: Layer;

    loadScene() {
        this.load.spritesheet("gameOverImage", "game_assets/images/gameover_bg.json");
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
        // Add transparent button
        const confirm = this.add.uiElement(UIElementType.BUTTON, "gameOver", {position: new Vec2(center.x, center.y), text: ""});
        confirm.size.set(1280, 720);
        confirm.borderWidth = 0;
        confirm.borderColor = Color.TRANSPARENT;
        confirm.backgroundColor = Color.TRANSPARENT;
        confirm.onClickEventId = "confirm";
        
        // Subscribe to the button events
        this.receiver.subscribe("confirm");
    }

    updateScene() {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            if(event.type === "confirm") {
                this.game_over_background.disable();
                this.sceneManager.changeToScene(MainMenu, {});
            }
        }
    }
}


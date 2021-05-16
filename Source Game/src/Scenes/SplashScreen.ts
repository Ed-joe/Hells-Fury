import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";

export default class SplashScreen extends Scene {
    private splash: Layer;
    private splash_background: Layer;

    loadScene() {
        this.load.spritesheet("splashImage", "game_assets/spritesheets/general_background.json");
    }

    startScene() {
        const center = this.viewport.getCenter();

        // The splash screen
        this.splash = this.addUILayer("splashScreen");

        // Add a background to the scene
        this.splash_background = this.addParallaxLayer("splash_background", new Vec2(0.5, 1), -1);
        let sb = this.add.animatedSprite("splashImage", "splash_background");
        sb.position.set(sb.size.x/2, sb.size.y/2);
        sb.animation.play("IDLE", true);

        // Add transparent button
        const confirm = this.add.uiElement(UIElementType.BUTTON, "splashScreen", {position: new Vec2(center.x, center.y), text: ""});
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
                this.splash_background.disable();
                this.sceneManager.changeToScene(MainMenu, {});
            }
        }
    }
}


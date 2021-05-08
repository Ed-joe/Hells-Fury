import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import GluttonyLevel from "./GluttonyLevel";
import LustLevel from "./LustLevel";
import Button from "../Wolfie2D/Nodes/UIElements/Button"
import { GameEventType } from "../Wolfie2D/Events/GameEventType";

export default class MainMenu extends Scene {
    private main_menu: Layer;
    private level_select: Layer;
    private help: Layer;
    private controls: Layer;

    loadScene() {
        this.load.image("mainMenuImage", "game_assets/images/general_background.png");
        this.load.image("levelSelectImage", "game_assets/images/level_select_background.png");
        this.load.image("helpImage", "game_assets/images/help_background.png");
        this.load.image("controlsImage", "game_assets/images/controls_background.png");
        this.load.audio("main_menu_music", "game_assets/sounds/music/main_menu.mp3")
    }

    startScene() {
        const center = this.viewport.getCenter();

        // subscribe to button events
        this.receiver.subscribe("newGame");
        this.receiver.subscribe("levelSelect");
        this.receiver.subscribe("help");
        this.receiver.subscribe("controls");
        this.receiver.subscribe("mainMenu");
        this.receiver.subscribe("levelGluttony");
        this.receiver.subscribe("levelLust");
        this.receiver.subscribe("levelWrath");
        this.receiver.subscribe("levelGreed");
        this.receiver.subscribe("levelSloth");
        this.receiver.subscribe("levelEnvy");
        this.receiver.subscribe("levelPride");

        /* ################ MAIN MENU ################ */
        // create main menu layer
        this.main_menu = this.addUILayer("mainMenu");

        // add main menu background image
        let mmb = this.add.sprite("mainMenuImage", "mainMenu");
        mmb.position.set(mmb.size.x/2, mmb.size.y/2);

        // Add new game button, and give it an event to emit on press
        const new_game_text = <Button>this.add.uiElement(UIElementType.LABEL, "mainMenu", {position: new Vec2(center.x - 14, center.y - 170), text: "New Game"});
        new_game_text.font = "HellText";
        new_game_text.textColor = Color.WHITE;
        new_game_text.fontSize = 66;
        new_game_text.size.set(330, 70);

        const new_game_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 14, center.y - 170), text: "New Game"});
        new_game_button.font = "HellText";
        new_game_button.textColor = Color.BLACK;
        new_game_button.fontSize = 64;
        new_game_button.size.set(330, 70);
        new_game_button.borderWidth = 2;
        new_game_button.borderColor = Color.TRANSPARENT;
        new_game_button.backgroundColor = Color.TRANSPARENT;
        new_game_button.onClickEventId = "newGame";

        // Add level select button
        const level_text = <Button>this.add.uiElement(UIElementType.LABEL, "mainMenu", {position: new Vec2(center.x - 13, center.y - 60), text: "Level Select"});
        level_text.font = "HellText";
        level_text.textColor = Color.WHITE;
        level_text.fontSize = 66;
        level_text.size.set(420, 70);

        const level_select_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 13, center.y - 60), text: "Level Select"});
        level_select_button.font = "HellText";
        level_select_button.textColor = Color.BLACK;
        level_select_button.fontSize = 64;
        level_select_button.size.set(420, 70);
        level_select_button.borderWidth = 2;
        level_select_button.borderColor = Color.TRANSPARENT;
        level_select_button.backgroundColor = Color.TRANSPARENT;
        level_select_button.onClickEventId = "levelSelect";

        // Add help button
        const help_text = <Button>this.add.uiElement(UIElementType.LABEL, "mainMenu", {position: new Vec2(center.x - 21, center.y + 55), text: "Help"});
        help_text.font = "HellText";
        help_text.textColor = Color.WHITE;
        help_text.fontSize = 67;
        help_text.size.set(145, 75);

        const help_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 21, center.y + 55), text: "Help"});
        help_button.font = "HellText";
        help_button.textColor = Color.BLACK;
        help_button.fontSize = 64;
        help_button.size.set(145, 75);
        help_button.borderWidth = 2;
        help_button.borderColor = Color.TRANSPARENT;
        help_button.backgroundColor = Color.TRANSPARENT;
        help_button.onClickEventId = "help";

        // Add controls
        const controls_text = <Button>this.add.uiElement(UIElementType.LABEL, "mainMenu", {position: new Vec2(center.x - 13, center.y + 150), text: "Controls"});
        controls_text.font = "HellText";
        controls_text.textColor = Color.WHITE;
        controls_text.fontSize = 67;
        controls_text.size.set(268, 70);

        const controls_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 13, center.y + 150), text: "Controls"});
        controls_button.font = "HellText";
        controls_button.textColor = Color.BLACK;
        controls_button.fontSize = 64;
        controls_button.size.set(268, 70);
        controls_button.borderWidth = 2;
        controls_button.borderColor = Color.TRANSPARENT;
        controls_button.backgroundColor = Color.TRANSPARENT;
        controls_button.onClickEventId = "controls";


        /* ################ LEVEL SELECT ################ */
        // create level select layer
        this.level_select = this.addUILayer("levelSelect");
        this.level_select.setHidden(true);

        // add level select background image
        let lsb = this.add.sprite("levelSelectImage", "levelSelect");
        lsb.position.set(lsb.size.x/2, lsb.size.y/2);

        const level_select_back = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x + 518, center.y + 308), text: "Back"});
        level_select_back.font = "HellText";
        level_select_back.textColor = Color.BLACK;
        level_select_back.fontSize = 64;
        level_select_back.size.set(168, 65);
        level_select_back.borderWidth = 2;
        level_select_back.borderColor = Color.TRANSPARENT;
        level_select_back.backgroundColor = Color.TRANSPARENT;
        level_select_back.onClickEventId = "mainMenu";

        const level_select_lust = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 20, center.y - 195), text: "Lust"});
        level_select_lust.font = "HellText";
        level_select_lust.textColor = Color.WHITE;
        level_select_lust.fontSize = 64;
        level_select_lust.size.set(140, 58);
        level_select_lust.borderWidth = 2;
        level_select_lust.borderColor = Color.TRANSPARENT;
        level_select_lust.backgroundColor = Color.TRANSPARENT;
        level_select_lust.onClickEventId = "levelLust";

        const level_select_wrath = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 20, center.y - 95), text: "Wrath"});
        level_select_wrath.font = "HellText";
        level_select_wrath.textColor = Color.WHITE;
        level_select_wrath.fontSize = 64;
        level_select_wrath.size.set(164, 54);
        level_select_wrath.borderWidth = 2;
        level_select_wrath.borderColor = Color.TRANSPARENT;
        level_select_wrath.backgroundColor = Color.TRANSPARENT;
        level_select_wrath.onClickEventId = "levelWrath";

        const level_select_gluttony = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 21, center.y + 3), text: "Gluttony"});
        level_select_gluttony.font = "HellText";
        level_select_gluttony.textColor = Color.WHITE;
        level_select_gluttony.fontSize = 64;
        level_select_gluttony.size.set(285, 75);
        level_select_gluttony.borderWidth = 2;
        level_select_gluttony.borderColor = Color.TRANSPARENT;
        level_select_gluttony.backgroundColor = Color.TRANSPARENT;
        level_select_gluttony.onClickEventId = "levelGluttony";

        const level_select_greed = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 21, center.y + 85), text: "Greed"});
        level_select_greed.font = "HellText";
        level_select_greed.textColor = Color.WHITE;
        level_select_greed.fontSize = 60;
        level_select_greed.size.set(150, 50);
        level_select_greed.borderWidth = 2;
        level_select_greed.borderColor = Color.TRANSPARENT;
        level_select_greed.backgroundColor = Color.TRANSPARENT;
        level_select_greed.onClickEventId = "levelGreed";

        const level_select_sloth = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 19, center.y + 160), text: "Sloth"});
        level_select_sloth.font = "HellText";
        level_select_sloth.textColor = Color.WHITE;
        level_select_sloth.fontSize = 56;
        level_select_sloth.size.set(135, 50);
        level_select_sloth.borderWidth = 2;
        level_select_sloth.borderColor = Color.TRANSPARENT;
        level_select_sloth.backgroundColor = Color.TRANSPARENT;
        level_select_sloth.onClickEventId = "levelSloth";

        const level_select_envy = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 20, center.y + 230), text: "Envy"});
        level_select_envy.font = "HellText";
        level_select_envy.textColor = Color.WHITE;
        level_select_envy.fontSize = 52;
        level_select_envy.size.set(114, 50);
        level_select_envy.borderWidth = 2;
        level_select_envy.borderColor = Color.TRANSPARENT;
        level_select_envy.backgroundColor = Color.TRANSPARENT;
        level_select_envy.onClickEventId = "levelEnvy";

        const level_select_pride = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 22, center.y + 295), text: "Pride"});
        level_select_pride.font = "HellText";
        level_select_pride.textColor = Color.WHITE;
        level_select_pride.fontSize = 48;
        level_select_pride.size.set(107, 47);
        level_select_pride.borderWidth = 2;
        level_select_pride.borderColor = Color.TRANSPARENT;
        level_select_pride.backgroundColor = Color.TRANSPARENT;
        level_select_pride.onClickEventId = "levelPride";

        /* ################ HELP ################ */
        // create help layer
        this.help = this.addUILayer("help");
        this.help.setHidden(true);

        // add help background image
        let hb = this.add.sprite("helpImage", "help");
        hb.position.set(hb.size.x/2, hb.size.y/2);

        const help_back = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(center.x + 518, center.y + 308), text: "Back"});
        help_back.font = "HellText";
        help_back.textColor = Color.BLACK;
        help_back.fontSize = 64;
        help_back.size.set(168, 65);
        help_back.borderWidth = 2;
        help_back.borderColor = Color.TRANSPARENT;
        help_back.backgroundColor = Color.TRANSPARENT;
        help_back.onClickEventId = "mainMenu";

        /* ################ CONTROLS ################ */
        // create controls layer
        this.controls = this.addUILayer("controls");
        this.controls.setHidden(true);

        // add controls background image
        let cb = this.add.sprite("controlsImage", "controls");
        cb.position.set(cb.size.x/2, cb.size.y/2);

        const controls_back = <Button>this.add.uiElement(UIElementType.BUTTON, "controls", {position: new Vec2(center.x + 518, center.y + 308), text: "Back"});
        controls_back.font = "HellText";
        controls_back.textColor = Color.BLACK;
        controls_back.fontSize = 64;
        controls_back.size.set(168, 65);
        controls_back.borderWidth = 2;
        controls_back.borderColor = Color.TRANSPARENT;
        controls_back.backgroundColor = Color.TRANSPARENT;
        controls_back.onClickEventId = "mainMenu";

        //music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "main_menu_music", loop: true, holdReference: true});
    
    }

    updateScene() {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            let sceneOptions = {
                physics: {
                    groupNames: ["ground", "player", "enemy", "coin"],
                    collisions:
                    [
                        [0, 1, 1, 0],
                        [1, 0, 0, 1],
                        [1, 0, 0, 0],
                        [0, 1, 0, 0]
                    ]
                }
            }

            if(event.type === "newGame") {
                // setup new game scene from here (maybe add options)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(LustLevel, {
                    health: 5,
                    coins: 0
                }, sceneOptions);
            }

            if(event.type === "mainMenu") {
                this.main_menu.setHidden(false);
                this.level_select.setHidden(true);
                this.help.setHidden(true);
                this.controls.setHidden(true);
            }

            if(event.type === "levelSelect") {
                this.main_menu.setHidden(true);
                this.level_select.setHidden(false);
            }

            if(event.type === "help") {
                this.main_menu.setHidden(true);
                this.help.setHidden(false);
            }

            if(event.type === "controls") {
                this.main_menu.setHidden(true);
                this.controls.setHidden(false);
            }

            if(event.type === "levelGluttony") {
                // go to gluttony level (level 3)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(GluttonyLevel, {
                    health: 5,
                    coins: 0
                }, 
                sceneOptions);
            }
            if(event.type === "levelLust") {
                // TODO PROJECT - go to lust level (level 1)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(LustLevel, {
                    health: 5,
                    coins: 0
                }, sceneOptions);
            }
            if(event.type === "levelWrath") {
                // TODO PROJECT - go to wrath level (level 2)
                console.log("Wrath Level");
            }
            if(event.type === "levelGreed") {
                // TODO PROJECT - go to greed level (level 4)
                console.log("Greed Level");
            }
            if(event.type === "levelSloth") {
                // TODO PROJECT - go to sloth level (level 5)
                console.log("Sloth Level");
            }
            if(event.type === "levelEnvy") {
                // TODO PROJECT - go to envy level (level 6)
                console.log("Envy Level");
            }
            if(event.type === "levelPride") {
                // TODO PROJECT - go to pride level (level 7)
                console.log("Pride Level");
            }
        }
    }
}
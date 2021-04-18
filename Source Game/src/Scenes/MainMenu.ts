import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import GluttonyLevel from "./GluttonyLevel";

export default class MainMenu extends Scene {
    private main_menu: Layer;
    private level_select: Layer;
    private help: Layer;
    private controls: Layer;

    loadScene() {
        this.load.image("mainMenuImage", "game_assets/images/main_menu_background.png");
        this.load.image("levelSelectImage", "game_assets/images/level_select_background.png");
        this.load.image("helpImage", "game_assets/images/help_background.png");
        this.load.image("controlsImage", "game_assets/images/controls_background.png");
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
        const new_game_button = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 14, center.y - 170), text: ""});
        new_game_button.size.set(330, 70);
        new_game_button.borderWidth = 2;
        new_game_button.borderColor = Color.TRANSPARENT;
        new_game_button.backgroundColor = Color.TRANSPARENT;
        new_game_button.onClickEventId = "newGame";

        // Add level select button
        const level_select_button = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 13, center.y - 60), text: ""});
        level_select_button.size.set(420, 70);
        level_select_button.borderWidth = 2;
        level_select_button.borderColor = Color.TRANSPARENT;
        level_select_button.backgroundColor = Color.TRANSPARENT;
        level_select_button.onClickEventId = "levelSelect";

        // Add help button
        const help_button = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 21, center.y + 55), text: ""});
        help_button.size.set(145, 75);
        help_button.borderWidth = 2;
        help_button.borderColor = Color.TRANSPARENT;
        help_button.backgroundColor = Color.TRANSPARENT;
        help_button.onClickEventId = "help";

        // Add controls
        const controls_button = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 13, center.y + 150), text: ""});
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

        const level_select_back = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x + 518, center.y + 308), text: ""});
        level_select_back.size.set(168, 65);
        level_select_back.borderWidth = 2;
        level_select_back.borderColor = Color.TRANSPARENT;
        level_select_back.backgroundColor = Color.TRANSPARENT;
        level_select_back.onClickEventId = "mainMenu";

        const level_select_gluttony = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 20, center.y - 195), text: ""});
        level_select_gluttony.size.set(285, 75);
        level_select_gluttony.borderWidth = 2;
        level_select_gluttony.borderColor = Color.TRANSPARENT;
        level_select_gluttony.backgroundColor = Color.TRANSPARENT;
        level_select_gluttony.onClickEventId = "levelGluttony";

        const level_select_lust = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 27, center.y - 95), text: ""});
        level_select_lust.size.set(140, 58);
        level_select_lust.borderWidth = 2;
        level_select_lust.borderColor = Color.TRANSPARENT;
        level_select_lust.backgroundColor = Color.TRANSPARENT;
        level_select_lust.onClickEventId = "levelLust";

        const level_select_wrath = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 21, center.y + 3), text: ""});
        level_select_wrath.size.set(164, 54);
        level_select_wrath.borderWidth = 2;
        level_select_wrath.borderColor = Color.TRANSPARENT;
        level_select_wrath.backgroundColor = Color.TRANSPARENT;
        level_select_wrath.onClickEventId = "levelWrath";

        const level_select_greed = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 21, center.y + 85), text: ""});
        level_select_greed.size.set(150, 50);
        level_select_greed.borderWidth = 2;
        level_select_greed.borderColor = Color.TRANSPARENT;
        level_select_greed.backgroundColor = Color.TRANSPARENT;
        level_select_greed.onClickEventId = "levelGreed";

        const level_select_sloth = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 19, center.y + 160), text: ""});
        level_select_sloth.size.set(135, 50);
        level_select_sloth.borderWidth = 2;
        level_select_sloth.borderColor = Color.TRANSPARENT;
        level_select_sloth.backgroundColor = Color.TRANSPARENT;
        level_select_sloth.onClickEventId = "levelSloth";

        const level_select_envy = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 20, center.y + 230), text: ""});
        level_select_envy.size.set(114, 50);
        level_select_envy.borderWidth = 2;
        level_select_envy.borderColor = Color.TRANSPARENT;
        level_select_envy.backgroundColor = Color.TRANSPARENT;
        level_select_envy.onClickEventId = "levelEnvy";

        const level_select_pride = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 22, center.y + 295), text: ""});
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

        const help_back = this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(center.x + 518, center.y + 308), text: ""});
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

        const controls_back = this.add.uiElement(UIElementType.BUTTON, "controls", {position: new Vec2(center.x + 518, center.y + 308), text: ""});
        controls_back.size.set(168, 65);
        controls_back.borderWidth = 2;
        controls_back.borderColor = Color.TRANSPARENT;
        controls_back.backgroundColor = Color.TRANSPARENT;
        controls_back.onClickEventId = "mainMenu";
    }

    updateScene() {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            // let scene_options = {
            //     physics: {
            //         groupNames: ["ground", "player"],
            //         collisions: [
            //             [0, 1],
            //             [1, 0]
            //         ]
            //     }
            // }

            if(event.type === "newGame") {
                // TODO PROJECT - setup new game scene from here (maybe add options)
                console.log("New Game Event no scene_options");
                this.sceneManager.changeToScene(GluttonyLevel, {});
            }

            if(event.type === "mainMenu") {
                console.log("Main Menu Event");
                this.main_menu.setHidden(false);
                this.level_select.setHidden(true);
                this.help.setHidden(true);
                this.controls.setHidden(true);
            }

            if(event.type === "levelSelect") {
                console.log("Level Select Event");
                this.main_menu.setHidden(true);
                this.level_select.setHidden(false);
            }

            if(event.type === "help") {
                console.log("Help Event");
                this.main_menu.setHidden(true);
                this.help.setHidden(false);
            }

            if(event.type === "controls") {
                console.log("Controls Event");
                this.main_menu.setHidden(true);
                this.controls.setHidden(false);
            }

            if(event.type === "levelGluttony") {
                // TODO PROJECT - go to gluttony level (level 1)
                console.log("Gluttony Level");
                this.sceneManager.changeToScene(GluttonyLevel, {});
            }
            if(event.type === "levelLust") {
                // TODO PROJECT - go to lust level (level 2)
                console.log("Lust Level");
            }
            if(event.type === "levelWrath") {
                // TODO PROJECT - go to wrath level (level 3)
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
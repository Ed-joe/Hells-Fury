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
import GreedLevel from "./GreedLevel";
import WrathLevel from "./WrathLevel";
import SlothLevel from "./SlothLevel";
import EnvyLevel from "./EnvyLevel";
import PrideLevel from "./PrideLevel";
import GameLevel from "./GameLevel";

export default class MainMenu extends Scene {
    private main_menu: Layer;
    private level_select: Layer;
    private help: Layer;
    private controls: Layer;

    loadScene() {
        this.load.spritesheet("mainMenuImage", "game_assets/spritesheets/main_background.json");
        this.load.spritesheet("levelSelectImage", "game_assets/spritesheets/levels_bg.json");
        this.load.spritesheet("helpImage", "game_assets/spritesheets/help_bg.json");
        this.load.spritesheet("controlsImage", "game_assets/spritesheets/controls_bg.json");
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
        let mmb = this.add.animatedSprite("mainMenuImage", "mainMenu");
        mmb.position.set(mmb.size.x/2, mmb.size.y/2);
        mmb.animation.play("IDLE");

        // Add new game button, and give it an event to emit on press

        const new_game_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 14, center.y - 170), text: "New Game"});
        new_game_button.font = "HellText";
        new_game_button.textColor = Color.BLACK;
        new_game_button.fontSize = 64;
        new_game_button.size.set(330, 70);
        new_game_button.borderWidth = 2;
        new_game_button.borderColor = Color.TRANSPARENT;
        new_game_button.backgroundColor = Color.TRANSPARENT;
        new_game_button.onClickEventId = "newGame";
        new_game_button.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        new_game_button.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };

        // Add level select button

        const level_select_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 13, center.y - 60), text: "Level Select"});
        level_select_button.font = "HellText";
        level_select_button.textColor = Color.BLACK;
        level_select_button.fontSize = 64;
        level_select_button.size.set(420, 70);
        level_select_button.borderWidth = 2;
        level_select_button.borderColor = Color.TRANSPARENT;
        level_select_button.backgroundColor = Color.TRANSPARENT;
        level_select_button.onClickEventId = "levelSelect";
        level_select_button.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        level_select_button.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };

        // Add help button

        const help_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 21, center.y + 55), text: "Help"});
        help_button.font = "HellText";
        help_button.textColor = Color.BLACK;
        help_button.fontSize = 64;
        help_button.size.set(145, 75);
        help_button.borderWidth = 2;
        help_button.borderColor = Color.TRANSPARENT;
        help_button.backgroundColor = Color.TRANSPARENT;
        help_button.onClickEventId = "help";
        help_button.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        help_button.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };
        // Add controls

        const controls_button = <Button>this.add.uiElement(UIElementType.BUTTON, "mainMenu", {position: new Vec2(center.x - 13, center.y + 150), text: "Controls"});
        controls_button.font = "HellText";
        controls_button.textColor = Color.BLACK;
        controls_button.fontSize = 64;
        controls_button.size.set(268, 70);
        controls_button.borderWidth = 2;
        controls_button.borderColor = Color.TRANSPARENT;
        controls_button.backgroundColor = Color.TRANSPARENT;
        controls_button.onClickEventId = "controls";
        controls_button.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        controls_button.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };


        /* ################ LEVEL SELECT ################ */
        // create level select layer
        this.level_select = this.addUILayer("levelSelect");
        this.level_select.setHidden(true);

        // add level select background image
        let lsb = this.add.animatedSprite("levelSelectImage", "levelSelect");
        lsb.position.set(lsb.size.x/2, lsb.size.y/2);
        lsb.animation.play("IDLE");

        const level_select_back = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x + 518, center.y + 308), text: "Back"});
        level_select_back.font = "HellText";
        level_select_back.textColor = Color.BLACK;
        level_select_back.fontSize = 64;
        level_select_back.size.set(168, 65);
        level_select_back.borderWidth = 2;
        level_select_back.borderColor = Color.TRANSPARENT;
        level_select_back.backgroundColor = Color.TRANSPARENT;
        level_select_back.onClickEventId = "mainMenu";
        
        level_select_back.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        level_select_back.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };

        const level_select_lust = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 10, center.y - 195), text: "???"});
        if(GameLevel.completed_levels[0]) {
            level_select_lust.text = "Lust";
            level_select_lust.onClickEventId = "levelLust";
            level_select_lust.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_lust.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_lust.font = "HellText";
        level_select_lust.textColor = Color.WHITE;
        level_select_lust.fontSize = 64;
        level_select_lust.size.set(140, 58);
        level_select_lust.borderWidth = 2;
        level_select_lust.borderColor = Color.TRANSPARENT;
        level_select_lust.backgroundColor = Color.TRANSPARENT;

        const level_select_wrath = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 10, center.y - 95), text: "???"});
        if(GameLevel.completed_levels[1]) {
            level_select_wrath.text = "Wrath";
            level_select_wrath.onClickEventId = "levelWrath";
            level_select_wrath.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_wrath.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_wrath.font = "HellText";
        level_select_wrath.textColor = Color.WHITE;
        level_select_wrath.fontSize = 64;
        level_select_wrath.size.set(164, 54);
        level_select_wrath.borderWidth = 2;
        level_select_wrath.borderColor = Color.TRANSPARENT;
        level_select_wrath.backgroundColor = Color.TRANSPARENT;

        const level_select_gluttony = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 10, center.y + 3), text: "???"});
        if(GameLevel.completed_levels[2]) {
            level_select_gluttony.text = "Gluttony";
            level_select_gluttony.onClickEventId = "levelGluttony";
            level_select_gluttony.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_gluttony.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_gluttony.font = "HellText";
        level_select_gluttony.textColor = Color.WHITE;
        level_select_gluttony.fontSize = 64;
        level_select_gluttony.size.set(285, 75);
        level_select_gluttony.borderWidth = 2;
        level_select_gluttony.borderColor = Color.TRANSPARENT;
        level_select_gluttony.backgroundColor = Color.TRANSPARENT;

        const level_select_greed = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", { position: new Vec2(center.x - 10, center.y + 230), text: "???"});
        if(GameLevel.completed_levels[5]) {
            level_select_greed.text = "Greed";
            level_select_greed.onClickEventId = "levelGreed";
            level_select_greed.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_greed.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_greed.font = "HellText";
        level_select_greed.textColor = Color.WHITE;
        level_select_greed.fontSize = 52;
        level_select_greed.size.set(150, 50);
        level_select_greed.borderWidth = 2;
        level_select_greed.borderColor = Color.TRANSPARENT;
        level_select_greed.backgroundColor = Color.TRANSPARENT;

        const level_select_sloth = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 10, center.y + 85), text: "???"});
        if(GameLevel.completed_levels[3]) {
            level_select_sloth.text = "Sloth";
            level_select_sloth.onClickEventId = "levelSloth";
            level_select_sloth.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_sloth.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_sloth.font = "HellText";
        level_select_sloth.textColor = Color.WHITE;
        level_select_sloth.fontSize = 60;
        level_select_sloth.size.set(135, 50);
        level_select_sloth.borderWidth = 2;
        level_select_sloth.borderColor = Color.TRANSPARENT;
        level_select_sloth.backgroundColor = Color.TRANSPARENT;
        
        const level_select_envy = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", { position: new Vec2(center.x - 9, center.y + 160), text: "???"});
        if(GameLevel.completed_levels[4]) {
            level_select_envy.text = "Envy";
            level_select_envy.onClickEventId = "levelEnvy";
            level_select_envy.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_envy.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_envy.font = "HellText";
        level_select_envy.textColor = Color.WHITE;
        level_select_envy.fontSize = 56;
        level_select_envy.size.set(114, 50);
        level_select_envy.borderWidth = 2;
        level_select_envy.borderColor = Color.TRANSPARENT;
        level_select_envy.backgroundColor = Color.TRANSPARENT;

        const level_select_pride = <Button>this.add.uiElement(UIElementType.BUTTON, "levelSelect", {position: new Vec2(center.x - 11, center.y + 295), text: "???"});
        if(GameLevel.completed_levels[6]) {
            level_select_pride.text = "Pride";
            level_select_pride.onClickEventId = "levelPride";
            level_select_pride.onEnter = function(): void {
                this.textColor = Color.RED;
            };
            level_select_pride.onLeave = function(): void {
                this.textColor = Color.WHITE;
            };
        }
        level_select_pride.font = "HellText";
        level_select_pride.textColor = Color.WHITE;
        level_select_pride.fontSize = 48;
        level_select_pride.size.set(107, 47);
        level_select_pride.borderWidth = 2;
        level_select_pride.borderColor = Color.TRANSPARENT;
        level_select_pride.backgroundColor = Color.TRANSPARENT;

        /* ################ HELP ################ */
        // create help layer
        this.help = this.addUILayer("help");
        this.help.setHidden(true);

        // add help background image
        let hb = this.add.animatedSprite("helpImage", "help");
        hb.position.set(hb.size.x/2, hb.size.y/2);
        hb.animation.play("IDLE");

        const help_back = <Button>this.add.uiElement(UIElementType.BUTTON, "help", {position: new Vec2(center.x + 518, center.y + 308), text: "Back"});
        help_back.font = "HellText";
        help_back.textColor = Color.BLACK;
        help_back.fontSize = 64;
        help_back.size.set(168, 65);
        help_back.borderWidth = 2;
        help_back.borderColor = Color.TRANSPARENT;
        help_back.backgroundColor = Color.TRANSPARENT;
        help_back.onClickEventId = "mainMenu";
        help_back.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        help_back.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };

        /* ################ CONTROLS ################ */
        // create controls layer
        this.controls = this.addUILayer("controls");
        this.controls.setHidden(true);

        // add controls background image
        let cb = this.add.animatedSprite("controlsImage", "controls");
        cb.position.set(cb.size.x/2, cb.size.y/2);
        cb.animation.play("IDLE");

        const controls_back = <Button>this.add.uiElement(UIElementType.BUTTON, "controls", {position: new Vec2(center.x + 518, center.y + 308), text: "Back"});
        controls_back.font = "HellText";
        controls_back.textColor = Color.BLACK;
        controls_back.fontSize = 64;
        controls_back.size.set(168, 65);
        controls_back.borderWidth = 2;
        controls_back.borderColor = Color.TRANSPARENT;
        controls_back.backgroundColor = Color.TRANSPARENT;
        controls_back.onClickEventId = "mainMenu";
        controls_back.onEnter = function(): void {
            this.textColor = Color.WHITE;
        };
        controls_back.onLeave = function(): void {
            this.textColor = Color.BLACK;
        };

        //music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "main_menu_music", loop: true, holdReference: true});
    
    }

    updateScene() {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            let scene_options = {
                health: 5,
                coins: 0,
                damage: 1
            }

            let physics_options = {
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
            }

            if(event.type === "newGame") {
                // setup new game scene from here (maybe add options)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(LustLevel, scene_options, physics_options);
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
                this.sceneManager.changeToScene(GluttonyLevel, scene_options, physics_options);
            }
            if(event.type === "levelLust") {
                // TODO PROJECT - go to lust level (level 1)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(LustLevel, scene_options, physics_options);
            }
            if(event.type === "levelWrath") {
                // TODO PROJECT - go to wrath level (level 2)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(WrathLevel, scene_options, physics_options);
            }
            if(event.type === "levelSloth") {
                // TODO PROJECT - go to sloth level (level 4)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(SlothLevel, scene_options, physics_options);
            }
            if(event.type === "levelEnvy") {
                // TODO PROJECT - go to envy level (level 5)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(EnvyLevel, scene_options, physics_options);
            }
            if(event.type === "levelGreed") {
                // TODO PROJECT - go to greed level (level 6)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(GreedLevel, scene_options, physics_options);
            }
            if(event.type === "levelPride") {
                // TODO PROJECT - go to pride level (level 7)
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu_music"});
                this.sceneManager.changeToScene(PrideLevel, scene_options, physics_options);
            }
        }
    }
}
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Color from "../Wolfie2D/Utils/Color";
import GameLevel from "./GameLevel";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import Rect from "../Wolfie2D/Nodes/Graphics/Rect";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import GluttonyLevel from "./GluttonyLevel";
import Input from "../Wolfie2D/Input/Input";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";

export default class LustLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);

        this.level_music_key = "lust_music";
        this.level_music_path = "game_assets/sounds/music/lust.mp3";
        this.boss_audios = {
            lust_move: "game_assets/sounds/lust_move.mp3",
            lust_death: "game_assets/sounds/lust_death.mp3",
            lust_damage: "game_assets/sounds/lust_damage.mp3"
        }
        this.boss_sprite = {
            lust: "game_assets/spritesheets/lust.json"
        }
        this.boss_attack_image = {}
        this.boss_attack_sprite = {}
        this.enemy_data = {
            enemyData: "game_assets/data/lust_enemy.json"
        }
        this.level_tilemap = {
            lustLevel: "game_assets/tilemaps/lust_level.json"
        }
        this.next_level_constructor = GluttonyLevel
        this.shop_pos = new Vec2(780, 608);
        this.player_start_pos = new Vec2(1138, 116);
        this.player_speed = 150;
        this.player_slippery = false;
        this.level_text_color = new Color(255, 0, 196);
        this.start_level_text = "Lust's Lascivious Lair";
        this.end_level_text = "Lust has been defeated!"
        this.boss_room_pos = new Vec2(1024, 1224);
        this.boss_room_size = new Vec2(6 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2(1008, 1360), new Vec2(1040, 1360)];
        this.lower_boss_door = [new Vec2(1008, 1392), new Vec2(1008, 1424), new Vec2(1040, 1392), new Vec2(1040, 1424)];
    }

    startScene(): void {
        super.startScene();

        this.initializeTutorial()
    }

    updateScene(deltaT: number): void {
        let scene_options = {
            health: 5,
            coins: 0
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

        if(Input.isJustPressed("lust")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(LustLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("gluttony")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(GluttonyLevel, scene_options, physics_options);
        }


        super.updateScene(deltaT);
    }

    protected initializeTutorial(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1138, 116), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1138, 48), text: "Use WASD to move"});
        tutorial_label_1.font = "HellText";    
        tutorial_label_1.textColor = Color.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);

        let tutorial_zone_2 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1680, 426), size: new Vec2(10 * 32, 5 * 32)});
        tutorial_zone_2.addPhysics(undefined, undefined, false, true);
        tutorial_zone_2.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_2);

        let tutorial_label_2 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1616, 360), text: "Click to attack in the direction of your mouse"});
        tutorial_label_2.font = "HellText";    
        tutorial_label_2.textColor = Color.BLACK;
        tutorial_label_2.fontSize = 32;
        tutorial_label_2.size.set(30, 14);
        tutorial_label_2.borderWidth = 2;
        tutorial_label_2.borderColor = Color.TRANSPARENT;
        tutorial_label_2.backgroundColor = Color.TRANSPARENT;
        tutorial_label_2.visible = false;
        this.tutorial_labels.push(tutorial_label_2);

        let tutorial_zone_3 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1776, 722), size: new Vec2(10 * 32, 4 * 32)});
        tutorial_zone_3.addPhysics(undefined, undefined, false, true);
        tutorial_zone_3.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_3);

        let tutorial_label_3 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1776, 642), text: "Hellbats take 2 punches to kill"});
        tutorial_label_3.font = "HellText";    
        tutorial_label_3.textColor = Color.BLACK;
        tutorial_label_3.fontSize = 32;
        tutorial_label_3.size.set(30, 14);
        tutorial_label_3.borderWidth = 2;
        tutorial_label_3.borderColor = Color.TRANSPARENT;
        tutorial_label_3.backgroundColor = Color.TRANSPARENT;
        tutorial_label_3.visible = false;
        this.tutorial_labels.push(tutorial_label_3);

        let tutorial_zone_4 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1808, 1164), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_4.addPhysics(undefined, undefined, false, true);
        tutorial_zone_4.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_4);

        let tutorial_label_4 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1808, 1084), text: "Walk over coins to pick them up"});
        tutorial_label_4.font = "HellText";    
        tutorial_label_4.textColor = Color.BLACK;
        tutorial_label_4.fontSize = 32;
        tutorial_label_4.size.set(30, 14);
        tutorial_label_4.borderWidth = 2;
        tutorial_label_4.borderColor = Color.TRANSPARENT;
        tutorial_label_4.backgroundColor = Color.TRANSPARENT;
        tutorial_label_4.visible = false;
        this.tutorial_labels.push(tutorial_label_4);

        let tutorial_zone_5 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1716, 1462), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_5.addPhysics(undefined, undefined, false, true);
        tutorial_zone_5.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_5);

        let tutorial_label_5 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1732, 1380), text: "Hellbats are scattered across"});
        tutorial_label_5.font = "HellText";
        tutorial_label_5.textColor = Color.BLACK;
        tutorial_label_5.fontSize = 32;
        tutorial_label_5.size.set(30, 14);
        tutorial_label_5.borderWidth = 2;
        tutorial_label_5.borderColor = Color.TRANSPARENT;
        tutorial_label_5.backgroundColor = Color.TRANSPARENT;
        tutorial_label_5.visible = false;
        this.tutorial_labels.push(tutorial_label_5);

        let tutorial_zone_6 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(292, 1392), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_6.addPhysics(undefined, undefined, false, true);
        tutorial_zone_6.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_6);

        let tutorial_label_6 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(292, 1302), text: "Hellhounds take 3 hits to kill"});
        tutorial_label_6.font = "HellText";
        tutorial_label_6.textColor = Color.BLACK;
        tutorial_label_6.fontSize = 32;
        tutorial_label_6.size.set(30, 14);
        tutorial_label_6.borderWidth = 2;
        tutorial_label_6.borderColor = Color.TRANSPARENT;
        tutorial_label_6.backgroundColor = Color.TRANSPARENT;
        tutorial_label_6.visible = false;
        this.tutorial_labels.push(tutorial_label_6);

        let tutorial_zone_7 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1080, 370), size: new Vec2(9 * 32, 5 * 32)});
        tutorial_zone_7.addPhysics(undefined, undefined, false, true);
        tutorial_zone_7.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_7);

        let tutorial_label_7 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1100, 460), text: "You can find Lust at the center of the floor"});
        tutorial_label_7.font = "HellText";
        tutorial_label_7.textColor = Color.BLACK;
        tutorial_label_7.fontSize = 32;
        tutorial_label_7.size.set(30, 14);
        tutorial_label_7.borderWidth = 2;
        tutorial_label_7.borderColor = Color.TRANSPARENT;
        tutorial_label_7.backgroundColor = Color.TRANSPARENT;
        tutorial_label_7.visible = false;
        this.tutorial_labels.push(tutorial_label_7);

        let tutorial_zone_8 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1028, 1488), size: new Vec2(6 * 32, 7 * 32)});
        tutorial_zone_8.addPhysics(undefined, undefined, false, true);
        tutorial_zone_8.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_8);

        let tutorial_label_8 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1028, 1432), text: "You can enter the boss room here..."});
        tutorial_label_8.font = "HellText";
        tutorial_label_8.textColor = Color.BLACK;
        tutorial_label_8.fontSize = 32;
        tutorial_label_8.size.set(30, 14);
        tutorial_label_8.borderWidth = 2;
        tutorial_label_8.borderColor = Color.TRANSPARENT;
        tutorial_label_8.backgroundColor = Color.TRANSPARENT;
        tutorial_label_8.visible = false;
        this.tutorial_labels.push(tutorial_label_8);

        let tutorial_zone_9 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1028, 1488), size: new Vec2(6 * 32, 7 * 32)});
        tutorial_zone_9.addPhysics(undefined, undefined, false, true);
        tutorial_zone_9.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_9);

        let tutorial_label_9 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(884, 1470), text: "or you can look for the shop"});
        tutorial_label_9.font = "HellText";
        tutorial_label_9.textColor = Color.BLACK;
        tutorial_label_9.fontSize = 32;
        tutorial_label_9.size.set(30, 14);
        tutorial_label_9.borderWidth = 2;
        tutorial_label_9.borderColor = Color.TRANSPARENT;
        tutorial_label_9.backgroundColor = Color.TRANSPARENT;
        tutorial_label_9.visible = false;
        this.tutorial_labels.push(tutorial_label_9);

        let tutorial_zone_10 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1716, 1462), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_10.addPhysics(undefined, undefined, false, true);
        tutorial_zone_10.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_10);

        let tutorial_label_10 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1732, 1398), text: "the Circles of Hell"});
        tutorial_label_10.font = "HellText";
        tutorial_label_10.textColor = Color.BLACK;
        tutorial_label_10.fontSize = 32;
        tutorial_label_10.size.set(30, 14);
        tutorial_label_10.borderWidth = 2;
        tutorial_label_10.borderColor = Color.TRANSPARENT;
        tutorial_label_10.backgroundColor = Color.TRANSPARENT;
        tutorial_label_10.visible = false;
        this.tutorial_labels.push(tutorial_label_10);
    }
}
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Color from "../Wolfie2D/Utils/Color";
import GameLevel from "./GameLevel";
import MainMenu from "./MainMenu";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import Rect from "../Wolfie2D/Nodes/Graphics/Rect";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Input from "../Wolfie2D/Input/Input";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import LustLevel from "./LustLevel";
import GreedLevel from "./GreedLevel";
import SlothLevel from "./SlothLevel";
import EnvyLevel from "./EnvyLevel";
import WrathLevel from "./WrathLevel";
import GluttonyLevel from "./GluttonyLevel";

export default class PrideLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);

        this.level_music_key = "pride_music";
        this.coin_path = "game_assets/spritesheets/bloody_coin.json";
        this.coin_hurt = true;
        this.level_music_path = "game_assets/sounds/music/pride.mp3";
        this.boss_audios = {
            gluttony_attack: "game_assets/sounds/gluttony_attack.mp3",
            envy_attack: "game_assets/sounds/envy_attack.mp3",
            envy_charge: "game_assets/sounds/envy_charge.mp3",
            greed_attack: "game_assets/sounds/greed_attack.mp3",
            lust_move: "game_assets/sounds/lust_move.mp3",
            sloth_catch: "game_assets/sounds/sloth_catch.mp3",
            sloth_throw: "game_assets/sounds/sloth_throw.mp3",
            wrath_attack: "game_assets/sounds/wrath_attack.mp3"
        }
        this.boss_sprite = {
            pride: "game_assets/spritesheets/pride.json"
        }
        this.boss_attack_image = {
            slam: "game_assets/spritesheets/smash.png",
            slice: "game_assets/spritesheets/wrath_slice.png",
            fist4: "game_assets/spritesheets/impact_green.png"
        }
        this.boss_attack_sprite = {
            slam: "game_assets/spritesheets/smash.json",
            slice: "game_assets/spritesheets/wrath_slice.json",
            fist4: "game_assets/spritesheets/impact_green.json"
        }
        this.enemy_data = {
            enemyData: "game_assets/data/pride_enemy.json"
        }
        this.level_tilemap = {
            gluttonyLevel: "game_assets/tilemaps/pride_level.json"
        }
        this.next_level_constructor = MainMenu
        this.shop_pos = new Vec2(0, 0);
        this.player_start_pos = new Vec2(32.5*32, 41.5*32);
        this.player_speed = 150;
        this.player_slippery = false;
        this.level_text_color = new Color(254, 254, 254);
        this.start_level_text = "Pride's Perfect Paradise";
        this.end_level_text = "Pride has been defeated!"
        this.boss_room_pos = new Vec2(1040, 946);
        this.boss_room_size = new Vec2(7 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2(1008, 1040), new Vec2(1040, 1040), new Vec2(1072, 1040)];
        this.lower_boss_door = [new Vec2(1008, 1072), new Vec2(1040, 1072), new Vec2(1072, 1072), new Vec2(1008, 1104), new Vec2(1040, 1104), new Vec2(1072, 1104)];
    }

    startScene(): void {
        super.startScene();

        this.initializeLabels()
    }

    updateScene(deltaT: number): void {
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

        if(Input.isJustPressed("lust")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(LustLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("gluttony")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(GluttonyLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("envy")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(EnvyLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("wrath")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(WrathLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("pride")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(PrideLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("greed")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(GreedLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("sloth")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(SlothLevel, scene_options, physics_options);
        }

        super.updateScene(deltaT);
    }

    protected initializeLabels(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        // let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1025, 416), size: new Vec2(7 * 32, 5 * 32)});
        // tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        // tutorial_zone_1.color = Color.TRANSPARENT;
        // this.tutorial_zones.push(tutorial_zone_1);

        // let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1025, 430), text: "Careful... The floor here is slick with grease."});
        // tutorial_label_1.font = "HellText";    
        // tutorial_label_1.textColor = Color.BLACK;
        // tutorial_label_1.fontSize = 32;
        // tutorial_label_1.size.set(30, 14);
        // tutorial_label_1.borderWidth = 2;
        // tutorial_label_1.borderColor = Color.TRANSPARENT;
        // tutorial_label_1.backgroundColor = Color.TRANSPARENT;
        // tutorial_label_1.visible = false;
        // this.tutorial_labels.push(tutorial_label_1);
    }
}
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
import GluttonyLevel from "./GluttonyLevel";
import Debug from "../Wolfie2D/Debug/Debug";
import GreedLevel from "./GreedLevel";
import WrathLevel from "./WrathLevel";
import PrideLevel from "./PrideLevel";
import SlothLevel from "./SlothLevel";

export default class EnvyLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);
        
        // TODO
        this.level_music_key = "envy_music";
        this.level_music_path = "game_assets/sounds/music/envy.mp3";


        this.boss_audios = {
            envy_attack: "game_assets/sounds/envy_attack.mp3",
            envy_charge: "game_assets/sounds/envy_charge.mp3",
            envy_damage: "game_assets/sounds/envy_damage.mp3",
            envy_death: "game_assets/sounds/envy_death.mp3"
        }
        this.boss_sprite = {
            envy: "game_assets/spritesheets/envy.json"
        }
        this.boss_attack_image = {
            fist4: "game_assets/spritesheets/impact_green.png"
        }
        this.boss_attack_sprite = {
            fist4: "game_assets/spritesheets/impact_green.json"
        }
        this.enemy_data = {
            enemyData: "game_assets/data/envy_enemy.json"
        }
        this.level_tilemap = {
            envyLevel: "game_assets/tilemaps/envy_level.json"
        }
        this.next_level_constructor = GreedLevel
        this.shop_pos = new Vec2(1679, 157);
        this.player_start_pos = new Vec2(430, 1779); //spawn pos
        // this.player_start_pos = new Vec2(1008, 1556); // // boss
        this.player_speed = 150;
        this.level_text_color = new Color(89, 147, 36);
        this.start_level_text = "Envy's Emerald Enclave";
        this.end_level_text = "Envy has been defeated!"
        this.boss_room_pos = new Vec2(979, 1168);
        this.boss_room_size = new Vec2(7 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2(912, 1268), new Vec2(944, 1268), new Vec2(976, 1268),  new Vec2(1008, 1268), new Vec2(1040, 1268)];
        this.lower_boss_door = [new Vec2(912, 1300), new Vec2(944, 1300), new Vec2(976, 1300), new Vec2(1008, 1300), new Vec2(1040, 1300)];
        this.lose_money = true;
    }


    startScene(): void {
        super.startScene();

        this.initializeLabels()
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

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(430, 1800), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(430, 1734), text: "The demons grow envious of your gold. They will steal it on attack!"});
        tutorial_label_1.font = "HellText";    
        tutorial_label_1.textColor = Color.BLACK;
        tutorial_label_1.fontSize = 30;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
    }
}
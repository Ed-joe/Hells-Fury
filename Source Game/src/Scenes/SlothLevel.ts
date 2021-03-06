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
import EnvyLevel from "./EnvyLevel";
import WrathLevel from "./WrathLevel";
import PrideLevel from "./PrideLevel";
import GreedLevel from "./GreedLevel";
import VictoryLevel from "./VictoryLevel";

export default class SlothLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);

        // TODO
        this.level_music_key = "sloth_music";
        this.level_music_path = "game_assets/sounds/music/sloth.mp3";


        this.boss_audios = {
            sloth_catch: "game_assets/sounds/sloth_catch.mp3",
            sloth_damage: "game_assets/sounds/sloth_damage.mp3",
            sloth_death: "game_assets/sounds/sloth_death.mp3",
            sloth_throw: "game_assets/sounds/sloth_throw.mp3"
        }
        this.boss_sprite = {
            sloth: "game_assets/spritesheets/sloth.json"
        }
        this.boss_attack_image = {}
        this.boss_attack_sprite = {}
        this.enemy_data = {
            enemyData: "game_assets/data/sloth_enemy.json"
        }
        this.level_tilemap = {
            greedLevel: "game_assets/tilemaps/sloth_level.json"
        }
        this.next_level_constructor = EnvyLevel;
        this.retry_level_constructor = SlothLevel;
        this.shop_pos = new Vec2(1298, 500);
        this.player_start_pos = new Vec2(1480, 1663);
        this.player_speed = 110;
        this.level_text_color = new Color(0, 0, 190);
        this.start_level_text = "Sloth's Sluggish Slum";
        this.end_level_text = "Sloth has been defeated!";
        this.boss_room_pos = new Vec2(1024, 1072);
        this.boss_room_size = new Vec2(7 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2(976, 1200), new Vec2(1008, 1200), new Vec2(1040, 1200), new Vec2(1072, 1200)];
        this.lower_boss_door = [new Vec2(976, 1232), new Vec2(1008, 1232), new Vec2(1040, 1232), new Vec2(1072, 1232)];
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
        }else if(Input.isJustPressed("victory")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(VictoryLevel, scene_options, physics_options);
        }

        super.updateScene(deltaT);
    }

    protected initializeLabels(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1480, 1663), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1480, 1732), text: "You feel sluggish..."});
        tutorial_label_1.font = "HellText";    
        tutorial_label_1.textColor = Color.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);
    }
}
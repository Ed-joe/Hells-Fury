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

export default class GluttonyLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);

        this.level_music_key = "gluttony_music";
        this.level_music_path = "game_assets/sounds/music/gluttony.mp3";
        this.boss_audios = {
            gluttony_attack: "game_assets/sounds/gluttony_attack.mp3",
            gluttony_damage: "game_assets/sounds/gluttony_damage.mp3",
            gluttony_death: "game_assets/sounds/gluttony_death.mp3"
        }
        this.boss_sprite = {
            gluttony: "game_assets/spritesheets/gluttony.json",
            boss_hitbox: "game_assets/spritesheets/boss_hitbox.json"
        }
        this.boss_attack_image = {
            slam: "game_assets/spritesheets/smash.png"
        }
        this.boss_attack_sprite = {
            slam: "game_assets/spritesheets/smash.json"
        }
        this.enemy_data = {
            enemyData: "game_assets/data/gluttony_enemy.json"
        }
        this.level_tilemap = {
            gluttonyLevel: "game_assets/tilemaps/gluttony_level.json"
        }
        this.next_level_constructor = SlothLevel
        this.shop_pos = new Vec2(350, 1333);
        this.player_start_pos = new Vec2(1018, 330);
        this.player_speed = 150;
        this.player_slippery = true;
        this.level_text_color = new Color(95, 90, 76);
        this.start_level_text = "Gluttony's Greasy Grotto";
        this.end_level_text = "Gluttony has been defeated!"
        this.boss_room_pos = new Vec2(1024, 1320);
        this.boss_room_size = new Vec2(6 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2(1008, 1424), new Vec2(1040, 1424)];
        this.lower_boss_door = [new Vec2(1008, 1456), new Vec2(1008, 1488), new Vec2(1040, 1456), new Vec2(1040, 1488)];
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
        }

        super.updateScene(deltaT);
    }

    protected initializeLabels(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1025, 416), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1025, 430), text: "Careful... The floor here is slick with grease."});
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
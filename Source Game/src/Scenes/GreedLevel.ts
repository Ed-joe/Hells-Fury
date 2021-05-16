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

export default class GreedLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);

        // TODO
        this.level_music_key = "lust_music";
        this.level_music_path = "game_assets/sounds/music/lust.mp3";

        this.boss_audios = {
            greed_attack: "game_assets/sounds/greed_attack.mp3",
            greed_damage: "game_assets/sounds/greed_damage.mp3",
            greed_death: "game_assets/sounds/greed_death.mp3"
        }
        this.boss_sprite = {
            greed: "game_assets/spritesheets/greed.json"
        }
        this.boss_attack_image = {}
        this.boss_attack_sprite = {}
        this.enemy_data = {
            enemyData: "game_assets/data/greed_enemy.json"
        }
        this.level_tilemap = {
            greedLevel: "game_assets/tilemaps/greed_level.json"
        }
        this.next_level_constructor = MainMenu
        this.player_start_pos = new Vec2(1009, 1756);
        // this.player_start_pos = new Vec2(1008, 1233);
        this.player_speed = 150;
        this.level_text_color = new Color(252, 219, 3);
        this.start_level_text = "Greed's Golden Gorge";
        this.end_level_text = "Greed has been defeated!"
        this.boss_room_pos = new Vec2(1008, 1233);
        this.boss_room_size = new Vec2(7 * 32, 3 * 32);
        this.coin_hurt = true;
        this.has_shop = false;
        this.greed_tiles = true;
        this.upper_boss_door = [new Vec2(944, 1326), new Vec2(976, 1326), new Vec2(1008, 1326), new Vec2(1040, 1326), new Vec2(1072, 1326)];
        this.lower_boss_door = [new Vec2(944, 1356), new Vec2(944, 1388), new Vec2(976, 1356), new Vec2(976, 1388), new Vec2(1008, 1356), new Vec2(1008, 1388), new Vec2(1040, 1356), new Vec2(1040, 1388), new Vec2(1072, 1356), new Vec2(1072, 1388)];
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
        }

        super.updateScene(deltaT);
    }

    protected initializeLabels(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1010, 1773), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1010, 1733), text: "Don't let your greed consume you, coins hurt!"});
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
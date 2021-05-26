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
import EnvyLevel from "./EnvyLevel";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import { Game_Events } from "../GameSystems/game_enums";

export default class VictoryLevel extends GameLevel {
    initScene(init: Record<string, any>): void {
        super.initScene(init);
        
        // TODO
        this.level_music_key = "main_menu";
        this.level_music_path = "game_assets/sounds/music/main_menu.mp3";


        this.boss_audios = {
            envy_attack: "game_assets/sounds/envy_attack.mp3",
            envy_charge: "game_assets/sounds/envy_charge.mp3",
            envy_damage: "game_assets/sounds/envy_damage.mp3",
            envy_death: "game_assets/sounds/envy_death.mp3",
            gluttony_attack: "game_assets/sounds/gluttony_attack.mp3",
            gluttony_charge: "game_assets/sounds/gluttony_charge.mp3",
            gluttony_damage: "game_assets/sounds/gluttony_damage.mp3",
            gluttony_death: "game_assets/sounds/gluttony_death.mp3",
            greed_attack: "game_assets/sounds/greed_attack.mp3",
            greed_damage: "game_assets/sounds/greed_damage.mp3",
            greed_death: "game_assets/sounds/greed_death.mp3",
            lust_move: "game_assets/sounds/lust_move.mp3",
            lust_death: "game_assets/sounds/lust_death.mp3",
            lust_damage: "game_assets/sounds/lust_damage.mp3",
            wrath_attack: "game_assets/sounds/wrath_attack.mp3",
            wrath_damage: "game_assets/sounds/wrath_damage.mp3",
            wrath_death: "game_assets/sounds/wrath_death.mp3",
            sloth_catch: "game_assets/sounds/sloth_catch.mp3",
            sloth_damage: "game_assets/sounds/sloth_damage.mp3",
            sloth_death: "game_assets/sounds/sloth_death.mp3",
            sloth_throw: "game_assets/sounds/sloth_throw.mp3",
            pride_damage: "game_assets/sounds/pride_damage.mp3",
            pride_death: "game_assets/sounds/pride_death.mp3"
        }
        this.boss_sprite = {
            gluttony: "game_assets/spritesheets/gluttony.json",
            boss_hitbox: "game_assets/spritesheets/boss_hitbox.json",
            envy: "game_assets/spritesheets/envy.json",
            greed: "game_assets/spritesheets/greed.json",
            lust: "game_assets/spritesheets/lust.json",
            pride: "game_assets/spritesheets/pride.json",
            sloth: "game_assets/spritesheets/sloth.json",
            wrath: "game_assets/spritesheets/wrath.json"
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
            enemyData: "game_assets/data/victory_enemy.json"
        }
        this.level_tilemap = {
            envyLevel: "game_assets/tilemaps/victory_level.json"
        }
        this.next_level_constructor = MainMenu;
        this.retry_level_constructor = VictoryLevel;
        this.has_shop = false;
        this.player_start_pos = new Vec2(449, 955); //spawn pos
        // this.player_start_pos = new Vec2(1008, 1556); // // boss
        this.player_speed = 150;
        this.level_text_color = new Color(183, 136, 227);
        this.start_level_text = "Victory Valley";
        this.end_level_text = "Congratulations!"
        this.has_boss_room = false;
        this.victory_level = true;
    }


    startScene(): void {
        super.startScene();
        GameLevel.range = 100;

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

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1670, 968), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1670, 968), text: "Exit to the right ===>"});
        tutorial_label_1.font = "HellText";    
        tutorial_label_1.textColor = Color.BLACK;
        tutorial_label_1.fontSize = 30;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);

        let levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1954, 972), size: new Vec2(4 * 32, 5 * 32)});
        levelEndArea.addPhysics(undefined, undefined, false, true);
        levelEndArea.setTrigger("player", Game_Events.PLAYER_ENTERED_LEVEL_END, null);
        levelEndArea.color = new Color(0, 0, 0, 0);
    }
}
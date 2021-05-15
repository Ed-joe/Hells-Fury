import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Color from "../Wolfie2D/Utils/Color";
import GameLevel from "./GameLevel";
import GluttonyLevel from "./GluttonyLevel";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import Rect from "../Wolfie2D/Nodes/Graphics/Rect";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Input from "../Wolfie2D/Input/Input";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import LustLevel from "./LustLevel";
import OrthogonalTilemap from "../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";


export default class WrathLevel extends GameLevel {
    private total_enemies: number;      // total number of enemies

    initScene(init: Record<string, any>): void {
        super.initScene(init);

        // TODO
        this.level_music_key = "gluttony_music";
        this.level_music_path = "game_assets/sounds/music/gluttony.mp3";
        this.boss_audios = {
            wrath_attack: "game_assets/sounds/gluttony_attack.mp3",
            wrath_damage: "game_assets/sounds/gluttony_damage.mp3",
            wrath_death: "game_assets/sounds/gluttony_death.mp3"
        }


        this.boss_sprite = {
            wrath: "game_assets/spritesheets/wrath.json"
        }

        // TODO
        this.boss_attack_image = {
            slam: "game_assets/spritesheets/smash.png"
        }
        this.boss_attack_sprite = {
            slam: "game_assets/spritesheets/smash.json"
        }


        this.enemy_data = {
            enemyData: "game_assets/data/wrath_enemy.json"
        }
        this.level_tilemap = {
            wrathLevel: "game_assets/tilemaps/wrath_level.json"
        }
        this.next_level_constructor = GluttonyLevel
        this.shop_pos = new Vec2(383, 959);
        // this.player_start_pos = new Vec2(1026, 1874);
        this.player_start_pos = new Vec2(880, 418);
        this.player_speed = 150;
        this.player_slippery = false;

        // TODO
        this.level_text_color = new Color(95, 90, 76);


        this.start_level_text = "Wrath's Wretched Wasteland";
        this.end_level_text = "Wrath has been defeated!";
        this.boss_room_pos = new Vec2(1024, 432);
        this.boss_room_size = new Vec2(6 * 32, 3 * 32);
        this.upper_boss_door = [new Vec2(976, 528), new Vec2(1008, 528), new Vec2(1040, 528), new Vec2(1072, 528)];
        this.lower_boss_door = [new Vec2(976, 560), new Vec2(1010, 560), new Vec2(1038, 560), new Vec2(1072, 560)];
    }

    startScene(): void {
        super.startScene();

        this.total_enemies = this.enemies.length;
        this.initializeLabels();
    }

    updateScene(deltaT: number): void {
        let scene_options = {
            health: 5,
            coins: 0,
            damage: 1
        }
        let physics_options = {
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

        if(Input.isJustPressed("lust")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(LustLevel, scene_options, physics_options);
        }else if(Input.isJustPressed("gluttony")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
            this.sceneManager.changeToScene(GluttonyLevel, scene_options, physics_options);
        }
        
        let enemies_killed = this.total_enemies - this.enemies.length;
        if (enemies_killed === 2) {
            this.openDoor([new Vec2(976, 1264), new Vec2(1008, 1264), new Vec2(1040, 1264), new Vec2(1072, 1264), new Vec2(976, 1232), new Vec2(1008, 1232), new Vec2(1040, 1232), new Vec2(1072, 1232)], [])
        }
        if (enemies_killed === 3) {
            this.openDoor([new Vec2(1168, 1042), new Vec2(1168, 1074), new Vec2(1168, 1106), new Vec2(1168, 1138)], [new Vec2(1168, 1010)])
        }
        if (enemies_killed === 5) {
            this.openDoor([new Vec2(1488, 1042), new Vec2(1488, 1074), new Vec2(1488, 1106), new Vec2(1488, 1138)], [new Vec2(1488, 1010)])
        }
        if (enemies_killed === 6) {
            this.openDoor([new Vec2(880, 1042), new Vec2(880, 1074), new Vec2(880, 1106), new Vec2(880, 1138)], [new Vec2(880, 1010)])
        }
        if (enemies_killed === 8) {
            this.openDoor([new Vec2(560, 1042), new Vec2(560, 1074), new Vec2(560, 1106), new Vec2(560, 1138)], [new Vec2(560, 1010)])
        }
        if (enemies_killed === 9) {
            this.openDoor([new Vec2(976, 910), new Vec2(1008, 910), new Vec2(1040, 910), new Vec2(1072, 910), new Vec2(976, 878), new Vec2(1008, 878), new Vec2(1040, 878), new Vec2(1072, 878)], [])
        }
        if (enemies_killed === 11) {
            this.openDoor([new Vec2(976, 560), new Vec2(1008, 560), new Vec2(1040, 560), new Vec2(1072, 560), new Vec2(976, 528), new Vec2(1008, 528), new Vec2(1040, 528), new Vec2(1072, 528)], [])
            this.total_enemies = 0;
        }



        super.updateScene(deltaT);
    }

    protected openDoor(remove_tiles: Vec2[], lower_walls: Vec2[]): void {
        let tilemap = this.getTilemap("Wall") as OrthogonalTilemap;
        for(let v of remove_tiles) {
            let tile_coords = tilemap.getColRowAt(v);
            tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 0);
        }
        for(let v of lower_walls) {
            let tile_coords = tilemap.getColRowAt(v);
            tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 18);
        }
    }

    protected initializeLabels(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        
    }
}
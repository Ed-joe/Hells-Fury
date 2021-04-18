import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../Wolfie2D/Scene/Scene";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import OrthogonalTilemap from "../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import PositionGraph from "../Wolfie2D/DataTypes/Graphs/PositionGraph";
import Navmesh from "../Wolfie2D/Pathfinding/Navmesh";
import RegistryManager from "../Wolfie2D/Registry/RegistryManager";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../Wolfie2D/Utils/Color";
import Input from "../Wolfie2D/Input/Input";
import PlayerController from "../AI/PlayerController";

export default class GluttonyLevel extends Scene {
    private player: AnimatedSprite;         // the player
    private enemies: Array<AnimatedSprite>  // list of enemies
    private walls: OrthogonalTilemap        // the wall layer

    // use initScene to differentiate between level select start and game continue?
    
    loadScene() {
        // load the player and enemy spritesheets
        // TODO PROJECT - switch with correct sprites
        this.load.spritesheet("player", "game_assets/spritesheets/player.json");
        // TODO PROJECT - add enemy spritesheets

        // load the tilemap
        // TODO PROJECT - switch with correct tilemap
        this.load.tilemap("gluttonyLevel", "game_assets/tilemaps/cse_380_hw3_map.json");
    }

    startScene() {
        // Add in the tilemap
        let tilemap_layers = this.add.tilemap("gluttonyLevel");

        // get the wall layer
        this.walls = <OrthogonalTilemap>tilemap_layers[1].getItems()[0];

        // set the viewport bounds to the tilemap
        let tilemap_size: Vec2 = this.walls.size;
        this.viewport.setBounds(0, 0, tilemap_size.x, tilemap_size.y);

        // add primary layer
        this.addLayer("primary", 10);

        this.initializePlayer();

        // TODO PROJECT - write initializeEnemies()
        // this.initializeEnemies();

        // setup viewport
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(3);

        // TODO PROJECT - receiver subscribe to events
        // this.receiver.subscribe(EVENTSTRING);
    }

    updateScene(deltaT: number): void {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

        }
    }

    initializePlayer(): void {
        // Create the player
        this.player = this.add.animatedSprite("player", "primary");
        this.player.position.set(2*16, 62*16);
        this.player.addPhysics(new AABB(Vec2.ZERO, new Vec2(5, 5)));
        this.player.addAI(PlayerController,
            {
                speed: 100,
                slippery: true
            });
        this.player.animation.play("IDLE");
    }
}
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
import BatAI from "../AI/BatAI";

export default class GluttonyLevel extends Scene {
    private player: AnimatedSprite;         // the player
    private enemies: Array<AnimatedSprite>  // list of enemies
    private walls: OrthogonalTilemap        // the wall layer

    // use initScene to differentiate between level select start and game continue?
    
    loadScene() {
        // load the player and enemy spritesheets
        this.load.spritesheet("player", "game_assets/spritesheets/zara.json");

        // TODO PROJECT - add enemy spritesheets
        // Load in the enemy info
        this.load.spritesheet("hellbat", "game_assets/spritesheets/hellbat.json");
        this.load.object("enemyData", "game_assets/data/enemy.json");

        // load the tilemap
        // TODO PROJECT - switch with correct tilemap
        this.load.tilemap("gluttonyLevel", "game_assets/tilemaps/hells_fury.json");

        // load weapon info
        this.load.object("weaponData", "game_assets/data/weapon_data.json");
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
        this.initializeEnemies();

        this.initializeWeapons();

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
        this.player.position.set(30*16, 62*16);
        this.player.addPhysics(new AABB(new Vec2(0, 0), new Vec2(8, 16)));
        this.player.addAI(PlayerController,
            {
                speed: 150,
                slippery: true
            });
        this.player.animation.play("IDLE", true);
    }

    initializeEnemies(){
        // Get the enemy data
        const enemyData = this.load.getObject("enemyData");

        // Create an enemies array
        this.enemies = new Array(enemyData.numEnemies);

        // Initialize the enemies
        for(let i = 0; i < enemyData.numEnemies; i++){
            let data = enemyData.enemies[i];

            // Create an enemy
            this.enemies[i] = this.add.animatedSprite("hellbat", "primary");
            this.enemies[i].position.set(data.position[0], data.position[1]);
            this.enemies[i].animation.play("IDLE");

            // Activate physics
            //Only one enemy for now
            this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(9, 7)));


            let enemyOptions = {
                health: data.health,
                player: this.player,
            }

            this.enemies[i].addAI(BatAI, enemyOptions);
        }
    }

    initializeWeapons(): void {
        let weapon_data = this.load.getObject("weaponData");
    }
}
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
import Weapon from "../GameSystems/Weapon";
import BattleManager from "../GameSystems/BattleManager";
import WeaponType from "../GameSystems/WeaponTypes/WeaponType"
import BattlerAI from "../AI/BattlerAI";
import GluttonyAI from "../AI/GluttonyAI";
import { Game_Events } from "./../GameSystems/game_enums";
import Game from "../Wolfie2D/Loop/Game";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import { TweenableProperties } from "./../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "./../Wolfie2D/Utils/EaseFunctions";
import GameOver from "./GameOver"

export default class GluttonyLevel extends Scene {
    private player: AnimatedSprite;         // the player
    private player_health: number;          // players health
    private player_coins: number;           // PROJECT TODO - implement coin functionality
    private enemies: Array<AnimatedSprite> ; // list of enemies
    private walls: OrthogonalTilemap ;       // the wall layer
    private battle_manager: BattleManager;   // battle manager
    private health_sprites: Sprite[];        //sprites for health
    private level_start_label: Label;        //Label for when the level starts
    private disablePause: boolean;           //Dont let pause while tru >:)
    // use initScene to differentiate between level select start and game continue?
    initScene(init: Record<string, any>): void {
        this.player_health = init.health;
        this.player_coins = init.coins;
    }
    
    loadScene() {
        // load the player and enemy spritesheets
        this.load.spritesheet("player", "game_assets/spritesheets/zara.json");
        //Load Zaras Heart image
        this.load.image("heart", "game_assets/images/heart.png");
        // TODO PROJECT - add enemy spritesheets
        // Load in the enemy info
        this.load.spritesheet("hellbat", "game_assets/spritesheets/hellbat.json");
        this.load.spritesheet("gluttony", "game_assets/spritesheets/gluttony.json");
        this.load.spritesheet("boss_hitbox", "game_assets/spritesheets/boss_hitbox.json");
        this.load.object("enemyData", "game_assets/data/enemy.json");

        // load the tilemap
        // TODO PROJECT - switch with correct tilemap
        this.load.tilemap("gluttonyLevel", "game_assets/tilemaps/hells_fury.json");

        // load weapon info
        this.load.object("weaponData", "game_assets/data/weapon_data.json");

        this.load.image("fist", "game_assets/spritesheets/impact.png");
        this.load.spritesheet("fist", "game_assets/spritesheets/impact.json");

        //Load pause screen
        this.load.image("pauseScreen", "game_assets/images/pause_background.png");
        this.load.image("slam", "game_assets/spritesheets/smash.png");
        this.load.spritesheet("slam", "game_assets/spritesheets/smash.json");
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

        //Add pause screen layer
        const center = this.viewport.getCenter();
        this.addUILayer("Pause").disable();
        let hb = this.add.sprite("pauseScreen", "Pause");
        hb.position.set(hb.size.x/2, hb.size.y/2)
        // const new_game_button = this.add.uiElement(UIElementType.BUTTON, "Pause", {position: new Vec2(center.x, center.y), text: ""});
        // new_game_button.size.set(330, 70);
        // new_game_button.borderWidth = 2;
        // new_game_button.borderColor = Color.WHITE;
        // new_game_button.backgroundColor = Color.TRANSPARENT;
        // new_game_button.onClickEventId = "newGame";

        // Add a layer for UI
        this.addUILayer("UI");
        this.addUI();

        this.battle_manager = new BattleManager;

        this.initializeWeapons();

        this.initializePlayer();

        // TODO PROJECT - write initializeEnemies()
        this.initializeEnemies();

        this.battle_manager.setPlayer(<BattlerAI>this.player._ai);
        this.battle_manager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));


        // setup viewport
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(2);

        //Into label
        this.player.freeze();
        
        this.disablePause = true;
        this.level_start_label.tweens.play("slideIn");

        // TODO PROJECT - receiver subscribe to events
        this.subscribeToEvents();
    }

    updateScene(deltaT: number): void {
        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch(event.type){
                case Game_Events.BAT_COLLISION:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));

                        let bat_pos = Vec2.ZERO;
                        if(node === this.player) {
                            // other is bat
                            bat_pos = other.position;
                        } else {
                            // node is bat
                            bat_pos = node.position;
                        }
                        
                        event.data.add("batPosition", bat_pos);

                        node._ai.handleEvent(event);
                        other._ai.handleEvent(event);
                    }
                    break;

                case Game_Events.GLUT_ATTACK:
                    {
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].imageId === "Gluttony"){
                                this.enemies[i]._ai.handleEvent(new GameEvent(Game_Events.GLUT_ATTACK));
                                break;
                            }
                        }
                    }
                    break;

                case Game_Events.BOSS_COLLISION:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));
    
                        let boss_pos = Vec2.ZERO;
                        if(node === this.player) {
                            // other is bat
                            boss_pos = other.position;
                        } else {
                            // node is bat
                            boss_pos = node.position;
                        }
                            
                        event.data.add("bossPosition", boss_pos);
    
                        node._ai.handleEvent(event);
                        other._ai.handleEvent(event);
                    }
                    break;

                case Game_Events.ENEMY_DIED:
                    {   
                        let node = this.sceneGraph.getNode(event.data.get("owner"));
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].id === (<AnimatedSprite> node).id){
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        this.battle_manager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));
                        console.log(this.enemies);
                        node.destroy();
                    }
                    break;

                case Game_Events.BOSS_DIED:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("owner"));
                        let node2 = this.sceneGraph.getNode(event.data.get("owner"));
                        for(let i = 0; i < this.enemies.length ; i++){
                            console.log(this.enemies[i].imageId);
                            if(this.enemies[i].id === (<AnimatedSprite> node).id){
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].imageId === "Boss_hitbox"){
                                node2 = this.sceneGraph.getNode(this.enemies[i].id);
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        this.battle_manager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));
                        console.log(this.enemies);
                        if(node2 != node) {
                            node2.destroy();
                        }
                        node.destroy();
                    }
                    break;

                case Game_Events.IFRAMES_OVER:
                    {
                        this.player._ai.handleEvent(new GameEvent(Game_Events.IFRAMES_OVER, {}));
                    }
                    break;

                case Game_Events.INTRO_END:
                    {
                        this.disablePause = false;
                        this.player.unfreeze();
                        this.level_start_label.visible = false;
                    }
                    break;
                case Game_Events.ON_PAUSE:
                    {   
                        if(!this.disablePause){
                            for(let enemy of this.enemies){
                                enemy.freeze();
                            }
                            this.player.freeze();
                            this.viewport.setZoomLevel(1);
                            this.getLayer("Pause").enable();
                        }
                    }
                    break;
                case Game_Events.ON_UNPAUSE:
                    {   
                        for(let enemy of this.enemies){
                            enemy.unfreeze();
                        }
                        this.player.unfreeze();
                        this.viewport.setZoomLevel(2);
                        this.getLayer("Pause").disable();
                    }
                    break;
                case Game_Events.GAME_OVER:
                    {
                        console.log("GAME OVER");
                        this.viewport.stopFollow();
                        this.viewport.setZoomLevel(1);
                        this.sceneManager.changeToScene(GameOver, {});
                    }
                    break;
            }
        }
    }

    initializePlayer(): void {
        // Create the player
        this.player = this.add.animatedSprite("player", "primary");
        this.player.position.set(1018, 330);
        this.player.addPhysics(new AABB(new Vec2(0, 14), new Vec2(16, 15)), new Vec2(0, 15));
        let fist = this.createWeapon("punch");
        this.player.addAI(PlayerController,
            {
                speed: 150,
                fist: fist,
                slippery: true,
                health: this.player_health,
                coins: this.player_coins,
                health_sprites: this.health_sprites
            });
        this.player.animation.play("IDLE", true);
        this.player.setGroup("player");
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
            this.enemies[i] = this.add.animatedSprite(data.enemy_type, "primary");
            this.enemies[i].position.set(data.position[0], data.position[1]);
            this.enemies[i].animation.play("IDLE");

            let enemyOptions = {
                health: data.health,
                player: this.player,
            }

            // Activate physics
            //Only one enemy for now
            if(data.enemy_type === "hellbat") {
                this.enemies[i].addPhysics();
                this.enemies[i].addAI(BatAI, enemyOptions);
                
                // this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(9, 7)));
                
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.BAT_COLLISION, "bat hit player");
            }
            else if(data.enemy_type ===  "gluttony") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    slam: this.createWeapon("slam")
                }
                this.enemies[i].addAI(GluttonyAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(56, 56)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    slam: this.createWeapon("slam")
                }
                this.enemies[i].addAI(GluttonyAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(50, 50)));
            }

        }
    }

    initializeWeapons(): void {
        let weapon_data = this.load.getObject("weaponData");

        for(let i = 0; i < weapon_data.numWeapons; i++) {
            let weapon = weapon_data.weapons[i];

            let constr = RegistryManager.getRegistry("weaponTemplates").get(weapon.weaponType);

            let weaponType = new constr();

            weaponType.initialize(weapon);

            RegistryManager.getRegistry("weaponTypes").registerItem(weapon.name, weaponType);
        }
    }

    createWeapon(type: string): Weapon {
        let weaponType = <WeaponType>RegistryManager.getRegistry("weaponTypes").get(type);

        let sprite = this.add.sprite(weaponType.sprite_key, "primary");

        return new Weapon(sprite, weaponType, this.battle_manager);
    }

    protected addUI(){
        // Zara Health
        let prev_loc = new Vec2(2, 20);
        this.health_sprites = new Array<Sprite>();
        for(let i = 0; i < this.player_health; i++){
            let spriteToAdd = this.add.sprite("heart", "UI");
            spriteToAdd.position = new Vec2(prev_loc.x + 25, prev_loc.y);
            this.health_sprites.push(spriteToAdd);
            prev_loc = new Vec2(prev_loc.x + 25, prev_loc.y);
        }
        
        // End of level label (start off screen)
        this.level_start_label = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(-320, 100), text: "Gluttony's Greasy Grotto"});
        this.level_start_label.size.set(1280, 60);
        this.level_start_label.borderRadius = 0;
        this.level_start_label.backgroundColor = Color.BLACK;
        this.level_start_label.textColor = new Color(95, 90, 76);
        this.level_start_label.fontSize = 48;
        this.level_start_label.font = "HellText";

        // Add a tween to move the label on screen
        this.level_start_label.tweens.add("slideIn", {
            startDelay: 0,
            endDelay: 2000,
            duration: 2000,
            reverseOnComplete: true,
            effects: [
                {
                    property: TweenableProperties.posX,
                    start: -320,
                    end: 320,
                    ease: EaseFunctionType.OUT_SINE
                }
            ],
            onEnd: Game_Events.INTRO_END
        });
    }


    protected subscribeToEvents(){
        this.receiver.subscribe([
           Game_Events.ENEMY_DIED,
           Game_Events.BOSS_DIED,
           Game_Events.BAT_COLLISION,
           Game_Events.GAME_OVER,
           Game_Events.IFRAMES_OVER,
           Game_Events.INTRO_END,
           Game_Events.BOSS_COLLISION,
           Game_Events.ON_PAUSE,
           Game_Events.ON_UNPAUSE,
           Game_Events.GLUT_ATTACK
        ]);
    }
}
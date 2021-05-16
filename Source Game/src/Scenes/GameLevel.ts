import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../Wolfie2D/Scene/Scene";
import OrthogonalTilemap from "../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import RegistryManager from "../Wolfie2D/Registry/RegistryManager";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../Wolfie2D/Utils/Color";
import PlayerController from "../AI/PlayerController";
import BatAI from "../AI/BatAI";
import Weapon from "../GameSystems/Weapon";
import BattleManager from "../GameSystems/BattleManager";
import WeaponType from "../GameSystems/WeaponTypes/WeaponType"
import BattlerAI from "../AI/BattlerAI";
import GluttonyAI from "../AI/GluttonyAI";
import { Game_Events } from "./../GameSystems/game_enums";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import { TweenableProperties } from "./../Wolfie2D/Nodes/GameNode";
import { EaseFunctionType } from "./../Wolfie2D/Utils/EaseFunctions";
import GameOver from "./GameOver";
import Button from "../Wolfie2D/Nodes/UIElements/Button";
import Rect from "../Wolfie2D/Nodes/Graphics/Rect";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Input from "../Wolfie2D/Input/Input";
import Debug from "../Wolfie2D/Debug/Debug";
import HoundAI from "../AI/HoundAI";
import LustAI from "../AI/LustAI";
import Game from "../Wolfie2D/Loop/Game";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import LustLevel from "./LustLevel";
import GluttonyLevel from "./GluttonyLevel";
import MainMenu from "./MainMenu";
import WrathAI from "../AI/WrathAI";
import CoinEnemyAI from "../AI/CoinEnemyAI";
import GreedAI from "../AI/GreedAI";
import Idle from "../AI/PlayerStates/Idle";
import EnvyAI from "../AI/EnvyAI";

export default class GameLevel extends Scene {
    private player: AnimatedSprite;         // the player
    private player_health: number;          // players health
    private player_coins: number;           // PROJECT TODO - implement coin functionality
    private player_damage: number;          // damage per punch
    enemies: Array<AnimatedSprite> ; // list of enemies
    private walls: OrthogonalTilemap ;       // the wall layer
    private battle_manager: BattleManager;   // battle manager
    private health_sprites: Sprite[];        //sprites for health
    private level_start_label: Label;        //Label for when the level starts
    private disablePause: boolean;           //Dont let pause while tru >:)\
    private shop_zone: Rect                 //Zone of the shop
    private in_shop_zone: boolean           //if its in the shop zone
    private shop_prompt: Label              //Shop prompt
    private coin_count_label: Label         //Coin count label
    private boss_room: Rect                 //Boss room door trigger
    private MAX_COINS: number = 99;         // max coins for the player to hold at once
    private level_end_label: Label;        //Label for when the level ends
    
    tutorial_labels: Label[];
    tutorial_zones: Rect[];
    level_music_key: string;
    level_music_path: string;
    boss_audios: Record<string, string>;
    boss_sprite: Record<string, string>;
    boss_attack_image: Record<string, string>;
    boss_attack_sprite: Record<string, string>;
    enemy_data: Record<string, string>;
    level_tilemap: Record<string, string>;
    next_level_constructor: new (...args: any) => Scene;
    shop_pos: Vec2;
    player_start_pos: Vec2;
    player_speed: number;
    player_slippery: boolean;
    start_level_text: string;
    end_level_text: string;
    level_text_color: Color;
    boss_room_pos: Vec2;
    boss_room_size: Vec2;
    upper_boss_door: Vec2[];
    lower_boss_door: Vec2[];
    coin_hurt: boolean;
    has_shop: boolean;
    greed_tiles: boolean;

    // use initScene to differentiate between level select start and game continue?
    initScene(init: Record<string, any>): void {
        this.player_health = init.health;
        this.player_coins = init.coins;
        this.coin_hurt = false;
        this.player_slippery = false;
        this.player_damage = init.damage;
        this.has_shop = true;
        this.greed_tiles = false;
    }
    
    loadScene() {
        //Load Music
        this.load.audio(this.level_music_key, this.level_music_path);

        // load the player and enemy spritesheets
        this.load.spritesheet("player", "game_assets/spritesheets/zara.json");
        //Load Zaras Heart image and sounds
        this.load.image("heart", "game_assets/images/heart.png");
        this.load.image("static_coin", "game_assets/spritesheets/coin.png");
        this.load.audio("zara_punch", "game_assets/sounds/zara_punch.mp3");
        this.load.audio("zara_damage", "game_assets/sounds/zara_damage.mp3");
        this.load.audio("zara_death", "game_assets/sounds/zara_death.mp3");

        // TODO PROJECT - add enemy spritesheets
        // Load in the enemy info

        //Gluttony
        for(let key in this.boss_sprite) {
            this.load.spritesheet(key, this.boss_sprite[key])
        }

        for(let key in this.boss_audios) {
            this.load.audio(key, this.boss_audios[key]);
        }
        
        //coin
        this.load.spritesheet("coin", "game_assets/spritesheets/coin.json");
        this.load.audio("coin_pickup", "game_assets/sounds/coin_pickup.mp3");

        // shop fist image
        this.load.image("shop_fist", "game_assets/images/fist.png");

        //Hound
        this.load.spritesheet("hellhound", "game_assets/spritesheets/hellhound.json");
        this.load.audio("hound_damage", "game_assets/sounds/hound_damage.mp3");
        this.load.audio("hound_death", "game_assets/sounds/hound_death.mp3");


        for(let key in this.enemy_data) {
            this.load.object(key, this.enemy_data[key]);
        }

        this.load.spritesheet("shopkeep", "game_assets/spritesheets/shopkeep.json");

        //boss door audio
        this.load.audio("boss_door_close", "game_assets/sounds/boss_door_close.mp3");

        //Load bat audio
        this.load.spritesheet("hellbat", "game_assets/spritesheets/hellbat.json");
        this.load.audio("bat_death", "game_assets/sounds/bat_death.mp3");
        this.load.audio("bat_damage", "game_assets/sounds/bat_damage.mp3");

        //load shop screen
        this.load.image("shop_ui", "game_assets/images/shop_ui.png")

        // load the tilemap
        // TODO PROJECT - switch with correct tilemap
        for(let key in this.level_tilemap) {
            this.load.tilemap(key, this.level_tilemap[key]);
        }

        // load weapon info
        this.load.object("weaponData", "game_assets/data/weapon_data.json");

        this.load.image("fistOne", "game_assets/spritesheets/impact.png");
        this.load.spritesheet("fistOne", "game_assets/spritesheets/impact.json");
        this.load.image("fistTwo", "game_assets/spritesheets/impact_purple.png");
        this.load.spritesheet("fistTwo", "game_assets/spritesheets/impact_purple.json");
        this.load.image("fistThree", "game_assets/spritesheets/impact_blue.png");
        this.load.spritesheet("fistThree", "game_assets/spritesheets/impact_blue.json");

        //Load pause screen
        this.load.image("pauseScreen", "game_assets/images/pause_background.png");

        for(let key in this.boss_attack_image) {
            this.load.image(key, this.boss_attack_image[key]);
        }

        for(let key in this.boss_attack_sprite) {
            this.load.spritesheet(key, this.boss_attack_sprite[key]);
        }
    }

    startScene() {
        // Add in the tilemap
        let tilemap_layers = this.add.tilemap(Object.keys(this.level_tilemap)[0]);
        // let tilemap_layers = this.add.tilemap("gluttonyLevel");

        // get the wall layer
        this.walls = <OrthogonalTilemap>tilemap_layers[1].getItems()[0];

        // set the viewport bounds to the tilemap
        let tilemap_size: Vec2 = this.walls.size;
        this.viewport.setBounds(0, 0, tilemap_size.x, tilemap_size.y);

        // add primary layer
        this.addLayer("primary", 10);
        this.addLayer("above", 11);
        this.addLayer("below", 9);

        //Add pause screen layer
        this.addUILayer("Pause").disable();
        let hb = this.add.sprite("pauseScreen", "Pause");
        hb.position.set(hb.size.x/2, hb.size.y/2)

        // Add a layer for UI
        this.addUILayer("UI");
        this.addUI();

        this.battle_manager = new BattleManager;

        this.initializeWeapons();

        this.initializePlayer();

        //Add Shop layer and other shop initialization
        this.initializeShop(this.shop_pos);

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
        
        this.initializeBossRoom();

        //receiver subscribe to events
        this.subscribeToEvents();

        //music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: this.level_music_key, loop: true, holdReference: true});

    }

    updateScene(deltaT: number): void {
        Debug.log(" " + this.player.position.x + this.player.position.y);
        this.player_health = this.health_sprites.length

        for (let i = 0; i < this.tutorial_zones.length; i++) {
            if(this.player.boundary.overlaps(this.tutorial_zones[i].boundary)) {
                this.tutorial_labels[i].visible = true;
            } else {
                this.tutorial_labels[i].visible = false;
            }
        }

        if (this.has_shop && (!this.player.boundary.overlaps(this.shop_zone.boundary)) && this.in_shop_zone){
            this.in_shop_zone = false;
            this.shop_prompt.visible = false;
        }

        if(!this.player.frozen && Input.isJustPressed("interact") && this.in_shop_zone){
            this.disablePause = true;
            for(let enemy of this.enemies){
                enemy.freeze();
            }
            this.player.freeze();
            this.getLayer("shop").enable();
        }else if(Input.isJustPressed("interact") && this.in_shop_zone && this.player.frozen){
            this.getLayer("shop").disable();
            this.player.unfreeze();
            for(let enemy of this.enemies){
                enemy.unfreeze();
            }
            this.disablePause = false;
        }

        if(Input.isJustPressed("coins")) {
            this.player_coins += 5;
            this.player_coins = Math.min(this.player_coins, this.MAX_COINS);
            this.coin_count_label.text =  " :  " + this.player_coins;
            for(let i = 0; i < 5; i++) {
                this.player._ai.handleEvent(new GameEvent(Game_Events.GET_COIN, {}));
            }
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

        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            switch(event.type){
                case Game_Events.ENEMY_COLLISION:
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
                        let enemy_position = node.position;
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].id === (<AnimatedSprite> node).id){
                                this.enemies.splice(i, 1);
                                break;
                            }
                        }
                        this.battle_manager.setEnemies(this.enemies.map(enemy => <BattlerAI>enemy._ai));
                        node.destroy();

                        // drop a coin
                        let coin = this.add.animatedSprite("coin", "primary");
                        coin.position.set(enemy_position.x, enemy_position.y);
                        coin.addPhysics(coin.boundary, Vec2.ZERO, false);
                        coin.animation.play("IDLE", true);
                        coin.setGroup("coin");
                        coin.setTrigger("player", Game_Events.GET_COIN, "player pick up coin");
                    }
                    break;

                case Game_Events.GET_COIN:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("node"));
                        let other = this.sceneGraph.getNode(event.data.get("other"));

                        if(node === this.player) {
                            // node is player
                            other.destroy();
                        } else {
                            // other is player
                            node.destroy();
                        }
                        this.player_coins++;
                        this.player_coins = Math.min(this.player_coins, this.MAX_COINS);
                        this.coin_count_label.text =  " :  " + this.player_coins;
                        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "coin_pickup", loop: false, holdReference: false})
                        this.player._ai.handleEvent(new GameEvent(Game_Events.GET_COIN, {coin_hurt: String(this.coin_hurt)}));
                    }
                    break;

                case Game_Events.ENTER_BOSS_FIGHT:
                    {
                        this.boss_room.removePhysics();
                        let tilemap = this.getTilemap("Wall") as OrthogonalTilemap;
                        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "boss_door_close", loop: false, holdReference: false})
                        for(let v of this.upper_boss_door) {
                            let tile_coords = tilemap.getColRowAt(v);
                            // let tile_world_pos = tilemap.getTileWorldPosition(tile_coords.y * tilemap.getDimensions().x + tile_coords.x);
                            if(this.greed_tiles){ 
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 45);
                            }else{
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 19);
                            }
                        }
                        for(let v of this.lower_boss_door) {
                            let tile_coords = tilemap.getColRowAt(v);
                            // let tile_world_pos = tilemap.getTileWorldPosition(tile_coords.y * tilemap.getDimensions().x + tile_coords.x);
                            if(this.greed_tiles){ 
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 44);
                            }else{
                                tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 18);
                            }
                        }
                    }
                    break;

                case Game_Events.BOSS_DIED:
                    {
                        let node = this.sceneGraph.getNode(event.data.get("owner"));
                        let node2 = this.sceneGraph.getNode(event.data.get("owner"));
                        for(let i = 0; i < this.enemies.length ; i++){
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
                        if(node2 != node) {
                            node2.destroy();
                        }
                        node.destroy();
                        this.level_end_label.tweens.play("slideIn");
                    }
                    break;

                case Game_Events.NEXT_LEVEL:
                    {
                        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
                        this.viewport.stopFollow();
                        this.viewport.setZoomLevel(1);
                        this.sceneManager.changeToScene(this.next_level_constructor, {
                                health: this.player_health,
                                coins: this.player_coins,
                                damage: this.player_damage
                            }, physics_options);
                    }
                    break;

                case Game_Events.IFRAMES_OVER:
                    {
                        this.player._ai.handleEvent(new GameEvent(Game_Events.IFRAMES_OVER, {}));
                    }
                    break;

                case Game_Events.ATTACK_OVER:
                    {
                        this.player._ai.handleEvent(new GameEvent(Game_Events.ATTACK_OVER, {}));
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
                            this.getLayer("UI").disable();
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
                        this.getLayer("UI").enable();
                        this.getLayer("Pause").disable();
                    }
                    break;
                case Game_Events.GAME_OVER:
                    {
                        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.level_music_key});
                        this.viewport.stopFollow();
                        this.viewport.setZoomLevel(1);
                        this.sceneManager.changeToScene(GameOver, {});
                    }
                    break;
                case Game_Events.ENTERED_SHOP:
                    {
                        if(!this.in_shop_zone){
                            this.in_shop_zone = true;
                            this.shop_prompt.visible = true;
                        }
                    }
                    break;
                case Game_Events.BOUGHT_HEART:
                    {
                        if (this.player_coins >= 5 && this.player_health < 10){
                            this.player_coins -= 5;
                            let spriteToAdd = this.add.sprite("heart", "UI");
                            let prev_sprite = this.health_sprites[this.health_sprites.length - 1];
                            spriteToAdd.position = new Vec2(prev_sprite.position.x + 25, prev_sprite.position.y);
                            this.health_sprites.push(spriteToAdd);
                            this.player_health += 1
                            this.coin_count_label.text =  ": " + this.player_coins;
                            this.player._ai.handleEvent(new GameEvent(Game_Events.BOUGHT_HEART, {}));
                        }
                    }
                    break;
                case Game_Events.GREED_ATTACK:
                    {
                        let positionX = this.player.position.x;
                        let positionY = this.player.position.y;
                        let greed_position = this.sceneGraph.getNode(event.data.get("owner")).position;
                        let coin1 = this.add.animatedSprite("coin", "above");
                        coin1.addPhysics(coin1.boundary, Vec2.ZERO, false);
                        coin1.position.set(greed_position.x, greed_position.y);
                        coin1.animation.play("IDLE", true);
                        coin1.setGroup("coin");
                        coin1.setTrigger("player", Game_Events.GET_COIN, "player pick up coin");
                        let coin1_vel = greed_position.dirTo(new Vec2(positionX, positionY)).scale(3.5);
                        coin1.addAI(CoinEnemyAI, {player: this.player, velocityX: coin1_vel.x, velocityY: coin1_vel.y});
                        let coin2 = this.add.animatedSprite("coin", "above");
                        coin2.addPhysics(coin2.boundary, Vec2.ZERO, false);
                        coin2.position.set(greed_position.x, greed_position.y);
                        coin2.animation.play("IDLE", true);
                        coin2.setGroup("coin");
                        coin2.setTrigger("player", Game_Events.GET_COIN, "player pick up coin");
                        let coin2_vel = greed_position.dirTo(new Vec2(positionX - 64, positionY)).scale(3);
                        coin2.addAI(CoinEnemyAI, {player: this.player, velocityX: coin2_vel.x , velocityY: coin2_vel.y});
                        let coin3 = this.add.animatedSprite("coin", "above");
                        coin3.addPhysics(coin3.boundary, Vec2.ZERO, false);
                        coin3.position.set(greed_position.x, greed_position.y);
                        coin3.animation.play("IDLE", true);
                        coin3.setGroup("coin");
                        coin3.setTrigger("player", Game_Events.GET_COIN, "player pick up coin");
                        let coin3_vel = greed_position.dirTo(new Vec2(positionX + 64, positionY)).scale(3);
                        coin3.addAI(CoinEnemyAI, {player: this.player, velocityX: coin3_vel.x, velocityY: coin3_vel.y});
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].imageId === "Greed"){
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;

                case Game_Events.WRATH_ATTACK_DOWN:
                    {
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].imageId === "Wrath"){
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;
                case Game_Events.WRATH_ATTACK_UP:
                    {
                        for(let i = 0; i < this.enemies.length ; i++){
                            if(this.enemies[i].imageId === "Wrath"){
                                this.enemies[i]._ai.handleEvent(event);
                                break;
                            }
                        }
                    }
                    break;

                case Game_Events.BOUGHT_DAMAGE:
                    {
                        if (this.player_coins >= 10 && this.player_damage < 3) {
                            this.player_coins -= 10;
                            this.player_damage++;
                            this.coin_count_label.text =  ": " + this.player_coins;
                            this.player._ai.handleEvent(event);
                        }
                    }
                    break;
            }
        }
    }

    initializePlayer(): void {
        // Create the player
        this.player = this.add.animatedSprite("player", "primary");
        this.player.position.set(this.player_start_pos.x, this.player_start_pos.y);
        // this.player.position.set(1018, 330);
        this.player.addPhysics(new AABB(new Vec2(0, 14), new Vec2(16, 15)), new Vec2(0, 15));
        let fist1 = this.createWeapon("punch1");
        let fist2 = this.createWeapon("punch2");
        let fist3 = this.createWeapon("punch3");
        let invincible_label = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(585, 280), text: "INVINCIBLE"});
        invincible_label.textColor = Color.BLACK;
        invincible_label.font = "HellText";
        invincible_label.visible = false;
        this.player.addAI(PlayerController,
            {
                speed: this.player_speed,
                fists: [fist1, fist2, fist3],
                slippery: this.player_slippery,
                health: this.player_health,
                coins: this.player_coins,
                damage: this.player_damage,
                health_sprites: this.health_sprites,
                invincible_cheat_label: invincible_label
            });
        this.player.animation.play("IDLE", true);
        this.player.setGroup("player");
    }

    initializeEnemies(){
        // Get the enemy data
        // const enemyData = this.load.getObject("enemyData");
        const enemyData = this.load.getObject(Object.keys(this.enemy_data)[0]);

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
            if(data.enemy_type === "hellbat") {
                this.enemies[i].addPhysics();
                this.enemies[i].addAI(BatAI, enemyOptions);
                
                // this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(9, 7)));
                
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.ENEMY_COLLISION, "bat hit player");
            }
            else if(data.enemy_type === "hellhound") {
                this.enemies[i].addAI(HoundAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(new Vec2(0, 14), new Vec2(30, 20)));

                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.ENEMY_COLLISION, "hound hit player");
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
            else if(data.enemy_type ===  "lust") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                }
                this.enemies[i].addAI(LustAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(56, 50)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
            }else if(data.enemy_type ===  "greed") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                }
                this.enemies[i].addAI(GreedAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(56, 56)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "wrath") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player,
                    slice: this.createWeapon("slice")
                }
                this.enemies[i].addAI(WrathAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(26, 44)), new Vec2(0, 20));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else if (data.enemy_type === "envy") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                    // slice: this.createWeapon("slice")
                }
                this.enemies[i].addAI(EnvyAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(26, 44)), new Vec2(0, 20));
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

    initializeShop(position: Vec2): void{
        if(this.has_shop){
            //Place shop keeper
            let shop_keep = this.add.animatedSprite("shopkeep", "primary");
            shop_keep.animation.play("IDLE", true);
            shop_keep.position = position;
            shop_keep.addPhysics(new AABB(new Vec2(0, 14), new Vec2(48, 40)));
            this.shop_zone = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(position.x, position.y + 24) , size: new Vec2(192, 128)});
            this.shop_zone.addPhysics(undefined, undefined, false, true);
            this.shop_zone.setTrigger("player", Game_Events.ENTERED_SHOP, Game_Events.EXITED_SHOP);
            this.shop_zone.color = new Color(0, 0, 0, 0);
        

            //Add shop prompt to main layer
            this.shop_prompt = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(position.x, position.y - 50), text: "Press 'E' to enter the shop"});
            this.shop_prompt.font = "HellText";    
            this.shop_prompt.textColor = Color.BLACK;
            this.shop_prompt.fontSize = 20;
            this.shop_prompt.size.set(30, 14);
            this.shop_prompt.borderWidth = 2;
            this.shop_prompt.borderColor = Color.TRANSPARENT;
            this.shop_prompt.backgroundColor = Color.TRANSPARENT;
            this.shop_prompt.visible = false;

            this.addUILayer("shop");

            // add heart contract on the left
            let heart_contract = this.add.sprite("shop_ui", "shop");
            heart_contract.position.set(200, 180);
            
            const buy_heart = <Button>this.add.uiElement(UIElementType.BUTTON, "shop", {position: new Vec2(200, 160), text: "5 Coins = "});
            buy_heart.font = "HellText";    
            buy_heart.textColor = Color.BLACK;
            buy_heart.fontSize = 42;
            buy_heart.size.set(250, 90);
            buy_heart.scale.set(1/2, 1/2);
            buy_heart.borderWidth = 2;
            buy_heart.borderColor = Color.TRANSPARENT;
            buy_heart.backgroundColor = new Color(233, 229, 158, .2);
            buy_heart.onClickEventId = Game_Events.BOUGHT_HEART;
            
            let contract_heart_image = this.add.sprite("heart", "shop");
            contract_heart_image.position.set(250, 160);

            // add damage contract on the right
            let damage_contract = this.add.sprite("shop_ui", "shop");
            damage_contract.position.set(440, 180);
            
            const buy_damage = <Button>this.add.uiElement(UIElementType.BUTTON, "shop", {position: new Vec2(440, 160), text: "10 Coins = "});
            buy_damage.font = "HellText";
            buy_damage.textColor = Color.BLACK;
            buy_damage.fontSize = 42;
            buy_damage.size.set(265, 90);
            buy_damage.padding = Vec2.ZERO;
            buy_damage.borderWidth = 2;
            buy_damage.borderColor = Color.TRANSPARENT;
            buy_damage.scale.set(1/2, 1/2);
            buy_damage.backgroundColor = new Color(233, 229, 158, .2);
            buy_damage.onClickEventId = Game_Events.BOUGHT_DAMAGE;
            
            let damage_contract_fist = this.add.sprite("shop_fist", "shop");
            damage_contract_fist.position.set(495, 160);

            // add e to exit to shop ui
            let shop_exit = <Label>this.add.uiElement(UIElementType.LABEL, "shop", {position: new Vec2(320, 300), text: "Press 'E' to exit the shop"});
            shop_exit.font = "HellText";    
            shop_exit.textColor = Color.BLACK;
            shop_exit.fontSize = 48;
            shop_exit.borderColor = Color.TRANSPARENT;
            shop_exit.backgroundColor = Color.TRANSPARENT;

            //Hide shop to start
            this.getLayer("shop").disable();
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

        console.log(RegistryManager.getRegistry("weaponTypes"));

        let sprite = null;
        if(type === "punch1" || type === "punch2" || type === "punch3") {
            sprite = this.add.sprite(weaponType.sprite_key, "above");
        } else {
            sprite = this.add.sprite(weaponType.sprite_key, "below");
        }

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
        
        let coin_sprite = this.add.sprite("static_coin", "UI");
        coin_sprite.position = new Vec2(575, 20);

        this.coin_count_label = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(595, 21), text: " :  " + this.player_coins});
        this.coin_count_label.font = "HellText";

        // End of level label (start off screen)
        this.level_start_label = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(-320, 100), text: this.start_level_text});
        this.level_start_label.size.set(1280, 60);
        this.level_start_label.borderRadius = 0;
        this.level_start_label.backgroundColor = Color.BLACK;
        this.level_start_label.textColor = this.level_text_color;
        this.level_start_label.fontSize = 48;
        this.level_start_label.font = "HellText";
        
        this.level_end_label = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(-320, 100), text: this.end_level_text});
        this.level_end_label.size.set(1280, 60);
        this.level_end_label.borderRadius = 0;
        this.level_end_label.backgroundColor = Color.BLACK;
        this.level_end_label.textColor = this.level_text_color;
        this.level_end_label.fontSize = 48;
        this.level_end_label.font = "HellText";

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

        this.level_end_label.tweens.add("slideIn", {
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
            onEnd: Game_Events.NEXT_LEVEL
        });
    }

    protected initializeBossRoom(): void {
        this.boss_room = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: this.boss_room_pos, size: this.boss_room_size});
        this.boss_room.addPhysics(undefined, undefined, false, true);
        this.boss_room.setTrigger("player", Game_Events.ENTER_BOSS_FIGHT, "enter boss fight");
        this.boss_room.color = Color.TRANSPARENT;
    }


    protected subscribeToEvents(){
        this.receiver.subscribe([
           Game_Events.ENEMY_DIED,
           Game_Events.BOSS_DIED,
           Game_Events.ENEMY_COLLISION,
           Game_Events.GAME_OVER,
           Game_Events.IFRAMES_OVER,
           Game_Events.INTRO_END,
           Game_Events.BOSS_COLLISION,
           Game_Events.ON_PAUSE,
           Game_Events.ON_UNPAUSE,
           Game_Events.GLUT_ATTACK,
           Game_Events.ATTACK_OVER,
           Game_Events.BOUGHT_HEART,
           Game_Events.BOUGHT_DAMAGE,
           Game_Events.ENTERED_SHOP,
           Game_Events.EXITED_SHOP,
           Game_Events.GET_COIN,
           Game_Events.ENTER_BOSS_FIGHT,
           Game_Events.NEXT_LEVEL,
           Game_Events.GREED_ATTACK,
           Game_Events.WRATH_ATTACK_UP,
           Game_Events.WRATH_ATTACK_DOWN
        ]);
    }
}
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
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import GluttonyLevel from "./GluttonyLevel";
import LustAI from "../AI/LustAI";

export default class LustLevel extends Scene {
    private player: AnimatedSprite;         // the player
    private player_health: number;          // players health
    private player_coins: number;           // PROJECT TODO - implement coin functionality
    private enemies: Array<AnimatedSprite> ; // list of enemies
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
    private MAX_COINS: number = 99;
    private tutorial_labels: Label[];
    private tutorial_zones: Rect[];

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
        this.load.image("static_coin", "game_assets/spritesheets/coin.png");
        // TODO PROJECT - add enemy spritesheets
        // Load in the enemy info
        this.load.spritesheet("hellbat", "game_assets/spritesheets/hellbat.json");
        this.load.spritesheet("coin", "game_assets/spritesheets/coin.json");
        this.load.spritesheet("hellhound", "game_assets/spritesheets/hellhound.json");
        this.load.object("enemyData", "game_assets/data/lust_enemy.json");
        this.load.spritesheet("shopkeep", "game_assets/spritesheets/shopkeep.json");
        this.load.spritesheet("lust", "game_assets/spritesheets/lust.json");

        //load shop screen
        this.load.image("shop_ui", "game_assets/images/shop_ui.png")

        // load the tilemap
        // TODO PROJECT - switch with correct tilemap
        this.load.tilemap("lustLevel", "game_assets/tilemaps/lust_level.json");

        // load weapon info
        this.load.object("weaponData", "game_assets/data/weapon_data.json");

        this.load.image("fist", "game_assets/spritesheets/impact.png");
        this.load.spritesheet("fist", "game_assets/spritesheets/impact.json");

        //Load pause screen
        this.load.image("pauseScreen", "game_assets/images/pause_background.png");
        this.load.image("slam", "game_assets/spritesheets/smash.png");
        this.load.spritesheet("slam", "game_assets/spritesheets/smash.json");

        this.load.audio("zara_punch", "game_assets/sounds/zara_punch.mp3");
        this.load.audio("zara_damage", "game_assets/sounds/zara_damage.mp3");
        this.load.audio("zara_death", "game_assets/sounds/zara_death.mp3");
        this.load.audio("gluttony_attack", "game_assets/sounds/gluttony_attack.mp3");
        this.load.audio("gluttony_damage", "game_assets/sounds/gluttony_damage.mp3");
        this.load.audio("gluttony_death", "game_assets/sounds/gluttony_death.mp3");
        this.load.audio("coin_pickup", "game_assets/sounds/coin_pickup.mp3");
        this.load.audio("hound_damage", "game_assets/sounds/hound_damage.mp3");
        this.load.audio("hound_death", "game_assets/sounds/hound_death.mp3");
        this.load.audio("boss_door_close", "game_assets/sounds/boss_door_close.mp3");
        this.load.audio("bat_death", "game_assets/sounds/bat_death.mp3");
        this.load.audio("bat_damage", "game_assets/sounds/bat_damage.mp3");
        this.load.audio("lust_music", "game_assets/sounds/music/lust.mp3")
    }

    startScene() {
        // Add in the tilemap
        let tilemap_layers = this.add.tilemap("lustLevel");

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
        this.initializeShop(new Vec2(780, 608));

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

        this.initializeBossRoom();

        this.initializeTutorial();

        // TODO PROJECT - receiver subscribe to events
        this.subscribeToEvents();

        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: "lust_music", loop: true, holdReference: true});
    }

    updateScene(deltaT: number): void {
        Debug.log("Playerpos", this.player.position.toString());

        for (let i = 0; i < this.tutorial_zones.length; i++) {
            if(this.player.boundary.overlaps(this.tutorial_zones[i].boundary)) {
                this.tutorial_labels[i].visible = true;
            } else {
                this.tutorial_labels[i].visible = false;
            }
        }


        if ((!this.player.boundary.overlaps(this.shop_zone.boundary)) && this.in_shop_zone){
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

        if(Input.isJustPressed("lust")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "lust_music"});
            this.sceneManager.changeToScene(LustLevel, 
                {
                    health: 5,
                    coins: 0
                }, 
                {
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
                });
        }else if(Input.isJustPressed("gluttony")){
            this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "lust_music"});
            this.sceneManager.changeToScene(GluttonyLevel, 
                {
                    health: 5,
                    coins: 0
                }, 
                {
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
                });
        }

        while(this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            console.log(event.type);
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
                        this.player._ai.handleEvent(new GameEvent(Game_Events.GET_COIN, {}));
                    }
                    break;

                case Game_Events.ENTER_BOSS_FIGHT:
                    {
                        this.boss_room.removePhysics();
                        let tilemap = this.getTilemap("Wall") as OrthogonalTilemap;
                        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "boss_door_close", loop: false, holdReference: false})
                        for(let v of [new Vec2(1008, 1360), new Vec2(1040, 1360)]) {
                            let tile_coords = tilemap.getColRowAt(v);
                            // let tile_world_pos = tilemap.getTileWorldPosition(tile_coords.y * tilemap.getDimensions().x + tile_coords.x);
                            tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 19);
                        }
                        for(let v of [new Vec2(1008, 1392), new Vec2(1008, 1424), new Vec2(1040, 1392), new Vec2(1040, 1424)]) {
                            let tile_coords = tilemap.getColRowAt(v);
                            // let tile_world_pos = tilemap.getTileWorldPosition(tile_coords.y * tilemap.getDimensions().x + tile_coords.x);
                            tilemap.setTile(tile_coords.y * tilemap.getDimensions().x + tile_coords.x, 18);
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
                        console.log("GAME OVER");
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
                        if (this.player_coins >= 5){
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
            }
        }
    }

    initializePlayer(): void {
        // Create the player
        this.player = this.add.animatedSprite("player", "primary");
        this.player.position.set(1138, 116);
        this.player.addPhysics(new AABB(new Vec2(0, 14), new Vec2(16, 15)), new Vec2(0, 15));
        let fist = this.createWeapon("punch");
        this.player.addAI(PlayerController,
            {
                speed: 1000,
                fist: fist,
                slippery: false,
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
            if(data.enemy_type === "hellbat") {
                this.enemies[i].addPhysics();
                this.enemies[i].addAI(BatAI, enemyOptions);
                
                // this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(9, 7)));
                
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.ENEMY_COLLISION, "bat hit player");
            }
            else if(data.enemy_type === "hellhound") {
                this.enemies[i].addPhysics();
                this.enemies[i].addAI(HoundAI, enemyOptions);
                
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.ENEMY_COLLISION, "hound hit player");
            }
            else if(data.enemy_type ===  "lust") {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                }
                this.enemies[i].addAI(LustAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(56, 56)));
                this.enemies[i].setGroup("enemy");
                this.enemies[i].setTrigger("player", Game_Events.BOSS_COLLISION, "boss hit player");
            }
            else {
                let enemyOptions = {
                    health: data.health,
                    player: this.player
                }
                this.enemies[i].addAI(LustAI, enemyOptions);
                this.enemies[i].addPhysics(new AABB(Vec2.ZERO, new Vec2(50, 50)));
            }

        }
    }

    initializeShop(position: Vec2): void{
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
        this.shop_prompt = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(position.x, position.y - 50), text: "Press E to enter the shop"});
        this.shop_prompt.font = "HellText";    
        this.shop_prompt.textColor = Color.BLACK;
        this.shop_prompt.fontSize = 20;
        this.shop_prompt.size.set(30, 14);
        this.shop_prompt.borderWidth = 2;
        this.shop_prompt.borderColor = Color.TRANSPARENT;
        this.shop_prompt.backgroundColor = Color.TRANSPARENT;
        this.shop_prompt.visible = false;

        this.addUILayer("shop");
        let contract = this.add.sprite("shop_ui", "shop");
        contract.position.set(320, 180);
        
        const buy_heart = <Button>this.add.uiElement(UIElementType.BUTTON, "shop", {position: new Vec2(320, 160), text: "5 Coins = "});
        buy_heart.font = "HellText";    
        buy_heart.textColor = Color.RED;
        buy_heart.fontSize = 42;
        buy_heart.size.set(250, 90);
        buy_heart.borderWidth = 2;
        buy_heart.borderColor = new Color(233, 229, 158);
        buy_heart.backgroundColor = Color.BLACK;
        buy_heart.onClickEventId = Game_Events.BOUGHT_HEART;
        
        let contract_heart_image = this.add.sprite("heart", "shop");
        contract_heart_image.position.set(370, 160);

        //Hide shop to start
        this.getLayer("shop").disable();

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

        let sprite = null;
        if(type === "punch") {
            sprite = this.add.sprite(weaponType.sprite_key, "above");
        }
        else {
            sprite = this.add.sprite(weaponType.sprite_key, "below");
            console.log(sprite.getLayer());
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
        this.level_start_label = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: new Vec2(-320, 100), text: "Lust's Lascivious Lair"});
        this.level_start_label.size.set(1280, 60);
        this.level_start_label.borderRadius = 0;
        this.level_start_label.backgroundColor = Color.BLACK;
        this.level_start_label.textColor = new Color(255, 0, 196);
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

    protected initializeBossRoom(): void {
        this.boss_room = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1024, 1224), size: new Vec2(6 * 32, 3 * 32)});
        this.boss_room.addPhysics(undefined, undefined, false, true);
        this.boss_room.setTrigger("player", Game_Events.ENTER_BOSS_FIGHT, "enter boss fight");
        this.boss_room.color = Color.TRANSPARENT;
    }

    protected initializeTutorial(): void {
        this.tutorial_labels = new Array<Label>();
        this.tutorial_zones = new Array<Rect>();

        let tutorial_zone_1 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1138, 116), size: new Vec2(7 * 32, 5 * 32)});
        tutorial_zone_1.addPhysics(undefined, undefined, false, true);
        tutorial_zone_1.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_1);

        let tutorial_label_1 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1138, 48), text: "Use WASD to move"});
        tutorial_label_1.font = "HellText";    
        tutorial_label_1.textColor = Color.BLACK;
        tutorial_label_1.fontSize = 32;
        tutorial_label_1.size.set(30, 14);
        tutorial_label_1.borderWidth = 2;
        tutorial_label_1.borderColor = Color.TRANSPARENT;
        tutorial_label_1.backgroundColor = Color.TRANSPARENT;
        tutorial_label_1.visible = false;
        this.tutorial_labels.push(tutorial_label_1);

        let tutorial_zone_2 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1680, 426), size: new Vec2(10 * 32, 5 * 32)});
        tutorial_zone_2.addPhysics(undefined, undefined, false, true);
        tutorial_zone_2.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_2);

        let tutorial_label_2 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1616, 360), text: "Click to attack in the\ndirection of your mouse"});
        tutorial_label_2.font = "HellText";    
        tutorial_label_2.textColor = Color.BLACK;
        tutorial_label_2.fontSize = 32;
        tutorial_label_2.size.set(30, 14);
        tutorial_label_2.borderWidth = 2;
        tutorial_label_2.borderColor = Color.TRANSPARENT;
        tutorial_label_2.backgroundColor = Color.TRANSPARENT;
        tutorial_label_2.visible = false;
        this.tutorial_labels.push(tutorial_label_2);

        let tutorial_zone_3 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1776, 722), size: new Vec2(10 * 32, 4 * 32)});
        tutorial_zone_3.addPhysics(undefined, undefined, false, true);
        tutorial_zone_3.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_3);

        let tutorial_label_3 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1776, 642), text: "Hellbats take 2 punches to kill"});
        tutorial_label_3.font = "HellText";    
        tutorial_label_3.textColor = Color.BLACK;
        tutorial_label_3.fontSize = 32;
        tutorial_label_3.size.set(30, 14);
        tutorial_label_3.borderWidth = 2;
        tutorial_label_3.borderColor = Color.TRANSPARENT;
        tutorial_label_3.backgroundColor = Color.TRANSPARENT;
        tutorial_label_3.visible = false;
        this.tutorial_labels.push(tutorial_label_3);

        let tutorial_zone_4 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1808, 1164), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_4.addPhysics(undefined, undefined, false, true);
        tutorial_zone_4.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_4);

        let tutorial_label_4 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1808, 1084), text: "Walk over coins to pick them up"});
        tutorial_label_4.font = "HellText";    
        tutorial_label_4.textColor = Color.BLACK;
        tutorial_label_4.fontSize = 32;
        tutorial_label_4.size.set(30, 14);
        tutorial_label_4.borderWidth = 2;
        tutorial_label_4.borderColor = Color.TRANSPARENT;
        tutorial_label_4.backgroundColor = Color.TRANSPARENT;
        tutorial_label_4.visible = false;
        this.tutorial_labels.push(tutorial_label_4);

        let tutorial_zone_5 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1716, 1462), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_5.addPhysics(undefined, undefined, false, true);
        tutorial_zone_5.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_5);

        let tutorial_label_5 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1732, 1380), text: "Hellbats are scattered around Hell"});
        tutorial_label_5.font = "HellText";
        tutorial_label_5.textColor = Color.BLACK;
        tutorial_label_5.fontSize = 32;
        tutorial_label_5.size.set(30, 14);
        tutorial_label_5.borderWidth = 2;
        tutorial_label_5.borderColor = Color.TRANSPARENT;
        tutorial_label_5.backgroundColor = Color.TRANSPARENT;
        tutorial_label_5.visible = false;
        this.tutorial_labels.push(tutorial_label_5);

        let tutorial_zone_6 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(292, 1392), size: new Vec2(9 * 32, 4 * 32)});
        tutorial_zone_6.addPhysics(undefined, undefined, false, true);
        tutorial_zone_6.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_6);

        let tutorial_label_6 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(292, 1302), text: "Hellhounds take 3 hits to kill"});
        tutorial_label_6.font = "HellText";
        tutorial_label_6.textColor = Color.BLACK;
        tutorial_label_6.fontSize = 32;
        tutorial_label_6.size.set(30, 14);
        tutorial_label_6.borderWidth = 2;
        tutorial_label_6.borderColor = Color.TRANSPARENT;
        tutorial_label_6.backgroundColor = Color.TRANSPARENT;
        tutorial_label_6.visible = false;
        this.tutorial_labels.push(tutorial_label_6);

        let tutorial_zone_7 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1080, 370), size: new Vec2(9 * 32, 5 * 32)});
        tutorial_zone_7.addPhysics(undefined, undefined, false, true);
        tutorial_zone_7.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_7);

        let tutorial_label_7 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1100, 460), text: "You can find Lust in the center of the floor"});
        tutorial_label_7.font = "HellText";
        tutorial_label_7.textColor = Color.BLACK;
        tutorial_label_7.fontSize = 32;
        tutorial_label_7.size.set(30, 14);
        tutorial_label_7.borderWidth = 2;
        tutorial_label_7.borderColor = Color.TRANSPARENT;
        tutorial_label_7.backgroundColor = Color.TRANSPARENT;
        tutorial_label_7.visible = false;
        this.tutorial_labels.push(tutorial_label_7);

        let tutorial_zone_8 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1028, 1488), size: new Vec2(6 * 32, 7 * 32)});
        tutorial_zone_8.addPhysics(undefined, undefined, false, true);
        tutorial_zone_8.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_8);

        let tutorial_label_8 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(1028, 1432), text: "You can enter the boss room here..."});
        tutorial_label_8.font = "HellText";
        tutorial_label_8.textColor = Color.BLACK;
        tutorial_label_8.fontSize = 32;
        tutorial_label_8.size.set(30, 14);
        tutorial_label_8.borderWidth = 2;
        tutorial_label_8.borderColor = Color.TRANSPARENT;
        tutorial_label_8.backgroundColor = Color.TRANSPARENT;
        tutorial_label_8.visible = false;
        this.tutorial_labels.push(tutorial_label_8);

        let tutorial_zone_9 = <Rect>this.add.graphic(GraphicType.RECT, "primary", {position: new Vec2(1028, 1488), size: new Vec2(6 * 32, 7 * 32)});
        tutorial_zone_9.addPhysics(undefined, undefined, false, true);
        tutorial_zone_9.color = Color.TRANSPARENT;
        this.tutorial_zones.push(tutorial_zone_9);

        let tutorial_label_9 = <Label>this.add.uiElement(UIElementType.LABEL, "primary", {position: new Vec2(884, 1470), text: "or you can look for the shop"});
        tutorial_label_9.font = "HellText";
        tutorial_label_9.textColor = Color.BLACK;
        tutorial_label_9.fontSize = 32;
        tutorial_label_9.size.set(30, 14);
        tutorial_label_9.borderWidth = 2;
        tutorial_label_9.borderColor = Color.TRANSPARENT;
        tutorial_label_9.backgroundColor = Color.TRANSPARENT;
        tutorial_label_9.visible = false;
        this.tutorial_labels.push(tutorial_label_9);
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
           Game_Events.ENTERED_SHOP,
           Game_Events.EXITED_SHOP,
           Game_Events.GET_COIN,
           Game_Events.ENTER_BOSS_FIGHT
        ]);
    }
}
import PlayerController from "./PlatformerPlayerController";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../Wolfie2D/Scene/Scene";

export default class Platformer extends Scene {
    private player: AnimatedSprite;

    // Load any assets you will need for the project here
    loadScene(){
        // Load the player spritesheet
        this.load.spritesheet("player", "demo_assets/spritesheets/platformer/player.json");

        // Load the tilemap
        this.load.tilemap("platformer", "demo_assets/tilemaps/platformer/platformer.json");

        // Load the background image
        this.load.image("background", "demo_assets/images/platformer_background.png");

        // Load a jump sound
        this.load.audio("jump", "demo_assets/sounds/jump.wav");
    }

    // Add GameObjects to the scene
    startScene(){
        this.addLayer("primary", 1);

        // Add the player in the starting position
        this.player = this.add.animatedSprite("player", "primary");
        this.player.animation.play("IDLE");
        this.player.position.set(3*16, 18*16);

        // Add physics so the player can move
        this.player.addPhysics();
        this.player.addAI(PlayerController, {jumpSoundKey: "jump"});

        // Size of the tilemap is 64x20. Tile size is 16x16
        this.viewport.setBounds(0, 0, 64*16, 20*16);
        this.viewport.follow(this.player);

        // Add the tilemap. Top left corner is (0, 0) by default
        this.add.tilemap("platformer");

        // Add a background to the scene
        this.addParallaxLayer("bg", new Vec2(0.5, 1), -1);
        let bg = this.add.sprite("background", "bg");
        bg.position.set(bg.size.x/2, bg.size.y/2);
    }
}
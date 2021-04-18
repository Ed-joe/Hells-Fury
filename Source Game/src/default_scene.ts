/* #################### IMPORTS #################### */
// Import from Wolfie2D or your own files here
import Vec2 from "./Wolfie2D/DataTypes/Vec2";
import Input from "./Wolfie2D/Input/Input";
import Graphic from "./Wolfie2D/Nodes/Graphic";
import { GraphicType } from "./Wolfie2D/Nodes/Graphics/GraphicTypes";
import Sprite from "./Wolfie2D/Nodes/Sprites/Sprite";
import Scene from "./Wolfie2D/Scene/Scene";
import Color from "./Wolfie2D/Utils/Color";


/* #################### CLASS DEFINITION #################### */

// Welcome to Wolfie2D!
// This is a simple sample scene so something displays when you run the game.
export default class default_scene extends Scene {
    /* ########## MEMBER DEFINITIONS ##########*/
    private logo: Sprite;
    private player: Graphic;

    /* ########## BUILT-IN FUNCTIONS ########## */
    // The following are built-in abstract Scene functions you are meant to extend.
    // They represent the lifecycle of a Scene, and thus allow you to load and start your scene

    // loadScene() is where you should load initial assets needed for your scene.
    // it is called strictly before startScene, so you are assured all assets will be loaded before
    // the scene begins
    loadScene(): void {
        // Load any assets here. For example, to load an image (or a sprite):

        // The first argument is the key of the sprite (you get to decide what it is).
        // The second argument is the path to the actual image.
        // Paths start in the "dist/" folder, so start building your path from there
        this.load.image("logo", "demo_assets/images/wolfie2d_text.png");
    }

    // startScene() is where you should build any game objects you wish to have in your scene,
    // or where you should initialize any other things you will need in your scene
    // Once again, this occurs strictly after loadScene(), so anything you loaded there will be available
    startScene(): void {
        // Create any game objects here. For example, to add the sprite we previously loaded:

        // First, create a layer for it to go on
        this.addLayer("primary");

        // The first argument is the key we specified in "this.load.image"
        // The second argument is the name of the layer
        this.logo = this.add.sprite("logo", "primary");

        // Now, let's make sure our logo is in a good position
        let center = this.viewport.getCenter();
        this.logo.position.set(center.x, center.y);



        // We can also create game objects (such as graphics and UIElements) without using loaded assets
        // Lets add a rectangle to use as the player object
        // For some game objects, you have to specify an options object. In this case, position and size:
        let options = {
            size: new Vec2(50, 50),
            position: new Vec2(center.x, center.y + 100)
        }

        // Create the rect
        this.player = this.add.graphic(GraphicType.RECT, "primary", options);

        // Now, let's change the color of our player
        this.player.color = Color.ORANGE;
    }

    // updateScene() is where you can handle any frame by frame updates to your scene.
    // For the most part, GameNode logic can be abstracted to AI, but there may be
    // things you want to control for the whole scene, like player score.
    // The argument to updateScene is the time step of the update frame
    updateScene(deltaT: number): void {
        // For our update, lets create a basic player controller
        // First, lets handle the input
        const direction = Vec2.ZERO;

        // Sum the x-direction keys
        direction.x = (Input.isKeyPressed("a") ? -1 : 0) + (Input.isKeyPressed("d") ? 1 : 0);

        // Sum the y-direction keys
        direction.y = (Input.isKeyPressed("w") ? -1 : 0) + (Input.isKeyPressed("s") ? 1 : 0);

        // We don't want to move faster in diagonals, so normalize
        direction.normalize();
        
        // We want to move 100 units per second, not per frame, so multiply by deltaT when moving
        const speed = 100 * deltaT;
        
        // Scale our direction to speed
        const velocity = direction.scale(speed);

        // Finally, adjust the position of the player
        this.player.position.add(velocity);
    }
}
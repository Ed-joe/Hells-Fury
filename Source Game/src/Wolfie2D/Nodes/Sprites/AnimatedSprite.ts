import Sprite from "./Sprite";
import AnimationManager from "../../Rendering/Animations/AnimationManager";
import Spritesheet from "../../DataTypes/Spritesheet";
import Vec2 from "../../DataTypes/Vec2";

/** An sprite with specified animation frames. */
export default class AnimatedSprite extends Sprite {
    /** The number of columns in this sprite sheet */
    protected numCols: number;

    get cols(): number {
        return this.numCols;
    }

    /** The number of rows in this sprite sheet */
    protected numRows: number;

    get rows(): number {
        return this.numRows;
    }

    /** The animationManager for this sprite */
    animation: AnimationManager;

    constructor(spritesheet: Spritesheet){
        super(spritesheet.name);
        this.numCols = spritesheet.columns;
        this.numRows = spritesheet.rows;

        // Set the size of the sprite to the sprite size specified by the spritesheet
        this.size.set(spritesheet.spriteWidth, spritesheet.spriteHeight);

        this.animation = new AnimationManager(this);

        // Add the animations to the animated sprite
        for(let animation of spritesheet.animations){
            this.animation.add(animation.name, animation);
        }
    }

    /**
     * Gets the image offset for the current index of animation
     * @param index The index we're at in the animation
     * @returns A Vec2 containing the image offset
     */
    getAnimationOffset(index: number): Vec2 {
        return new Vec2((index % this.numCols) * this.size.x, Math.floor(index / this.numCols) * this.size.y);
    }
}
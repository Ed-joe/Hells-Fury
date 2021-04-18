import { AnimationData } from "../Rendering/Animations/AnimationTypes";

/** A class representing data contained in a spritesheet.
 * Spritesheets are the images associated with sprites, and contain images indexed in a grid, which
 * correspond to animations.
 */
export default class Spritesheet {
    /** The name of the spritesheet */
    name: string;
    /** The image key of the spritesheet */
    spriteSheetImage: string;
    /** The width of the sprite */
    spriteWidth: number;
    /** The height of the sprite */
    spriteHeight: number;
    /** The number of columns in the spritesheet */
    columns: number;
    /** The number of rows in the spritesheet */
    rows: number;
    /** An array of the animations associated with this spritesheet */
    animations: Array<AnimationData>;
}
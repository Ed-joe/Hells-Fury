import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import Scene from "../../../../Wolfie2D/Scene/Scene";

export default abstract class WeaponType {
    /** The key for this sprite image */
    spriteKey: string;

    /** How much damage this weapon does */
    damage: number;

    /** Display name */
    displayName: string;

    /** The use cooldown of the weapon */
    cooldown: number;

    /** How loud it is to use this weapon */
    useVolume: number;

    /**
     * Initializes this weapon type with data
     */
    abstract initialize(options: Record<string, any>): void;

    /**
     * The animation to do when this weapon is used
     */
    abstract doAnimation(...args: any): void;

    abstract createRequiredAssets(scene: Scene): Array<any>;

    abstract hits(node: GameNode, ...args: any): boolean;
}
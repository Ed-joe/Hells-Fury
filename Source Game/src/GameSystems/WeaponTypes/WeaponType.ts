import GameNode from "../../Wolfie2D/Nodes/GameNode";
import Scene from "../../Wolfie2D/Scene/Scene";

export default abstract class WeaponType {
    sprite_key: string;
    damage: number;
    disply_name: string;
    cooldown: number;
    use_volume: number;

    abstract initialize(options: Record<string, any>): void;
    abstract doAnimation(...args: any): void;
    abstract createRequiredAssets(scene: Scene): Array<any>;
    abstract hits(node: GameNode, ...args: any): boolean;
}
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import WeaponType from "./WeaponType";


export default class WrathSlice extends WeaponType {
    sprite_key: string;
    damage: number;
    display_name: string;
    cooldown: number;
    use_volume: number;

    initialize(options: Record<string, any>): void {
        this.damage = options.damage;
        this.cooldown = options.cooldown;
        this.display_name = options.displayName;
        this.sprite_key = options.spriteKey;
        this.use_volume = options.useVolume;
    }

    doAnimation(attacker: GameNode, direction: Vec2, slice_sprite: AnimatedSprite): void {
        // rotate this with the game node
        slice_sprite.rotation = direction.y > 0 ? Math.PI : 0;
        slice_sprite.position = direction.y > 0 ? new Vec2(attacker.position.x, attacker.position.y + 32) : new Vec2(attacker.position.x, attacker.position.y);

        // play the punch animation but queue the normal animation
        slice_sprite.animation.play("SLICE");
        slice_sprite.animation.queue("NORMAL", true);
    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let slice = scene.add.animatedSprite(this.sprite_key, "below");
        slice.animation.play("NORMAL", true);

        return [slice];
    }

    hits(node: GameNode, punch_sprite: AnimatedSprite): boolean {
        return punch_sprite.boundary.overlaps(node.collisionShape);
    }
}
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import WeaponType from "./WeaponType";


export default class GluttonySlam extends WeaponType {
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

    doAnimation(attacker: GameNode, direction: Vec2, slam_sprite: AnimatedSprite): void {
        // move the punch out from the player
        slam_sprite.position = attacker.position.clone()
        slam_sprite.rotation += Math.random()*10 + 10;

        // play the slam animation but queue the normal animation
        slam_sprite.animation.play("SMASH");
        slam_sprite.animation.queue("NORMAL", true);
    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let slam = scene.add.animatedSprite("slam", "below");
        slam.animation.play("NORMAL", true);

        return [slam];
    }

    hits(node: GameNode, slam_sprite: AnimatedSprite): boolean {
        return slam_sprite.boundary.overlaps(node.collisionShape);
    }
}
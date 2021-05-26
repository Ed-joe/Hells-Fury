import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../Wolfie2D/Scene/Scene";
import WeaponType from "./WeaponType";


export default class Punch extends WeaponType {
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

    doAnimation(attacker: GameNode, direction: Vec2, punch_sprite: AnimatedSprite): void {
        // rotate this with the game node
        punch_sprite.rotation = attacker.attack_direction;

        if(attacker.moving && (Math.abs(attacker.attack_direction - Vec2.UP.angleToCCW(attacker._velocity)) < .3 || Math.abs(attacker.attack_direction - Vec2.UP.angleToCCW(attacker._velocity)) > 5.5)) {
            punch_sprite.position = attacker.position.clone().add(direction.scaled(80));
        }
        else {
            punch_sprite.position = attacker.position.clone().add(direction.scaled(50));
        }

        // move the punch out from the player

        // play the punch animation but queue the normal animation
        punch_sprite.animation.play("PUNCH");
        punch_sprite.animation.queue("NORMAL", true);
    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let punch = scene.add.animatedSprite(this.sprite_key, "above");
        punch.animation.play("NORMAL", true);

        return [punch];
    }

    hits(node: GameNode, punch_sprite: AnimatedSprite): boolean {
        return punch_sprite.boundary.overlaps(node.collisionShape);
    }
}
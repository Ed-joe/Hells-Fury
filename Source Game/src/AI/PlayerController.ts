import AI from "../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../Wolfie2D/Timing/Timer";

export default class PlayerController implements AI {
    // fields from BattlerAI
    health: number;

    // player sprite
    owner: AnimatedSprite;

    // Movement
    private direction: Vec2;
    private speed: number;

    // Attacking
    private lookDirection: Vec2;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner
        this.direction = Vec2.ZERO;
        this.lookDirection = Vec2.ZERO;
        this.speed = options.speed;
        this.health = 5;
    }

    activate(options: Record<string, any>): void {}

    handleEvent(event: GameEvent): void {}

    update(deltaT: number): void {
        // get the movement direction
        this.direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
        this.direction.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);

        if(!this.direction.isZero()) {
            // Move the player
            this.owner.move(this.direction.normalized().scale(this.speed * deltaT));
            this.owner.animation.playIfNotAlready("WALK", true);
        } else {
            // Player is idle
            this.owner.animation.playIfNotAlready("IDLE", true);
        }

        // Get the unit vector in the look direction
        this.lookDirection = this.owner.position.dirTo(Input.getGlobalMousePosition());

        // punch attack
        if(Input.isMouseJustPressed()) {
            // TODO PROJECT - implement punch attack here
            console.log("punch event");
        }

        // have player face left or right
        // TODO PROJECT - implement player always faces mouse


        
    }

    damage(damage: number): void {
        this.health -= damage;
        if(this.health <= 0) {
            console.log("Game Over");
        }
    }

    destroy() {
        delete this.owner;
    }
}
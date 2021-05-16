import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import SlothAI, { BossStates } from "../SlothAI";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class Walk extends BossState {
    private timer: Timer;

    constructor(parent: SlothAI, owner: AnimatedSprite){
        super(parent, owner);
    }

    onEnter(options: Record<string, any>): void {
        this.owner.animation.play("WALK", true);
        this.timer = new Timer(1500);
        
        this.timer.start();
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(this.timer.isStopped()) {
            this.finished(BossStates.TOSS_UP);
        }
        this.owner.move(this.owner.position.dirTo(this.parent.player.position).normalize().scale(.5));
    }

    onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }

}
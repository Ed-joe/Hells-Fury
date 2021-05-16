import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class GreedIdle extends BossState {
    private attack_timer: Timer;

    private retObj: Record<string, any>;
    
    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent, owner);
        this.attack_timer = new Timer(950);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("GREED_IDLE", true);
        if(options.timer) {
            this.attack_timer = new Timer(options.timer);
            this.attack_timer.start();
        } else {
            this.attack_timer = new Timer(1000);
            this.attack_timer.pause();
        }
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        super.update(deltaT);

        if(this.parent.getPlayerPosition() !== null && this.attack_timer.isPaused() && this.parent.getPlayerPosition().distanceTo(this.owner.position) < 300){
            this.attack_timer.start();
        }
        if(this.attack_timer.isStopped()) {
            this.finished(BossStates.GREED_ATTACK);
        }
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return {previous: BossStates.GREED_ATTACK};
    }

}
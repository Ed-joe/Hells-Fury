import Vec2 from "./../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "./../../Wolfie2D/Events/GameEvent";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import NavigationPath from "./../../Wolfie2D/Pathfinding/NavigationPath";
import BossState from "./BossState";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import GluttonyAI, { BossStates } from "../GluttonyAI";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class Idle extends BossState {
    private attack_timer: Timer;

    private retObj: Record<string, any>;
    
    constructor(parent: GluttonyAI, owner: GameNode){
        super(parent, owner);
        this.attack_timer = new Timer(950);
    }

    onEnter(options: Record<string, any>): void {
        (<AnimatedSprite> this.owner).animation.play("IDLE", true);
        this.attack_timer.pause();
    }

    handleInput(event: GameEvent): void {
    }

    update(deltaT: number): void {
        if(this.parent.getPlayerPosition() !== null && this.attack_timer.isPaused() && this.parent.getPlayerPosition().distanceTo(this.owner.position) < 300){
            this.attack_timer.start();
        }
        if(this.attack_timer.isStopped()) {
            this.finished(BossStates.ATTACKING);
        }
    }

    onExit(): Record<string, any> {
        (<AnimatedSprite> this.owner).animation.stop();
        return this.retObj;
    }

}
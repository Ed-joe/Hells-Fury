import State from "./../../Wolfie2D/DataTypes/State/State";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PrideAI, { BossStates } from "../PrideAI";
import Timer from "../../Wolfie2D/Timing/Timer";
import GameEvent from "../../Wolfie2D/Events/GameEvent";

var transform_timer: Timer;

export default abstract class BossState extends State {
    protected parent: PrideAI;
    protected owner: AnimatedSprite;

    constructor(parent: PrideAI, owner: AnimatedSprite){
        super(parent);
        this.owner = owner;
    }

    onEnter(options: Record<string, any>): void {
        console.log("set timer");
        transform_timer = new Timer(9000);
        transform_timer.start();
    }

    update(deltaT: number): void {
        if (transform_timer.isStopped()) {
            // transform into random other boss
            this.finished(BossStates.TRANSFORM);
        }
    }
}
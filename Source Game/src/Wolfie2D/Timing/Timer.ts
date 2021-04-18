import Updateable from "../DataTypes/Interfaces/Updateable";
import MathUtils from "../Utils/MathUtils";
import TimerManager from "./TimerManager";

export default class Timer implements Updateable {

    protected state: TimerState;
    protected onEnd: Function;
    protected loop: boolean;
    protected totalTime: number;
    protected timeLeft: number;

    constructor(time: number, onEnd?: Function, loop: boolean = false){
        // Register this timer
        TimerManager.getInstance().addTimer(this);
        
        this.totalTime = time;
        this.timeLeft = 0;
        this.onEnd = onEnd;
        this.loop = loop;
        this.state = TimerState.STOPPED;
    }

    isStopped(){
        return this.state === TimerState.STOPPED;
    }

    isPaused(){
        return this.state === TimerState.PAUSED;
    }

    start(time?: number){
        if(time !== undefined){
            this.totalTime = time;
        }
        this.state = TimerState.ACTIVE;
        this.timeLeft = this.totalTime;
    }

    pause(): void {
        this.state = TimerState.PAUSED;
    }

    update(deltaT: number){
        if(this.state === TimerState.ACTIVE){
            this.timeLeft -= deltaT*1000;

            if(this.timeLeft <= 0){
                this.timeLeft = MathUtils.clampLow0(this.timeLeft);
                this.end();
            }
        }
    }

    protected end(){
        // Update the state
        this.state = TimerState.STOPPED;

        // Call the end function if there is one
        if(this.onEnd){
            this.onEnd();
        }

        // Loop if we want to
        if(this.loop){
            this.state = TimerState.ACTIVE;
            this.timeLeft = this.totalTime;
        }
    }

    toString(): string{
        return "Timer: " + this.state + " - Time Left: " + this.timeLeft + "ms of " + this.totalTime + "ms";
    }
}

export enum TimerState {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    STOPPED = "STOPPED"
}
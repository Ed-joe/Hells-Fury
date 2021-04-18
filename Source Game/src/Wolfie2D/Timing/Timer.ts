import Updateable from "../DataTypes/Interfaces/Updateable";
import MathUtils from "../Utils/MathUtils";
import TimerManager from "./TimerManager";

export default class Timer implements Updateable {

    /** The current state of this timer */
    protected state: TimerState;
    
    /** The function to call when this timer ends */
    protected onEnd: Function;

    /** Whether or not this timer should loop */
    protected loop: boolean;

    /** The total amount of time this timer runs for */
    protected totalTime: number;

    /** The amount of time left on the current run */
    protected timeLeft: number;

    /** The number of times this timer has been run */
    protected numRuns: number;

    constructor(time: number, onEnd?: Function, loop: boolean = false){
        // Register this timer
        TimerManager.getInstance().addTimer(this);
        
        this.totalTime = time;
        this.timeLeft = 0;
        this.onEnd = onEnd;
        this.loop = loop;
        this.state = TimerState.STOPPED;
        this.numRuns = 0;
    }

    isStopped(){
        return this.state === TimerState.STOPPED;
    }

    isPaused(){
        return this.state === TimerState.PAUSED;
    }

    /**
     * Returns whether or not this timer has been run before
     * @returns true if it has been run at least once (after the latest reset), and false otherwise
     */
    hasRun(): boolean {
        return this.numRuns > 0;
    }

    start(time?: number){
        if(time !== undefined){
            this.totalTime = time;
        }
        this.state = TimerState.ACTIVE;
        this.timeLeft = this.totalTime;
    }

    /** Resets this timer. Sets the progress back to zero, and sets the number of runs back to zero */
    reset(){
        this.timeLeft = this.totalTime;
        this.numRuns = 0;
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
        this.numRuns += 1;

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
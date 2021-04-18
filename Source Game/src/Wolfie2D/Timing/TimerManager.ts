import Updateable from "../DataTypes/Interfaces/Updateable";
import Timer from "./Timer";

export default class TimerManager implements Updateable {

    protected timers: Array<Timer>;

    constructor(){
        this.timers = new Array();
    }

    protected static instance: TimerManager;

    static getInstance(): TimerManager {
        if(!this.instance){
            this.instance = new TimerManager();
        }

        return this.instance;
    }

    addTimer(timer: Timer){
        this.timers.push(timer);
    }

    clearTimers(){
        this.timers = new Array();
    }

    update(deltaT: number): void {
        this.timers.forEach(timer => timer.update(deltaT));
    }
}
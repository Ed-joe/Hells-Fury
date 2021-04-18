import Updateable from "../../DataTypes/Interfaces/Updateable";
import TweenController from "./TweenController";

export default class TweenManager implements Updateable {

    private static instance: TweenManager = null;
    
    protected tweenControllers: Array<TweenController>;

    private constructor(){
        this.tweenControllers = new Array();
    }

    static getInstance(): TweenManager {
        if(TweenManager.instance === null){
            TweenManager.instance = new TweenManager();
        }

        return TweenManager.instance;
    }

    registerTweenController(controller: TweenController){
        this.tweenControllers.push(controller);
    }

    deregisterTweenController(controller: TweenController){
        let index = this.tweenControllers.indexOf(controller);
        this.tweenControllers.splice(index, 1);
    }

    clearTweenControllers(){
        this.tweenControllers = new Array();
    }

    update(deltaT: number): void {
        for(let tweenController of this.tweenControllers){
            tweenController.update(deltaT);
        }
    }
}
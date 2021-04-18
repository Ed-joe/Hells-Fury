import { TweenableProperties } from "../../Nodes/GameNode";
import { EaseFunctionType } from "../../Utils/EaseFunctions";

// @ignorePage

export enum AnimationState {
    STOPPED = 0,
    PAUSED = 1,
    PLAYING = 2,
}

export class AnimationData {
    name: string;
    frames: Array<{index: number, duration: number}>;
    repeat: boolean = false;
}

export class TweenEffect {
    /** The property to tween */
    property: TweenableProperties;

    /** Whether or not the Tween should reset the property to its original value after playing */
    resetOnComplete: boolean;

    /** The starting value for the tween */
    start: any;

    /** The ending value for the tween */
    end: any;

    /** The ease function to use */
    ease: EaseFunctionType;

    /** DO NOT MODIFY - The original value of the property - set automatically */
    initialValue: number;
}

export class TweenData {
    // Members for initialization by the user
    /** The amount of time in ms to wait before executing the tween */
    startDelay: number;
    /** The duration of time over which the value with change from start to end */
    duration: number;
    /** An array of the effects on the properties of the object */
    effects: Array<TweenEffect>;
    /** Whether or not this tween should reverse from end to start for each property when it finishes */
    reverseOnComplete: boolean;
    /** Whether or not this tween should loop when it completes */
    loop: boolean;
    /** The name of the event to send (if any) when the tween finishes playing */
    onEnd: string
    
    // Members for management by the tween manager
    /** The progress of this tween through its effects */
    progress: number;

    /** The amount of time in ms that has passed from when this tween started running */
    elapsedTime: number;

    /** The state of this tween */
    animationState: AnimationState;

    /** Whether or not this tween is currently reversing */
    reversing: boolean;
}
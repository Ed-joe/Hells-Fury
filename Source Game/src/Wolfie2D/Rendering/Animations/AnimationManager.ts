import Map from "../../DataTypes/Map";
import Emitter from "../../Events/Emitter";
import CanvasNode from "../../Nodes/CanvasNode";
import { AnimationData, AnimationState } from "./AnimationTypes";

/**
 * An animation manager class for an animated CanvasNode.
 * This class keeps track of the possible animations, as well as the current animation state,
 * and abstracts all interactions with playing, pausing, and stopping animations as well as 
 * creating new animations from the CanvasNode.
 */
export default class AnimationManager {
    /** The owner of this animation manager */
    protected owner: CanvasNode;
    
    /** The current animation state of this sprite */
    protected animationState: AnimationState;

    /** The name of the current animation of this sprite */
    protected currentAnimation: string;

    /** The current frame of this animation */
    protected currentFrame: number;

    /** The progress of the current animation through the current frame */
    protected frameProgress: number;

    /** Whether the current animation is looping or not */
    protected loop: boolean;

    /** The map of animations */
    protected animations: Map<AnimationData>;

    /** The name of the event (if any) to send when the current animation stops playing. */
    protected onEndEvent: string;

    /** The event emitter for this animation manager */
    protected emitter: Emitter;

    /** A queued animation */
    protected pendingAnimation: string;

    /** The loop status of a pending animation */
    protected pendingLoop: boolean;

    /** The onEnd event of a pending animation */
    protected pendingOnEnd: string;

    /**
     * Creates a new AnimationManager
     * @param owner The owner of the AnimationManager
     */
    constructor(owner: CanvasNode){
        this.owner = owner;
        this.animationState = AnimationState.STOPPED;
        this.currentAnimation = "";
        this.currentFrame = 0;
        this.frameProgress = 0;
        this.loop = false;
        this.animations = new Map();
        this.onEndEvent = null;
        this.emitter = new Emitter();
    }

    /**
     * Add an animation to this sprite
     * @param key The unique key of the animation
     * @param animation The animation data
     */
    add(key: string, animation: AnimationData): void {
        this.animations.add(key, animation);
    }

    /**
     * Gets the index specified by the current animation and current frame
     * @returns The index in the current animation
     */
    getIndex(): number {
        if(this.animations.has(this.currentAnimation)){
            return this.animations.get(this.currentAnimation).frames[this.currentFrame].index;
        } else {
            // No current animation, warn the user
            console.warn(`Animation index was requested, but the current animation: ${this.currentAnimation} was invalid`);
            return 0;
        }
    }

    /**
     * Determines whether the specified animation is currently playing
     * @param key The key of the animation to check
     * @returns true if the specified animation is playing, false otherwise
     */
    isPlaying(key: string): boolean {
        return this.currentAnimation === key && this.animationState === AnimationState.PLAYING;
    }

    /**
     * Retrieves the current animation index and advances the animation frame
     * @returns The index of the animation frame
     */
    getIndexAndAdvanceAnimation(): number {
        // If we aren't playing, we won't be advancing the animation
        if(!(this.animationState === AnimationState.PLAYING)){
            return this.getIndex();
        }

        if(this.animations.has(this.currentAnimation)){
            let currentAnimation = this.animations.get(this.currentAnimation);
            let index = currentAnimation.frames[this.currentFrame].index;

            // Advance the animation
            this.frameProgress += 1;
            if(this.frameProgress >= currentAnimation.frames[this.currentFrame].duration){
                // We have been on this frame for its whole duration, go to the next one
                this.frameProgress = 0;
                this.currentFrame += 1;

                if(this.currentFrame >= currentAnimation.frames.length){
                    // We have reached the end of this animation
                    if(this.loop){
                        this.currentFrame = 0;
                        this.frameProgress = 0;
                    } else {
                        this.endCurrentAnimation();
                    }
                }
            }

            // Return the current index
            return index;
        } else {
            // No current animation, can't advance. Warn the user
            console.warn(`Animation index and advance was requested, but the current animation (${this.currentAnimation}) in node with id: ${this.owner.id} was invalid`);
            return 0;
        }
    }

    /** Ends the current animation and fires any necessary events, as well as starting any new animations */
    protected endCurrentAnimation(): void {
        this.currentFrame = 0;
        this.animationState = AnimationState.STOPPED;

        if(this.onEndEvent !== null){
            this.emitter.fireEvent(this.onEndEvent, {owner: this.owner.id, animation: this.currentAnimation});
        }

        // If there is a pending animation, play it
        if(this.pendingAnimation !== null){
            this.play(this.pendingAnimation, this.pendingLoop, this.pendingOnEnd);
        }
    }

    /**
     * Plays the specified animation. Does not restart it if it is already playing
     * @param animation The name of the animation to play
     * @param loop Whether or not to loop the animation. False by default
     * @param onEnd The name of an event to send when this animation naturally stops playing. This only matters if loop is false.
     */
    playIfNotAlready(animation: string, loop?: boolean, onEnd?: string): void {
        if(this.currentAnimation !== animation){
            this.play(animation, loop, onEnd);
        }
    }

    /**
     * Plays the specified animation
     * @param animation The name of the animation to play
     * @param loop Whether or not to loop the animation. False by default
     * @param onEnd The name of an event to send when this animation naturally stops playing. This only matters if loop is false.
     */
    play(animation: string, loop?: boolean, onEnd?: string): void {
        this.currentAnimation = animation;
        this.currentFrame = 0;
        this.frameProgress = 0;
        this.animationState = AnimationState.PLAYING;

        // If loop arg was provided, use that
        if(loop !== undefined){
            this.loop = loop;
        } else {
            // Otherwise, use what the json file specified
            this.loop = this.animations.get(animation).repeat;
        }

        if(onEnd !== undefined){
            this.onEndEvent = onEnd;
        } else {
            this.onEndEvent = null;
        }

        // Reset pending animation
        this.pendingAnimation = null;
    }

    /**
     * Queues a single animation to be played after the current one. Does NOT stack.
     * Queueing additional animations past 1 will just replace the queued animation
     * @param animation The animation to queue
     * @param loop Whether or not the loop the queued animation
     * @param onEnd The event to fire when the queued animation ends
     */
    queue(animation: string, loop: boolean = false, onEnd?: string): void {
        this.pendingAnimation = animation;
        this.pendingLoop = loop;
        if(onEnd !== undefined){
            this.pendingOnEnd = onEnd;
        } else {
            this.pendingOnEnd = null;
        }
    }

    /** Pauses the current animation */
    pause(): void {
        this.animationState = AnimationState.PAUSED;
    }

    /** Resumes the current animation if possible */
    resume(): void {
        if(this.animationState === AnimationState.PAUSED){
            this.animationState = AnimationState.PLAYING;
        }
    }

    /** Stops the current animation. The animation cannot be resumed after this. */
    stop(): void {
        this.animationState = AnimationState.STOPPED;
    }
}
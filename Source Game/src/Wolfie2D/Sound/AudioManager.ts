import Map from "../DataTypes/Map";
import Receiver from "../Events/Receiver";
import ResourceManager from "../ResourceManager/ResourceManager";
import { GameEventType } from "../Events/GameEventType";

/**
 * Manages any sounds or music needed for the game.
 * Through the EventQueue, exposes interface to play sounds so GameNodes can activate sounds without
 * needing direct references to the audio system
 */
export default class AudioManager {
    private static instance: AudioManager;

    /** The event receiver of this AudioManager */
    private receiver: Receiver;

    /** A Map of the names of currently playing (or paused) sounds to their AudioBuffers */
    private currentSounds: Map<AudioBufferSourceNode>;

    private audioCtx: AudioContext;

    private constructor(){
        this.initAudio();
        this.receiver = new Receiver();
        this.receiver.subscribe([GameEventType.PLAY_SOUND, GameEventType.STOP_SOUND]);
        this.currentSounds = new Map();
    }

    /**
     * Get the instance of the AudioManager class or create a new one if none exists
     * @returns The AudioManager
     */
    public static getInstance(): AudioManager {
        if(!this.instance){
            this.instance = new AudioManager();
        }
        return this.instance;
    }

    /**
     * Initializes the webAudio context
     */
    private initAudio(): void {
        try {
            window.AudioContext = window.AudioContext;// || window.webkitAudioContext; 
            this.audioCtx = new AudioContext(); 
            console.log('Web Audio API successfully loaded');
        } catch(e) {
            console.log('Web Audio API is not supported in this browser'); 
        }
    }

    /**
     * Returns the current audio context
     * @returns The AudioContext
     */
    public getAudioContext(): AudioContext {
        return this.audioCtx;
    }

    /*
        According to the MDN, create a new sound for every call:

        An AudioBufferSourceNode can only be played once; after each call to start(), you have to create a new node
        if you want to play the same sound again. Fortunately, these nodes are very inexpensive to create, and the
        actual AudioBuffers can be reused for multiple plays of the sound. Indeed, you can use these nodes in a
        "fire and forget" manner: create the node, call start() to begin playing the sound, and don't even bother to
        hold a reference to it. It will automatically be garbage-collected at an appropriate time, which won't be
        until sometime after the sound has finished playing.
    */
    /**
     * Creates a new sound from the key of a loaded audio file
     * @param key The key of the loaded audio file to create a new sound for
     * @returns The newly created AudioBuffer
     */
    protected createSound(key: string): AudioBufferSourceNode {
        // Get audio buffer
        let buffer = ResourceManager.getInstance().getAudio(key);

        // Create a sound source
        var source = this.audioCtx.createBufferSource(); 
      
        // Tell the source which sound to play
        source.buffer = buffer;               
      
        // Connect the source to the context's destination
        source.connect(this.audioCtx.destination);         
        
        return source;
    }

    /**
     * Play the sound specified by the key
     * @param key The key of the sound to play
     * @param loop A boolean for whether or not to loop the sound
     * @param holdReference A boolean for whether or not we want to hold on to a reference of the audio node. This is good for playing music on a loop that will eventually need to be stopped.
     */
    protected playSound(key: string, loop: boolean, holdReference: boolean): void {
        let sound = this.createSound(key);

        if(loop){
            sound.loop = true;
        }

        // Add a reference of the new sound to a map. This will allow us to stop a looping or long sound at a later time
        if(holdReference){
            this.currentSounds.add(key, sound);
        }
        
        sound.start();
    }

    /**
     * Stop the sound specified by the key
     */
    protected stopSound(key: string): void {
        let sound = this.currentSounds.get(key);
        if(sound){
            sound.stop();
            this.currentSounds.delete(key);
        }
    }
    
    update(deltaT: number): void {
        // Play each audio clip requested
        // TODO - Add logic to merge sounds if there are multiple of the same key
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            if(event.type === GameEventType.PLAY_SOUND){
                let soundKey = event.data.get("key");
                let loop = event.data.get("loop");
                let holdReference = event.data.get("holdReference");
                this.playSound(soundKey, loop, holdReference);
            }

            if(event.type === GameEventType.STOP_SOUND){
                let soundKey = event.data.get("key");
                this.stopSound(soundKey);
            }
        }
    }
}
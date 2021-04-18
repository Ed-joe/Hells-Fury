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

    private gainNodes: Array<GainNode>;

    private constructor(){
        this.initAudio();
        this.receiver = new Receiver();
        this.receiver.subscribe([
            GameEventType.PLAY_SOUND,
            GameEventType.STOP_SOUND,
            GameEventType.PLAY_MUSIC,
            GameEventType.PLAY_SFX,
            GameEventType.MUTE_CHANNEL,
            GameEventType.UNMUTE_CHANNEL
        ]);
        this.currentSounds = new Map();

        this.gainNodes = new Array<GainNode>(MAX_AUDIO_CHANNELS);
        this.initGainNodes();
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
            console.warn('Web Audio API is not supported in this browser'); 
        }
    }

    private initGainNodes(): void {
        for(let i = 0; i < MAX_AUDIO_CHANNELS; i++){
            this.gainNodes[i] = this.audioCtx.createGain();
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
    protected createSound(key: string, holdReference: boolean, channel: AudioChannelType, options: Map<any>): AudioBufferSourceNode {
        // Get audio buffer
        let buffer = ResourceManager.getInstance().getAudio(key);

        // Create a sound source
        var source = this.audioCtx.createBufferSource(); 
      
        // Tell the source which sound to play
        source.buffer = buffer;               
      
        // Add any additional nodes
        const nodes: Array<AudioNode> = [source];

        // Do any additional nodes here?
        // Of course, there aren't any supported yet...

        // Add the gain node for this channel
        nodes.push(this.gainNodes[channel]);

        // Connect any nodes along the path
        for(let i = 1; i < nodes.length; i++){
            nodes[i-1].connect(nodes[i]);
        }

        // Connect the source to the context's destination
        nodes[nodes.length - 1].connect(this.audioCtx.destination);
        
        return source;
    }

    /**
     * Play the sound specified by the key
     * @param key The key of the sound to play
     * @param loop A boolean for whether or not to loop the sound
     * @param holdReference A boolean for whether or not we want to hold on to a reference of the audio node. This is good for playing music on a loop that will eventually need to be stopped.
     */
    protected playSound(key: string, loop: boolean, holdReference: boolean, channel: AudioChannelType, options: Map<any>): void {
        let sound = this.createSound(key, holdReference, channel, options);

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

    protected muteChannel(channel: AudioChannelType){
        this.gainNodes[channel].gain.setValueAtTime(0, this.audioCtx.currentTime);
    }

    protected unmuteChannel(channel: AudioChannelType){
        this.gainNodes[channel].gain.setValueAtTime(1, this.audioCtx.currentTime);
    }

    /**
     * Sets the volume of a channel using the GainNode for that channel. For more
     * information on GainNodes, see https://developer.mozilla.org/en-US/docs/Web/API/GainNode
     * @param channel The audio channel to set the volume for
     * @param volume The volume of the channel. 0 is muted. Values below zero will be set to zero.
     */
    static setVolume(channel: AudioChannelType, volume: number){
        if(volume < 0){
            volume = 0;
        }

        const am = AudioManager.getInstance();
        am.gainNodes[channel].gain.setValueAtTime(volume, am.audioCtx.currentTime);
    }

    /**
     * Returns the GainNode for this channel.
     * Learn more about GainNodes here https://developer.mozilla.org/en-US/docs/Web/API/GainNode
     * DON'T USE THIS UNLESS YOU KNOW WHAT YOU'RE DOING
     * @param channel The channel
     * @returns The GainNode for the specified channel
     */
    getChannelGainNode(channel: AudioChannelType){
        return this.gainNodes[channel];
    }
    
    update(deltaT: number): void {
        // Play each audio clip requested
        // TODO - Add logic to merge sounds if there are multiple of the same key
        while(this.receiver.hasNextEvent()){
            let event = this.receiver.getNextEvent();
            if(event.type === GameEventType.PLAY_SOUND || event.type === GameEventType.PLAY_MUSIC || event.type === GameEventType.PLAY_SFX){
                let soundKey = event.data.get("key");
                let loop = event.data.get("loop");
                let holdReference = event.data.get("holdReference");

                let channel = AudioChannelType.DEFAULT;

                if(event.type === GameEventType.PLAY_MUSIC){
                    channel = AudioChannelType.MUSIC;
                } else if(GameEventType.PLAY_SFX){
                    channel = AudioChannelType.SFX;
                } else if(event.data.has("channel")){
                    channel = event.data.get("channel");
                }

                this.playSound(soundKey, loop, holdReference, channel, event.data);
            }

            if(event.type === GameEventType.STOP_SOUND){
                let soundKey = event.data.get("key");
                this.stopSound(soundKey);
            }

            if(event.type === GameEventType.MUTE_CHANNEL){
                this.muteChannel(event.data.get("channel"));
            }

            if(event.type === GameEventType.UNMUTE_CHANNEL){
                this.unmuteChannel(event.data.get("channel"));
            }
        }
    }
}

export enum AudioChannelType {
    DEFAULT = 0,
    SFX = 1,
    MUSIC = 2,
    CUSTOM_1 = 3,
    CUSTOM_2 = 4,
    CUSTOM_3 = 5,
    CUSTOM_4 = 6,
    CUSTOM_5 = 7,
    CUSTOM_6 = 8,
    CUSTOM_7 = 9,
    CUSTOM_8 = 10,
    CUSTOM_9 = 11,
}

export const MAX_AUDIO_CHANNELS = 12;
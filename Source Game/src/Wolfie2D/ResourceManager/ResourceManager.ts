import Map from "../DataTypes/Map";
import Queue from "../DataTypes/Queue";
import { TiledTilemapData } from "../DataTypes/Tilesets/TiledData";
import StringUtils from "../Utils/StringUtils";
import AudioManager from "../Sound/AudioManager";
import Spritesheet from "../DataTypes/Spritesheet";
import WebGLProgramType from "../DataTypes/Rendering/WebGLProgramType";

/**
 * The resource manager for the game engine.
 * The resource manager interfaces with the loadable assets of a game such as images, data files,
 * and sounds, which are all found in the dist folder.
 * This class controls loading and updates the @reference[Scene] with the loading progress, so that the scene does 
 * not start before all necessary assets are loaded.
 */
export default class ResourceManager {
    // Instance for the singleton class
    private static instance: ResourceManager;
    
    // Booleans to keep track of whether or not the ResourceManager is currently loading something
    /** Whether or not any resources are loading */
    private loading: boolean;
    /** A boolean to indicate that the assets just finished loading */
    private justLoaded: boolean;

    // Functions to do something when loading progresses or is completed such as render a loading screen
    /** A function that is called when loading progresses */
    public onLoadProgress: Function;
    /** A function that is called when loading completes */
    public onLoadComplete: Function;


    /** Number to keep track of how many images need to be loaded*/
    private loadonly_imagesLoaded: number;
    /** Number to keep track of how many images are loaded */
    private loadonly_imagesToLoad: number;
    /** The queue of images we must load */
    private loadonly_imageLoadingQueue: Queue<KeyPathPair>;
    /** A map of the images that are currently loaded and being used by the scene. The reference to these images only exist here for easy cleanup. */
    private images: Map<HTMLImageElement>;

    /** Number to keep track of how many tilemaps need to be loaded */
    private loadonly_spritesheetsLoaded: number;
    /** Number to keep track of how many tilemaps are loaded */
    private loadonly_spritesheetsToLoad: number;
    /** The queue of tilemaps we must load */
    private loadonly_spritesheetLoadingQueue: Queue<KeyPathPair>;
    /** A map of the tilemaps that are currently loaded and (presumably) being used by the scene */
    private spritesheets: Map<Spritesheet>;

    /** Number to keep track of how many tilemaps need to be loaded */
    private loadonly_tilemapsLoaded: number;
    /** Number to keep track of how many tilemaps are loaded */
    private loadonly_tilemapsToLoad: number;
    /** The queue of tilemaps we must load */
    private loadonly_tilemapLoadingQueue: Queue<KeyPathPair>;
    /** A map of the tilemaps that are currently loaded and (presumably) being used by the scene */
    private tilemaps: Map<TiledTilemapData>;

    /** Number to keep track of how many sounds need to be loaded */
    private loadonly_audioLoaded: number;
    /** Number to keep track of how many sounds are loaded */
    private loadonly_audioToLoad: number;
    /** The queue of sounds we must load */
    private loadonly_audioLoadingQueue: Queue<KeyPathPair>;
    /** A map of the sounds that are currently loaded and (presumably) being used by the scene */
    private audioBuffers: Map<AudioBuffer>;

    /** The total number of "types" of things that need to be loaded (i.e. images and tilemaps) */
    private loadonly_typesToLoad: number;

    private loadonly_jsonLoaded: number;
    private loadonly_jsonToLoad: number;
    private loadonly_jsonLoadingQueue: Queue<KeyPathPair>;
    private jsonObjects: Map<Record<string, any>>;

    /* ########## INFORMATION SPECIAL TO WEBGL ########## */
    private gl_WebGLActive: boolean;

    private loadonly_gl_ShaderProgramsLoaded: number;
    private loadonly_gl_ShaderProgramsToLoad: number;
    private loadonly_gl_ShaderLoadingQueue: Queue<KeyPath_Shader>;

    private gl_ShaderPrograms: Map<WebGLProgramType>;

    private gl_Textures: Map<number>;
    private gl_NextTextureID: number;
    private gl_Buffers: Map<WebGLBuffer>; 

    private gl: WebGLRenderingContext;

    /* ########## UNLOADING AND EXCLUSION LIST ########## */
    /** A list of resources that will be unloaded at the end of the current scene */
    private resourcesToUnload: Array<ResourceReference>;

    /** A list of resources to keep until further notice */
    private resourcesToKeep: Array<ResourceReference>;

    private constructor(){
        this.loading = false;
        this.justLoaded = false;

        this.loadonly_imagesLoaded = 0;
        this.loadonly_imagesToLoad = 0;
        this.loadonly_imageLoadingQueue = new Queue();
        this.images = new Map();

        this.loadonly_spritesheetsLoaded = 0;
        this.loadonly_spritesheetsToLoad = 0;
        this.loadonly_spritesheetLoadingQueue = new Queue();
        this.spritesheets = new Map();

        this.loadonly_tilemapsLoaded = 0;
        this.loadonly_tilemapsToLoad = 0;
        this.loadonly_tilemapLoadingQueue = new Queue();
        this.tilemaps = new Map();

        this.loadonly_audioLoaded = 0;
        this.loadonly_audioToLoad = 0;
        this.loadonly_audioLoadingQueue = new Queue();
        this.audioBuffers = new Map();

        this.loadonly_jsonLoaded = 0;
        this.loadonly_jsonToLoad = 0;
        this.loadonly_jsonLoadingQueue = new Queue();
        this.jsonObjects = new Map();

        this.loadonly_gl_ShaderProgramsLoaded = 0;
        this.loadonly_gl_ShaderProgramsToLoad = 0;
        this.loadonly_gl_ShaderLoadingQueue = new Queue();

        this.gl_ShaderPrograms = new Map();

        this.gl_Textures = new Map();
        this.gl_NextTextureID = 0;
        this.gl_Buffers = new Map();

        this.resourcesToUnload = new Array();
        this.resourcesToKeep = new Array();
    };

    /* ######################################## SINGLETON ########################################*/
    /**
     * Returns the current instance of this class or a new instance if none exist
     * @returns The resource manager
     */
    static getInstance(): ResourceManager {
        if(!this.instance){
            this.instance = new ResourceManager();
        }

        return this.instance;
    }

    /* ######################################## PUBLIC FUNCTION ########################################*/
    /**
     * Activates or deactivates the use of WebGL
     * @param flag True if WebGL should be used, false otherwise
     * @param gl The instance of the graphics context, if applicable
     */
    public useWebGL(flag: boolean, gl: WebGLRenderingContext): void {
        this.gl_WebGLActive = flag;

        if(this.gl_WebGLActive){
            this.gl = gl;
        }
    }

    /**
     * Loads an image from file
     * @param key The key to associate the loaded image with
     * @param path The path to the image to load
     */
    public image(key: string, path: string): void {
        this.loadonly_imageLoadingQueue.enqueue({key: key, path: path});
    }

    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    public keepImage(key: string): void {
        this.keepResource(key, ResourceType.IMAGE);
    }

    /**
     * Retrieves a loaded image
     * @param key The key of the loaded image
     * @returns The image element associated with this key
     */
    public getImage(key: string): HTMLImageElement {
        let image = this.images.get(key);
        if(image === undefined){
            throw `There is no image associated with key "${key}"`
        }
        return image;
    }

    /**
     * Loads a spritesheet from file
     * @param key The key to associate the loaded spritesheet with
     * @param path The path to the spritesheet to load
     */
    public spritesheet(key: string, path: string): void {
        this.loadonly_spritesheetLoadingQueue.enqueue({key: key, path: path});
    }

    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
    public keepSpritesheet(key: string): void {
        this.keepResource(key, ResourceType.SPRITESHEET);
    }

    /**
     * Retrieves a loaded spritesheet
     * @param key The key of the spritesheet to load
     * @returns The loaded Spritesheet
     */
    public getSpritesheet(key: string): Spritesheet {
        return this.spritesheets.get(key);
    }

    /**
     * Loads an audio file
     * @param key The key to associate with the loaded audio file
     * @param path The path to the audio file to load
     */
    public audio(key: string, path: string): void {
        this.loadonly_audioLoadingQueue.enqueue({key: key, path: path});
    }

    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
     public keepAudio(key: string): void {
        this.keepResource(key, ResourceType.AUDIO);
    }

    /**
     * Retrieves a loaded audio file
     * @param key The key of the audio file to load
     * @returns The AudioBuffer created from the loaded audio fle
     */
    public getAudio(key: string): AudioBuffer {
        return this.audioBuffers.get(key);
    }

    /**
     * Load a tilemap from a json file. Automatically loads related images
     * @param key The key to associate with the loaded tilemap
     * @param path The path to the tilemap to load
     */
    public tilemap(key: string, path: string): void {
        this.loadonly_tilemapLoadingQueue.enqueue({key: key, path: path});
    }

    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
     public keepTilemap(key: string): void {
        this.keepResource(key, ResourceType.TILEMAP);
    }

    /**
     * Retreives a loaded tilemap
     * @param key The key of the loaded tilemap
     * @returns The tilemap data associated with the key
     */
    public getTilemap(key: string): TiledTilemapData {
        return this.tilemaps.get(key);
    }

    /**
     * Loads an object from a json file.
     * @param key The key to associate with the loaded object
     * @param path The path to the json file to load
     */
    public object(key: string, path: string){
        this.loadonly_jsonLoadingQueue.enqueue({key: key, path: path});
    }

    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
     public keepObject(key: string): void {
        this.keepResource(key, ResourceType.JSON);
    }

    /**
     * Retreives a loaded object
     * @param key The key of the loaded object
     * @returns The object data associated with the key
     */
    public getObject(key: string){
        return this.jsonObjects.get(key);
    }

    /* ######################################## LOAD FUNCTION ########################################*/
    /**
     * Loads all resources currently in the queue
     * @param callback The function to cal when the resources are finished loading
     */
    loadResourcesFromQueue(callback: Function): void {
        this.loadonly_typesToLoad = 5;

        this.loading = true;

        // Load everything in the queues. Tilemaps have to come before images because they will add new images to the queue
        this.loadTilemapsFromQueue(() => {
            console.log("Loaded Tilemaps");
            this.loadSpritesheetsFromQueue(() => {
                console.log("Loaded Spritesheets");
                this.loadImagesFromQueue(() => {
                    console.log("Loaded Images");
                    this.loadAudioFromQueue(() => {
                        console.log("Loaded Audio");
                        this.loadObjectsFromQueue(() => {
                            console.log("Loaded Objects");
                            
                            if(this.gl_WebGLActive){
                                this.gl_LoadShadersFromQueue(() => {
                                    console.log("Loaded Shaders");
                                    this.finishLoading(callback);
                                });
                            } else {
                                this.finishLoading(callback);
                            }
                        })
                    });
                });
            });
        });
    }

    private finishLoading(callback: Function): void {
        // Done loading
        this.loading = false;
        this.justLoaded = true;
        callback();
    }

    /* ######################################## UNLOAD FUNCTION ########################################*/
    
    private keepResource(key: string, type: ResourceType): void {
        console.log("Keep resource...");
        for(let i = 0; i < this.resourcesToUnload.length; i++){
            let resource = this.resourcesToUnload[i];
            if(resource.key === key && resource.resourceType === type){
                console.log("Found resource " + key + " of type " + type + ". Keeping.");
                let resourceToMove = this.resourcesToUnload.splice(i, 1);
                this.resourcesToKeep.push(...resourceToMove);
                return;
            }
        }
    }
    
    /**
     * Deletes references to all resources in the resource manager
     */
    unloadAllResources(): void {
        this.loading = false;
        this.justLoaded = false;

        for(let resource of this.resourcesToUnload){
            // Unload the resource
            this.unloadResource(resource);
        }
    }

    private unloadResource(resource: ResourceReference): void {
        // Delete the resource itself
        switch(resource.resourceType){
            case ResourceType.IMAGE:
                this.images.delete(resource.key);
                if(this.gl_WebGLActive){
                    this.gl_Textures.delete(resource.key);
                }
                break;
            case ResourceType.TILEMAP:
                this.tilemaps.delete(resource.key);
                break;
            case ResourceType.SPRITESHEET:
                this.spritesheets.delete(resource.key);
                break;
            case ResourceType.AUDIO:
                this.audioBuffers.delete(resource.key);
                break;
            case ResourceType.JSON:
                this.jsonObjects.delete(resource.key);
                break;
            case ResourceType.SHADER:
                this.gl_ShaderPrograms.get(resource.key).delete(this.gl);
                this.gl_ShaderPrograms.delete(resource.key);
                break;
        }

        // Delete any dependencies
        for(let dependency of resource.dependencies){
            this.unloadResource(dependency);
        }
    }

    /* ######################################## WORK FUNCTIONS ########################################*/
    /**
     * Loads all tilemaps currently in the tilemap loading queue
     * @param onFinishLoading The function to call when loading is complete
     */
    private loadTilemapsFromQueue(onFinishLoading: Function): void {
        this.loadonly_tilemapsToLoad = this.loadonly_tilemapLoadingQueue.getSize();
        this.loadonly_tilemapsLoaded = 0;

        // If no items to load, we're finished
        if(this.loadonly_tilemapsToLoad === 0){
            onFinishLoading();
            return;
        }

        while(this.loadonly_tilemapLoadingQueue.hasItems()){
            let tilemap = this.loadonly_tilemapLoadingQueue.dequeue();
            this.loadTilemap(tilemap.key, tilemap.path, onFinishLoading);
        }
    }

    /**
     * Loads a singular tilemap 
     * @param key The key of the tilemap
     * @param pathToTilemapJSON The path to the tilemap JSON file
     * @param callbackIfLast The function to call if this is the last tilemap to load
     */
    private loadTilemap(key: string, pathToTilemapJSON: string, callbackIfLast: Function): void {
        this.loadTextFile(pathToTilemapJSON, (fileText: string) => {
            let tilemapObject = <TiledTilemapData>JSON.parse(fileText);
            
            // We can parse the object later - it's much faster than loading
            this.tilemaps.add(key, tilemapObject);
            let resource = new ResourceReference(key, ResourceType.TILEMAP);

            // Grab the tileset images we need to load and add them to the imageloading queue
            for(let tileset of tilemapObject.tilesets){
                if(tileset.image){
                    let key = tileset.image;
                    let path = StringUtils.getPathFromFilePath(pathToTilemapJSON) + key;
                    this.loadonly_imageLoadingQueue.enqueue({key: key, path: path, isDependency: true});

                    // Add this image as a dependency to the tilemap
                    resource.addDependency(new ResourceReference(key, ResourceType.IMAGE));
                } else if(tileset.tiles){
                    for(let tile of tileset.tiles){
                        let key = tile.image;
                        let path = StringUtils.getPathFromFilePath(pathToTilemapJSON) + key;
                        this.loadonly_imageLoadingQueue.enqueue({key: key, path: path, isDependency: true});

                        // Add this image as a dependency to the tilemap
                        resource.addDependency(new ResourceReference(key, ResourceType.IMAGE));
                    }
                }
            }

            // Add the resource reference to the list of resource to unload
            this.resourcesToUnload.push(resource);

            // Finish loading
            this.finishLoadingTilemap(callbackIfLast);
        });
    }

    /**
     * Finish loading a tilemap. Calls the callback function if this is the last tilemap being loaded
     * @param callback The function to call if this is the last tilemap to load
     */
    private finishLoadingTilemap(callback: Function): void {
        this.loadonly_tilemapsLoaded += 1;

        if(this.loadonly_tilemapsLoaded === this.loadonly_tilemapsToLoad){
            // We're done loading tilemaps
            callback();
        }
    }

    /**
     * Loads all spritesheets currently in the spritesheet loading queue
     * @param onFinishLoading The function to call when the spritesheets are done loading
     */
    private loadSpritesheetsFromQueue(onFinishLoading: Function): void {
        this.loadonly_spritesheetsToLoad = this.loadonly_spritesheetLoadingQueue.getSize();
        this.loadonly_spritesheetsLoaded = 0;

        // If no items to load, we're finished
        if(this.loadonly_spritesheetsToLoad === 0){
            onFinishLoading();
            return;
        }

        while(this.loadonly_spritesheetLoadingQueue.hasItems()){
            let spritesheet = this.loadonly_spritesheetLoadingQueue.dequeue();
            this.loadSpritesheet(spritesheet.key, spritesheet.path, onFinishLoading);
        }
    }

    /**
     * Loads a singular spritesheet 
     * @param key The key of the spritesheet to load
     * @param pathToSpritesheetJSON The path to the spritesheet JSON file
     * @param callbackIfLast The function to call if this is the last spritesheet
     */
    private loadSpritesheet(key: string, pathToSpritesheetJSON: string, callbackIfLast: Function): void {
        this.loadTextFile(pathToSpritesheetJSON, (fileText: string) => {
            let spritesheet = <Spritesheet>JSON.parse(fileText);
            
            // We can parse the object later - it's much faster than loading
            this.spritesheets.add(key, spritesheet);

            let resource = new ResourceReference(key, ResourceType.SPRITESHEET);

            // Grab the image we need to load and add it to the imageloading queue
            let path = StringUtils.getPathFromFilePath(pathToSpritesheetJSON) + spritesheet.spriteSheetImage;
            this.loadonly_imageLoadingQueue.enqueue({key: spritesheet.name, path: path, isDependency: true});

            resource.addDependency(new ResourceReference(spritesheet.name, ResourceType.IMAGE));
            this.resourcesToUnload.push(resource);

            // Finish loading
            this.finishLoadingSpritesheet(callbackIfLast);
        });
    }

    /**
     * Finish loading a spritesheet. Calls the callback function if this is the last spritesheet being loaded
     * @param callback The function to call if this is the last spritesheet to load
     */
    private finishLoadingSpritesheet(callback: Function): void {
        this.loadonly_spritesheetsLoaded += 1;

        if(this.loadonly_spritesheetsLoaded === this.loadonly_spritesheetsToLoad){
            // We're done loading spritesheets
            callback();
        }
    }

    /**
     * Loads all images currently in the image loading queue
     * @param onFinishLoading The function to call when there are no more images to load
     */
    private loadImagesFromQueue(onFinishLoading: Function): void {
        this.loadonly_imagesToLoad = this.loadonly_imageLoadingQueue.getSize();
        this.loadonly_imagesLoaded = 0;

        // If no items to load, we're finished
        if(this.loadonly_imagesToLoad === 0){
            onFinishLoading();
            return;
        }

        while(this.loadonly_imageLoadingQueue.hasItems()){
            let image = this.loadonly_imageLoadingQueue.dequeue();
            this.loadImage(image.key, image.path, image.isDependency, onFinishLoading);
        }
    }

    /**
     * Loads a singular image
     * @param key The key of the image to load
     * @param path The path to the image to load
     * @param callbackIfLast The function to call if this is the last image
     */
    public loadImage(key: string, path: string, isDependency: boolean, callbackIfLast: Function): void {
        var image = new Image();

        image.onload = () => {
            // Add to loaded images
            this.images.add(key, image);

            // If not a dependency, push it to the unload list. Otherwise it's managed by something else
            if(!isDependency){
                this.resourcesToUnload.push(new ResourceReference(key, ResourceType.IMAGE));
            }

            // If WebGL is active, create a texture
            if(this.gl_WebGLActive){
                this.createWebGLTexture(key, image);
            }

            // Finish image load
            this.finishLoadingImage(callbackIfLast);
        }

        image.src = path;
    }

    /**
     * Finish loading an image. If this is the last image, it calls the callback function
     * @param callback The function to call if this is the last image
     */
    private finishLoadingImage(callback: Function): void {
        this.loadonly_imagesLoaded += 1;

        if(this.loadonly_imagesLoaded === this.loadonly_imagesToLoad ){
            // We're done loading images
            callback();
        }
    }

    /**
     * Loads all audio currently in the tilemap loading queue
     * @param onFinishLoading The function to call when tilemaps are done loading
     */
    private loadAudioFromQueue(onFinishLoading: Function){
        this.loadonly_audioToLoad = this.loadonly_audioLoadingQueue.getSize();
        this.loadonly_audioLoaded = 0;

        // If no items to load, we're finished
        if(this.loadonly_audioToLoad === 0){
            onFinishLoading();
            return;
        }

        while(this.loadonly_audioLoadingQueue.hasItems()){
            let audio = this.loadonly_audioLoadingQueue.dequeue();
            this.loadAudio(audio.key, audio.path, onFinishLoading);
        }
    }

    /**
     * Load a singular audio file
     * @param key The key to the audio file to load
     * @param path The path to the audio file to load
     * @param callbackIfLast The function to call if this is the last audio file to load
     */
    private loadAudio(key: string, path: string, callbackIfLast: Function): void {
        let audioCtx = AudioManager.getInstance().getAudioContext();

        let request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            audioCtx.decodeAudioData(request.response, (buffer) => {
                // Add to list of audio buffers
                this.audioBuffers.add(key, buffer);
                this.resourcesToUnload.push(new ResourceReference(key, ResourceType.AUDIO));

                // Finish loading sound
                this.finishLoadingAudio(callbackIfLast);
            }, (error) =>{
                throw "Error loading sound";
            });
        }
        request.send();
    }

    /**
     * Finish loading an audio file. Calls the callback functon if this is the last audio sample being loaded.
     * @param callback The function to call if this is the last audio file to load
     */
    private finishLoadingAudio(callback: Function): void {
        this.loadonly_audioLoaded += 1;

        if(this.loadonly_audioLoaded === this.loadonly_audioToLoad){
            // We're done loading audio
            callback();
        }
    }

    /**
     * Loads all objects currently in the object loading queue
     * @param onFinishLoading The function to call when there are no more objects to load
     */
    private loadObjectsFromQueue(onFinishLoading: Function): void {
        this.loadonly_jsonToLoad = this.loadonly_jsonLoadingQueue.getSize();
        this.loadonly_jsonLoaded = 0;

        // If no items to load, we're finished
        if(this.loadonly_jsonToLoad === 0){
            onFinishLoading();
            return;
        }

        while(this.loadonly_jsonLoadingQueue.hasItems()){
            let obj = this.loadonly_jsonLoadingQueue.dequeue();
            this.loadObject(obj.key, obj.path, onFinishLoading);
        }
    }

    /**
     * Loads a singular object
     * @param key The key of the object to load
     * @param path The path to the object to load
     * @param callbackIfLast The function to call if this is the last object
     */
    public loadObject(key: string, path: string, callbackIfLast: Function): void {
        this.loadTextFile(path, (fileText: string) => {
            let obj = JSON.parse(fileText);
            this.jsonObjects.add(key, obj);

            this.resourcesToUnload.push(new ResourceReference(key, ResourceType.JSON));

            this.finishLoadingObject(callbackIfLast);
        });
    }

    /**
     * Finish loading an object. If this is the last object, it calls the callback function
     * @param callback The function to call if this is the last object
     */
    private finishLoadingObject(callback: Function): void {
        this.loadonly_jsonLoaded += 1;

        if(this.loadonly_jsonLoaded === this.loadonly_jsonToLoad){
            // We're done loading objects
            callback();
        }
    }

    /* ########## WEBGL SPECIFIC FUNCTIONS ########## */

    public getTexture(key: string): number {
        return this.gl_Textures.get(key);
    }

    public getShaderProgram(key: string): WebGLProgram {
        return this.gl_ShaderPrograms.get(key).program;
    }

    public getBuffer(key: string): WebGLBuffer {
        return this.gl_Buffers.get(key);
    }

    private createWebGLTexture(imageKey: string, image: HTMLImageElement): void {
        // Get the texture ID
        const textureID = this.getTextureID(this.gl_NextTextureID);

        // Create the texture
        const texture = this.gl.createTexture();

        // Set up the texture
        // Enable texture0
        this.gl.activeTexture(textureID);

        // Bind our texture to texture 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Set the texture parameters
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        // Set the texture image
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        // Add the texture to our map with the same key as the image
        this.gl_Textures.add(imageKey, this.gl_NextTextureID);

        // Increment the key
        this.gl_NextTextureID += 1;
    }

    private getTextureID(id: number): number {
        // Start with 9 cases - this can be expanded if needed, but for the best performance,
        // Textures should be stitched into an atlas
        switch(id){
            case 0: return this.gl.TEXTURE0;
            case 1: return this.gl.TEXTURE1;
            case 2: return this.gl.TEXTURE2;
            case 3: return this.gl.TEXTURE3;
            case 4: return this.gl.TEXTURE4;
            case 5: return this.gl.TEXTURE5;
            case 6: return this.gl.TEXTURE6;
            case 7: return this.gl.TEXTURE7;
            case 8: return this.gl.TEXTURE8;
            default: return this.gl.TEXTURE9;
        }
    }

    public createBuffer(key: string): void {
        if(this.gl_WebGLActive){
            let buffer = this.gl.createBuffer();

            this.gl_Buffers.add(key, buffer);
        }
    }

    /**
     * Enqueues loading of a new shader program
     * @param key The key of the shader program
     * @param vShaderFilepath 
     * @param fShaderFilepath 
     */
    public shader(key: string, vShaderFilepath: string, fShaderFilepath: string): void {
        let splitPath = vShaderFilepath.split(".");
        let end = splitPath[splitPath.length - 1];

        if(end !== "vshader"){
            throw `${vShaderFilepath} is not a valid vertex shader - must end in ".vshader`;
        }

        splitPath = fShaderFilepath.split(".");
        end = splitPath[splitPath.length - 1];

        if(end !== "fshader"){
            throw `${fShaderFilepath} is not a valid vertex shader - must end in ".fshader`;
        }

        let paths = new KeyPath_Shader();
        paths.key = key;
        paths.vpath = vShaderFilepath;
        paths.fpath = fShaderFilepath;

        this.loadonly_gl_ShaderLoadingQueue.enqueue(paths);
    }

    /**
     * Tells the resource manager to keep this resource
     * @param key The key of the resource
     */
     public keepShader(key: string): void {
        this.keepResource(key, ResourceType.IMAGE);
    }

    private gl_LoadShadersFromQueue(onFinishLoading: Function): void {
        this.loadonly_gl_ShaderProgramsToLoad = this.loadonly_gl_ShaderLoadingQueue.getSize();
        this.loadonly_gl_ShaderProgramsLoaded = 0;

        // If webGL isn'active or there are no items to load, we're finished
        if(!this.gl_WebGLActive || this.loadonly_gl_ShaderProgramsToLoad === 0){
            onFinishLoading();
            return;
        }

        while(this.loadonly_gl_ShaderLoadingQueue.hasItems()){
            let shader = this.loadonly_gl_ShaderLoadingQueue.dequeue();
            this.gl_LoadShader(shader.key, shader.vpath, shader.fpath, onFinishLoading);
        }
    }

    private gl_LoadShader(key: string, vpath: string, fpath: string, callbackIfLast: Function): void {
        this.loadTextFile(vpath, (vFileText: string) => {
            const vShader = vFileText;

            this.loadTextFile(fpath, (fFileText: string) => {
                const fShader = fFileText

                // Extract the program and shaders
                const [shaderProgram, vertexShader, fragmentShader] = this.createShaderProgram(vShader, fShader);

                // Create a wrapper type
                const programWrapper = new WebGLProgramType();
                programWrapper.program = shaderProgram;
                programWrapper.vertexShader = vertexShader;
                programWrapper.fragmentShader = fragmentShader;

                // Add to our map
                this.gl_ShaderPrograms.add(key, programWrapper);

                this.resourcesToUnload.push(new ResourceReference(key, ResourceType.SHADER));

                // Finish loading
                this.gl_FinishLoadingShader(callbackIfLast);
            });
        });
    }

    private gl_FinishLoadingShader(callback: Function): void {
        this.loadonly_gl_ShaderProgramsLoaded += 1;

        if(this.loadonly_gl_ShaderProgramsLoaded === this.loadonly_gl_ShaderProgramsToLoad){
            // We're done loading shaders
            callback();
        }
    }

    private createShaderProgram(vShaderSource: string, fShaderSource: string){
        const vertexShader = this.loadVertexShader(vShaderSource);
        const fragmentShader = this.loadFragmentShader(fShaderSource);
    
        if(vertexShader === null || fragmentShader === null){
            // We had a problem intializing - error
            return null;
        }
    
        // Create a shader program
        const program = this.gl.createProgram();
        if(!program) {
            // Error creating
            console.warn("Failed to create program");
            return null;
        }
    
        // Attach our vertex and fragment shader
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
    
        // Link
        this.gl.linkProgram(program);
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
            // Error linking
            const error = this.gl.getProgramInfoLog(program);
            console.warn("Failed to link program: " + error);
    
            // Clean up
            this.gl.deleteProgram(program);
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            return null;
        }
    
        // We successfully create a program
        return [program, vertexShader, fragmentShader];
    }
    
    private loadVertexShader(shaderSource: string): WebGLShader{
        // Create a new vertex shader
        return this.loadShader(this.gl.VERTEX_SHADER, shaderSource);
    }
    
    private loadFragmentShader(shaderSource: string): WebGLShader{
        // Create a new fragment shader
        return this.loadShader(this.gl.FRAGMENT_SHADER, shaderSource);	
    }
    
    private loadShader(type: number, shaderSource: string): WebGLShader{
        const shader = this.gl.createShader(type);
    
        // If we couldn't create the shader, error
        if(shader === null){
            console.warn("Unable to create shader");
            return null;
        }
    
        // Add the source to the shader and compile
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);
    
        // Make sure there were no errors during this process
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
            // Not compiled - error
            const error = this.gl.getShaderInfoLog(shader);
            console.warn("Failed to compile shader: " + error);
    
            // Clean up
            this.gl.deleteShader(shader);
            return null;
        }
    
        // Sucess, so return the shader
        return shader;
    }

    /* ########## GENERAL LOADING FUNCTIONS ########## */

    private loadTextFile(textFilePath: string, callback: Function): void {
        let xobj: XMLHttpRequest = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', textFilePath, true);
        xobj.onreadystatechange = function () {
            if ((xobj.readyState == 4) && (xobj.status == 200)) {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    /* ########## LOADING BAR INFO ########## */

    private getLoadPercent(): number {
        return (this.loadonly_tilemapsLoaded/this.loadonly_tilemapsToLoad
            + this.loadonly_spritesheetsLoaded/this.loadonly_spritesheetsToLoad
            + this.loadonly_imagesLoaded/this.loadonly_imagesToLoad
            + this.loadonly_audioLoaded/this.loadonly_audioToLoad)
            / this.loadonly_typesToLoad;
    }

    update(deltaT: number): void {
        if(this.loading){
            if(this.onLoadProgress){
                this.onLoadProgress(this.getLoadPercent());
            }
        } else if(this.justLoaded){
            this.justLoaded = false;
            if(this.onLoadComplete){
                this.onLoadComplete();
            }
        }
    }
}

/**
 * A class representing a reference to a resource.
 * This is used for the exemption list to assure assets and their dependencies don't get
 * destroyed if they are still needed.
 */
class ResourceReference {
    key: string;
    resourceType: ResourceType;
    dependencies: Array<ResourceReference>;

    constructor(key: string, resourceType: ResourceType){
        this.key = key;
        this.resourceType = resourceType;
        this. dependencies = new Array();
    }

    addDependency(resource: ResourceReference): void {
        this.dependencies.push(resource);
    }
}


enum ResourceType {
    IMAGE = "IMAGE",
    TILEMAP = "TILEMAP",
    SPRITESHEET = "SPRITESHEET",
    AUDIO = "AUDIO",
    JSON = "JSON",
    SHADER = "SHADER"
}

/**
 * A pair representing a key and the path of the resource to load
 */
class KeyPathPair {
    key: string;
    path: string;
    isDependency?: boolean = false;
}

class KeyPath_Shader {
    key: string;
    vpath: string;
    fpath: string;
}
import ArrayUtils from "../Utils/ArrayUtils";

// @ignorePage

/**
 * The options to give a @reference[Scene] for initialization
 */
export default class SceneOptions {
    physics: {
        numPhysicsLayers: number,
        physicsLayerNames: Array<string>,
        physicsLayerCollisions: Array<Array<number>>;
    }

    static parse(options: Record<string, any>): SceneOptions{
        let sOpt = new SceneOptions();

        sOpt.physics = {
            numPhysicsLayers: 10,
            physicsLayerNames: null,
            physicsLayerCollisions: ArrayUtils.ones2d(10, 10)
        };

        if(options.physics){
            if(options.physics.numPhysicsLayers)        sOpt.physics.numPhysicsLayers = options.physics.numPhysicsLayers;
            if(options.physics.physicsLayerNames)       sOpt.physics.physicsLayerNames = options.physics.physicsLayerNames;
            if(options.physics.physicsLayerCollisions)  sOpt.physics.physicsLayerCollisions = options.physics.physicsLayerCollisions;
        }

        return sOpt;
    }
}
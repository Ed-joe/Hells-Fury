// @ignorePage

/** The options for initializing the @reference[GameLoop] */
export default class GameOptions {
    /** The size of the viewport */
    canvasSize: {x: number, y: number};

    /* The default level of zoom */
    zoomLevel: number;

    /** The color to clear the canvas to each frame */
    clearColor: {r: number, g: number, b: number}

    /* A list of input bindings */
    inputs: Array<{name: string, keys: Array<string>}>;

    /* Whether or not the debug rendering should occur */
    showDebug: boolean;

    /* Whether or not the stats rendering should occur */
    showStats: boolean;

    /* Whether or not to use webGL */
    useWebGL: boolean;

    /**
     * Parses the data in the raw options object
     * @param options The game options as a Record
     * @returns A version of the options converted to a GameOptions object
     */
    static parse(options: Record<string, any>): GameOptions {
        let gOpt = new GameOptions();

        gOpt.canvasSize = options.canvasSize ? options.canvasSize : {x: 800, y: 600};
        gOpt.zoomLevel = options.zoomLevel ? options.zoomLevel : 1;
        gOpt.clearColor = options.clearColor ? options.clearColor : {r: 255, g: 255, b: 255};
        gOpt.inputs = options.inputs ? options.inputs : [];
        gOpt.showDebug = !!options.showDebug;
        gOpt.showStats = !!options.showStats;
        gOpt.useWebGL = !!options.useWebGL;

        return gOpt;
    }
}
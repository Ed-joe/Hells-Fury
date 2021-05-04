import Game from "./Wolfie2D/Loop/Game";
import SplashScreen from "./Scenes/SplashScreen";
import RegistryManager from "./Wolfie2D/Registry/RegistryManager";
import WeaponRegistry from "./GameSystems/Registry/WeaponRegistry";
import WeaponTypeRegistry from "./GameSystems/Registry/WeaponTypeRegistry";
import FixedUpdateGameLoop from "./Wolfie2D/Loop/FixedUpdateGameLoop";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1280, y: 720},          // The size of the game
        clearColor: {r: 0, g: 0, b: 0},         // The color the game clears to
        inputs: [                               // setup inputs
            {name: "up", keys: ["w"]},
            {name: "down", keys: ["s"]},
            {name: "left", keys: ["a"]},
            {name: "right", keys: ["d"]},
            {name: "interact", keys: ["e"]},
            {name: "pause", keys: ["escape"]},
            {name: "invincible", keys: ["i"]},
            {name: "coins", keys: ["c"]},
            {name: "lust", keys: ["1"]},
            {name: "wrath", keys: ["2"]},
            {name: "gluttony", keys: ["3"]}
        ]
    }

    // setup custom weapon registry
    let weaponTemplateRegistry = new WeaponRegistry();
    RegistryManager.addCustomRegistry("weaponTemplates", weaponTemplateRegistry);
    
    let weaponTypeRegistry = new WeaponTypeRegistry();
    RegistryManager.addCustomRegistry("weaponTypes", weaponTypeRegistry);

    // Create a game with the options specified
    const game = new Game(options);
    let gameLoop = <FixedUpdateGameLoop> game.getGameLoop();
    gameLoop.setMaxFPS(80);
    // Start our game
    game.start(SplashScreen, {});
})();

function runTests(){};
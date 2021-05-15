import StateMachineAI from "../Wolfie2D/AI/StateMachineAI";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import State from "../Wolfie2D/DataTypes/State/State";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import GameNode from "../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import BattlerAI from "./BattlerAI";
import Attack from "./CoinEnemyStates/Attack";

export default class Coin_EnemyAI extends StateMachineAI{
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The default movement speed of this AI */
    speed: number = 20;

    /** A reference to the player object */
    player: GameNode;

    //starting velocity
    start_velocity: Vec2

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.addState(EnemyStates.DEFAULT, new Attack(this, owner));
        this.start_velocity = new Vec2(options.velocityX, options.velocityY);
        this.player = options.player;

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);
    }

    activate(options: Record<string, any>): void {
    }

    damage(damage: number): void {
    }

    getPlayerPosition(): Vec2 {
        let pos = this.player.position;

        // Get the new player location
        let start = this.owner.position.clone();
        let delta = pos.clone().sub(start);

        // Iterate through the tilemap region until we find a collision
        let minX = Math.min(start.x, pos.x);
        let maxX = Math.max(start.x, pos.x);
        let minY = Math.min(start.y, pos.y);
        let maxY = Math.max(start.y, pos.y);

        // Get the wall tilemap
        let walls = <OrthogonalTilemap>this.owner.getScene().getLayer("Wall").getItems()[0];

        let minIndex = walls.getColRowAt(new Vec2(minX, minY));
        let maxIndex = walls.getColRowAt(new Vec2(maxX, maxY));

        let tileSize = walls.getTileSize();

        for(let col = minIndex.x; col <= maxIndex.x; col++){
            for(let row = minIndex.y; row <= maxIndex.y; row++){
                let tile_val = walls.getTileAtRowCol(new Vec2(col, row));
                if(tile_val === 18 || tile_val === 19){
                    // Get the position of this tile
                    let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);

                    // Create a collider for this tile
                    let collider = new AABB(tilePos, tileSize.scaled(1/2));

                    let hit = collider.intersectSegment(start, delta, Vec2.ZERO);

                    if(hit !== null && start.distanceSqTo(hit.pos) < start.distanceSqTo(pos)){
                        // We hit a wall, we can't see the player
                        return null;
                    }
                }
            }
        }

        return pos;
    }

    // State machine defers updates and event handling to its children
    // Check super classes for details
}

export enum EnemyStates {
    DEFAULT = "default",
    ATTACKING = "attacking",
    PREVIOUS = "previous"
}
import GameNode from "../Nodes/GameNode";
import Physical from "../DataTypes/Interfaces/Physical";
import Tilemap from "../Nodes/Tilemap";
import PhysicsManager from "./PhysicsManager";
import Vec2 from "../DataTypes/Vec2";
import AABB from "../DataTypes/Shapes/AABB";
import OrthogonalTilemap from "../Nodes/Tilemaps/OrthogonalTilemap";
import AreaCollision from "../DataTypes/Physics/AreaCollision";
import Unique from "../DataTypes/Interfaces/Unique";

/**
 * ALGORITHM:
 * 	In an effort to keep things simple and working effectively, each dynamic node will resolve its
 * 	collisions considering the rest of the world as static.
 * 
 * 	Collision detecting will happen first. This can be considered a broad phase, but it is not especially
 * 	efficient, as it does not need to be for this game engine. Every dynamic node is checked against every
 * 	other node for collision area. If collision area is non-zero (meaning the current node sweeps into another),
 * 	it is added to a list of hits.
 * 
 * 	INITIALIZATION:
 * 		- Physics constants are reset
 * 		- Swept shapes are recalculated. If a node isn't moving, it is skipped.
 * 
 * 	COLLISION DETECTION:
 * 		- For a node, collision area will be calculated using the swept AABB of the node against every other AABB in a static state
 * 		- These collisions will be sorted by area in descending order
 * 	
 * 	COLLISION RESOLUTION:
 * 		- For each hit, time of collision is calculated using a swept line through the AABB of the static node expanded
 * 			with minkowski sums (discretely, but the concept is there)
 * 		- The collision is resolved based on the near time of the collision (from method of separated axes)
 * 			- X is resolved by near x, Y by near y.
 * 			- There is some fudging to allow for sliding along walls of separate colliders. Sorting by area also helps with this.
 * 			- Corner to corner collisions are resolve to favor x-movement. This is in consideration of platformers, to give
 * 				the player some help with jumps
 * 
 * 	Pros:
 * 		- Everything happens with a consistent time. There is a distinct before and after for each resolution.
 * 		- No back-tracking needs to be done. Once we resolve a node, it is definitively resolved.
 * 	
 * 	Cons:
 * 		- Nodes that are processed early have movement priority over other nodes. This can lead to some undesirable interactions.
 */
export default class BasicPhysicsManager extends PhysicsManager {

	/** The array of static nodes */
	protected staticNodes: Array<Physical>;

	/** The array of dynamic nodes */
	protected dynamicNodes: Array<Physical>;

	/** The array of tilemaps */
	protected tilemaps: Array<Tilemap>;

	/** An array of the collision masks for each group */
	protected collisionMasks: Array<number>;

	constructor(options: Record<string, any>){
		super();
		this.staticNodes = new Array();
		this.dynamicNodes = new Array();
		this.tilemaps = new Array();
		this.collisionMasks = new Array(32);

		// Parse options
		this.parseOptions(options);
	}

	/**
	 * Parses the options for constructing the physics manager
	 * @param options A record of options
	 */
	protected parseOptions(options: Record<string, any>): void {
		if(options.groupNames !== undefined && options.collisions !== undefined){
			for(let i = 0; i < options.groupNames.length; i++){
				let group = options.groupNames[i];

				// Register the group name and number
				this.groupNames[i] = group;

				this.groupMap.set(group, 1 << i);

				let collisionMask = 0;

				for(let j = 0; j < options.collisions[i].length; j++){
					if(options.collisions[i][j]){
						collisionMask |= 1 << j;
					}
				}

				this.collisionMasks[i] = collisionMask;
			}
		}
	}

	// @override
	registerObject(node: Physical): void {
		if(node.isStatic){
			// Static and not collidable
			this.staticNodes.push(node);
		} else {
			// Dynamic and not collidable
			this.dynamicNodes.push(node);
		}
	}

	// @override
	deregisterObject(node: Physical): void {
		console.log("Deregistering physics object");
		if(node.isStatic){
			// Remove the node from the static list
			const index = this.staticNodes.indexOf(node);
			this.staticNodes.splice(index, 1);
		} else {
			// Remove the node from the dynamic list
			const index = this.dynamicNodes.indexOf(node);
			this.dynamicNodes.splice(index, 1);
		}
	}

	// @override
	registerTilemap(tilemap: Tilemap): void {
		this.tilemaps.push(tilemap);
	}

	// @override
	deregisterTilemap(tilemap: Tilemap): void {
		const index = this.tilemaps.indexOf(tilemap);
		this.tilemaps.splice(index, 1);
	}

	// @override
	update(deltaT: number): void {
		for(let node of this.dynamicNodes){
			/*---------- INITIALIZATION PHASE ----------*/
			// Clear frame dependent boolean values for each node
			node.onGround = false;
			node.onCeiling = false;
			node.onWall = false;
			node.collidedWithTilemap = false;
			node.isColliding = false;

			// If this node is not active, don't process it
			if(!node.active){
				continue;
			}

			// Update the swept shapes of each node
			if(node.moving){
				// If moving, reflect that in the swept shape
				node.sweptRect.sweep(node._velocity, node.collisionShape.center, node.collisionShape.halfSize);
			} else {
				// If our node isn't moving, don't bother to check it (other nodes will detect if they run into it)
				node._velocity.zero();
				continue;
			}

			/*---------- DETECTION PHASE ----------*/
			// Gather a set of overlaps
			let overlaps = new Array<AreaCollision>();

			let groupIndex = Math.log2(node.group);

			// First, check this node against every static node (order doesn't actually matter here, since we sort anyways)
			for(let other of this.staticNodes){
				// Ignore inactive nodes
				if(!other.active) continue;

				let collider = other.collisionShape.getBoundingRect();
				let area = node.sweptRect.overlapArea(collider);
				if(area > 0){
					// We had a collision
					overlaps.push(new AreaCollision(area, collider, other, "GameNode", null));
				}
			}

			// Then, check it against every dynamic node
			for(let other of this.dynamicNodes){
				// Ignore ourselves
				if(node === other) continue;

				// Ignore inactive nodes
				if(!other.active) continue;

				let collider = other.collisionShape.getBoundingRect();
				let area = node.sweptRect.overlapArea(collider);
				if(area > 0){
					// We had a collision
					overlaps.push(new AreaCollision(area, collider, other, "GameNode", null));
				}
			}

			// Lastly, gather a set of AABBs from the tilemap.
			// This step involves the most extra work, so it is abstracted into a method
			for(let tilemap of this.tilemaps){
				// Ignore inactive tilemaps
				if(!tilemap.active) continue;

				if(tilemap instanceof OrthogonalTilemap){
					this.collideWithOrthogonalTilemap(node, tilemap, overlaps);
				}
			}

			// Sort the overlaps by area
			overlaps = overlaps.sort((a, b) => b.area - a.area);

			// Keep track of hits to use later
			let hits = [];

			/*---------- RESOLUTION PHASE ----------*/
			// For every overlap, determine if we need to collide with it and when
			for(let overlap of overlaps){
				// Ignore nodes we don't interact with
				if((this.collisionMasks[groupIndex] & overlap.other.group) === 0) continue;

				// Do a swept line test on the static AABB with this AABB size as padding (this is basically using a minkowski sum!)
				// Start the sweep at the position of this node with a delta of _velocity
				const point = node.collisionShape.center;
				const delta = node._velocity;
				const padding = node.collisionShape.halfSize;
				const otherAABB = overlap.collider;


				const hit = otherAABB.intersectSegment(node.collisionShape.center, node._velocity, node.collisionShape.halfSize);

				overlap.hit = hit;

				if(hit !== null){
					hits.push(hit);

					// We got a hit, resolve with the time inside of the hit
					let tnearx = hit.nearTimes.x;
					let tneary = hit.nearTimes.y;

					// Allow edge clipping (edge overlaps don't count, only area overlaps)
					// Importantly don't allow both cases to be true. Then we clip through corners. Favor x to help players land jumps
					if(tnearx < 1.0 && (point.y === otherAABB.top - padding.y || point.y === otherAABB.bottom + padding.y) && delta.x !== 0) {
						tnearx = 1.0;
					} else if(tneary < 1.0 && (point.x === otherAABB.left - padding.x || point.x === otherAABB.right + padding.x) && delta.y !== 0) {
						tneary = 1.0;
					}


					if(hit.nearTimes.x >= 0 && hit.nearTimes.x < 1){
						// Any tilemap objects that made it here are collidable
						if(overlap.type === "Tilemap" || overlap.other.isCollidable){
							node._velocity.x = node._velocity.x * tnearx;
							node.isColliding = true;
						}
					}

					if(hit.nearTimes.y >= 0 && hit.nearTimes.y < 1){
						// Any tilemap objects that made it here are collidable
						if(overlap.type === "Tilemap" || overlap.other.isCollidable){
							node._velocity.y = node._velocity.y * tneary;
							node.isColliding = true;
						}
					}
				}
			}
			
			/*---------- INFORMATION/TRIGGER PHASE ----------*/
			// Check if we ended up on the ground, ceiling or wall
			// Also check for triggers
			for(let overlap of overlaps){
				// Check for a trigger. If we care about the trigger, react
				if(overlap.other.isTrigger && (overlap.other.triggerMask & node.group)){
					// Get the bit that this group is represented by
					let index = Math.floor(Math.log2(node.group));

					// Extract the triggerEnter event name
					this.emitter.fireEvent(overlap.other.triggerEnters[index], {
						node: (<GameNode>node).id,
						other: (<GameNode>overlap.other).id
					});
				}

				// Ignore collision sides for nodes we don't interact with
				if((this.collisionMasks[groupIndex] & overlap.other.group) === 0) continue;

				// Only check for direction if the overlap was collidable
				if(overlap.type === "Tilemap" || overlap.other.isCollidable){
					let collisionSide = overlap.collider.touchesAABBWithoutCorners(node.collisionShape.getBoundingRect());
					if(collisionSide !== null){
						// If we touch, not including corner cases, check the collision normal
						if(overlap.hit !== null){
							// If we hit a tilemap, keep track of it
							if(overlap.type == "Tilemap"){
								node.collidedWithTilemap = true;
							}

							if(collisionSide.y === -1){
								// Node is on top of overlap, so onGround
								node.onGround = true;
							} else if(collisionSide.y === 1){
								// Node is on bottom of overlap, so onCeiling
								node.onCeiling = true;
							} else {
								// Node wasn't touching on y, so it is touching on x
								node.onWall = true;
							}
						}
					}
				}
			}

			// Resolve the collision with the node, and move it
			node.finishMove();
		}
	}

	/**
	 * Handles a collision between this node and an orthogonal tilemap
	 * @param node The node
	 * @param tilemap The tilemap the node may be colliding with
	 * @param overlaps The list of overlaps
	 */
	protected collideWithOrthogonalTilemap(node: Physical, tilemap: OrthogonalTilemap, overlaps: Array<AreaCollision>): void {
		// Get the min and max x and y coordinates of the moving node
		let min = new Vec2(node.sweptRect.left, node.sweptRect.top);
		let max = new Vec2(node.sweptRect.right, node.sweptRect.bottom);

		// Convert the min/max x/y to the min and max row/col in the tilemap array
		let minIndex = tilemap.getColRowAt(min);
		let maxIndex = tilemap.getColRowAt(max);

		let tileSize = tilemap.getTileSize();

		// Loop over all possible tiles (which isn't many in the scope of the velocity per frame)
		for(let col = minIndex.x; col <= maxIndex.x; col++){
			for(let row = minIndex.y; row <= maxIndex.y; row++){
				if(tilemap.isTileCollidable(col, row)){
					// Get the position of this tile
					let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);

					// Create a new collider for this tile
					let collider = new AABB(tilePos, tileSize.scaled(1/2));

					// Calculate collision area between the node and the tile
					let area = node.sweptRect.overlapArea(collider);
					if(area > 0){
						// We had a collision
						overlaps.push(new AreaCollision(area, collider, tilemap, "Tilemap", new Vec2(col, row)));
					}
				}
			}
		}
	}
}
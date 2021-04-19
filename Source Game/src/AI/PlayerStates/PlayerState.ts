import State from "../../Wolfie2D/DataTypes/State/State";
import StateMachine from "../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import PlayerController from "../PlayerController";


export default abstract class PlayerState extends State {
	owner: AnimatedSprite;
	parent: PlayerController;

	constructor(parent: StateMachine, owner: AnimatedSprite){
		super(parent);
		this.owner = owner;
	}

	getInputDirection(): Vec2 {
		let direction = Vec2.ZERO;
		direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
        direction.y = (Input.isPressed("up") ? -1 : 0) + (Input.isPressed("down") ? 1 : 0);
		return direction;
	}

	update(deltaT: number): void {
		// Do movement
        this.owner.move(this.parent.curr_velocity);
	}
}
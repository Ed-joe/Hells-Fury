import State from "../../Wolfie2D/DataTypes/State/State";
import StateMachine from "../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import PlayerController from "../PlayerController";
import { Game_Events } from "../../GameSystems/game_enums";

export default abstract class PlayerState extends State {
    owner: GameNode;
    parent: PlayerController;

    constructor(parent: StateMachine, owner: GameNode) {
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
        // do movement
        this.owner.move(this.parent.curr_velocity)

        // Get the unit vector in the attack direction
        this.parent.attack_direction = this.owner.position.dirTo(Input.getGlobalMousePosition());

        // update rotation for attacking
        this.owner.attack_direction = Vec2.UP.angleToCCW(this.parent.attack_direction);

        // invincible cheat for play testing ##CHEAT##
        if(Input.isJustPressed("invincible")) {
            this.parent.invincible_cheat = !this.parent.invincible_cheat;
            console.log("invincible: " + this.parent.invincible_cheat);
        }

        // pause functionality
        if(Input.isJustPressed("pause")){
            if(this.owner.getScene().getLayer("Pause").isHidden()){
                this.emitter.fireEvent(Game_Events.ON_PAUSE);
            }else{
                this.emitter.fireEvent(Game_Events.ON_UNPAUSE);
            }
        }
    }
}
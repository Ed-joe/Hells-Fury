import State from "./../../Wolfie2D/DataTypes/State/State";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import HoundAI from "../HoundAI";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default abstract class EnemyState extends State {
    protected parent: HoundAI;
    protected owner: AnimatedSprite;

    constructor(parent: HoundAI, owner: AnimatedSprite){
      super(parent);
      this.owner = owner;
    }
}
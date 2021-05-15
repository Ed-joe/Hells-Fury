import State from "./../../Wolfie2D/DataTypes/State/State";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import WrathAI from "../WrathAI";

export default abstract class BossState extends State {
    protected parent: WrathAI;
    protected owner: AnimatedSprite;

    constructor(parent: WrathAI, owner: AnimatedSprite){
      super(parent);
      this.owner = owner;
    }
}
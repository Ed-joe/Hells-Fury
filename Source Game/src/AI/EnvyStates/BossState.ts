import State from "./../../Wolfie2D/DataTypes/State/State";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import EnemyAI from "../EnvyAI";

export default abstract class BossState extends State {
    protected parent: EnemyAI;
    protected owner: AnimatedSprite;

    constructor(parent: EnemyAI, owner: AnimatedSprite){
      super(parent);
      this.owner = owner;
    }
}
import State from "./../../Wolfie2D/DataTypes/State/State";
import GameNode from "./../../Wolfie2D/Nodes/GameNode";
import EnemyAI from "../GluttonyAI";

export default abstract class BossState extends State {
    protected parent: EnemyAI;
    protected owner: GameNode;

    constructor(parent: EnemyAI, owner: GameNode){
      super(parent);
      this.owner = owner;
    }
}
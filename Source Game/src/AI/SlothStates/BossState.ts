import State from "./../../Wolfie2D/DataTypes/State/State";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import SlothAI from "../SlothAI";

export default abstract class BossState extends State {
    protected parent: SlothAI;
    protected owner: AnimatedSprite;

    constructor(parent: SlothAI, owner: AnimatedSprite){
      super(parent);
      this.owner = owner;
    }
}
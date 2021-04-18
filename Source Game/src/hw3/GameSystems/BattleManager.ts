import GameNode from "../../Wolfie2D/Nodes/GameNode";
import BattlerAI from "../AI/BattlerAI";
import Weapon from "./items/Weapon";

export default class BattleManager {
    player: BattlerAI;

    enemies: Array<BattlerAI>;

    handleInteraction(attackerType: string, weapon: Weapon){
        if(attackerType === "player"){
            // Check for collisions with enemies
            for(let enemy of this.enemies){
                if(weapon.hits(enemy.owner)){
                    enemy.damage(weapon.type.damage);
                }
            }
        } else {
            // Check for collision with player
            if(weapon.hits(this.player.owner)){
                this.player.damage(weapon.type.damage);
            }
        }
    }

    setPlayer(player: BattlerAI): void {
        this.player = player;
    }

    setEnemies(enemies: Array<BattlerAI>): void {
        this.enemies = enemies;
    }
}
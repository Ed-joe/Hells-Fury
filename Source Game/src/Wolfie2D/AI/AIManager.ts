import Actor from "../DataTypes/Interfaces/Actor";
import Updateable from "../DataTypes/Interfaces/Updateable";
import AI from "../DataTypes/Interfaces/AI";
import Map from "../DataTypes/Map";

/**
 * A manager class for all of the AI in a scene.
 * Keeps a list of registered actors and handles AI generation for actors.
 */
export default class AIManager implements Updateable {
	/** The array of registered actors */
	actors: Array<Actor>;
	/** Maps AI names to their constructors */
	registeredAI: Map<AIConstructor>;

	constructor(){
		this.actors = new Array();
		this.registeredAI = new Map();
	}

	/**
	 * Registers an actor with the AIManager
	 * @param actor The actor to register
	 */
	registerActor(actor: Actor): void {
		this.actors.push(actor);
	}

	removeActor(actor: Actor): void {
		let index = this.actors.indexOf(actor);

		if(index !== -1){
			this.actors.splice(index, 1);
		}
	}

	/**
	 * Registers an AI with the AIManager for use later on
	 * @param name The name of the AI to register
	 * @param constr The constructor for the AI
	 */
	registerAI(name: string, constr: new <T extends AI>() => T ): void {
		this.registeredAI.add(name, constr);
	}

	/**
	 * Generates an AI instance from its name
	 * @param name The name of the AI to add
	 * @returns A new AI instance
	 */
	generateAI(name: string): AI {
		if(this.registeredAI.has(name)){
			return new (this.registeredAI.get(name))();
		} else {
			throw `Cannot create AI with name ${name}, no AI with that name is registered`;
		}
	}

	update(deltaT: number): void {
		// Run the ai for every active actor
		this.actors.forEach(actor => { if(actor.aiActive) actor.ai.update(deltaT) });
	}
}

type AIConstructor = new <T extends AI>() => T;
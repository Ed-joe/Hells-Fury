import Vec2 from "../../DataTypes/Vec2";
import Graphic from "../Graphic";

export default class Line extends Graphic {
    protected _end: Vec2;
    thickness: number;

    constructor(start: Vec2, end: Vec2){
        super();
        this.start = start;
        this.end = end;
        this.thickness = 2;

        // Does this really have a meaning for lines?
        this.size.set(5, 5);
    }

    set start(pos: Vec2){
        this.position = pos;
    }

    get start(): Vec2 {
        return this.position;
    }

    set end(pos: Vec2){
        this._end = pos;
    }

    get end(): Vec2 {
        return this._end;
    }
}
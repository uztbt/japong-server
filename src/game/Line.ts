import { Drawable } from "./Drawable";
import { PlayerID } from "./Game";

export class Line extends Drawable {}

export class EndLine extends Line {
    ownedBy: PlayerID;
    constructor (x: number, y: number, w: number, h: number, ownedBy: PlayerID) {
        super(x, y, w, h);
        this.ownedBy = ownedBy;
    }
}
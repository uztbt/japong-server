import { CommandDictionary } from "../CommandDictionary";
import { Drawable } from "./Drawable";
import { Movable } from "./Movable";
import { Command } from "./UserInput";

export type Input = () => CommandDictionary;

export class Paddle extends Movable {
  private speed: number;
  private constraints: Drawable[];
  private input: Input;

  constructor(x: number, y: number, w: number, h: number, speed: number, constraints: Drawable[], input: Input) {
    super(x, y, w, h);
    this.speed = speed;
    this.constraints = constraints;
    this.input = input;
  }

  preferredVelocity(): [number, number] {
    const commandDict = this.input();
    let vx = 0;
    if (commandDict[Command.LEFT]) {
      vx = -this.speed;
    } else if (commandDict[Command.RIGHT]) {
      vx = this.speed;
    }
    return [vx, 0];
  }

  update(): void {
    const [vx, vy] = this.preferredVelocity();
    this.updateVelocityWithReconciliation(vx, vy, this.constraints);
    this.updatePosition();
  }
}

// export function followBall (paddle: Paddle): Set<Command.UP|Command.DOWN|Command.LEFT|Command.RIGHT>{
//   const commands = new Set<Command.UP|Command.DOWN|Command.LEFT|Command.RIGHT>();
//   const ball = Game.ball;
//   if (ball === null || ball.vy > 0) {
//     return commands;
//   }
//   if (ball.x + ball.width < paddle.x) {
//     commands.add(Command.LEFT);
//   } else if (ball.x > paddle.x + paddle.width) {
//     commands.add(Command.RIGHT);
//   }
//   return commands;
// }

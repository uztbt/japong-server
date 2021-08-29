export type PlayerID = number;

import { Input, Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { config } from "./config";
import { EndLine, Line } from "./Line";


export class Game {
  private loopTimestamp: number;
  private scores: number[];
  private paddles: Paddle[];
  private ballLaunchTimer: number;
  private ball: Ball | null;
  private sideLines: Line[];
  private endLines: EndLine[];

  constructor(input1: Input, input2: Input) {
    this.loopTimestamp = 0;
    this.scores = [0, 0];
    this.ballLaunchTimer = 0;
    this.ball = null;

    const sidelineWidth = config.canvas.height - 2 * config.court.offset;
    const endlineWidth = config.canvas.width - 2 * config.court.offset;
    this.sideLines = [
      new Line(
        config.court.offset,
        config.court.offset,
        config.line.height,
        sidelineWidth,
        ),
      new Line(
        config.court.offset + endlineWidth - config.line.height,
        config.court.offset,
        config.line.height,
        sidelineWidth
        )
    ];
    this.endLines = [
      new EndLine(
        config.court.offset,
        config.court.offset,
        endlineWidth,
        config.line.height,
        0),
      new EndLine(
        config.court.offset,
        config.court.offset + sidelineWidth - config.line.height,
        endlineWidth,
        config.line.height,
        1),
    ];

    this.paddles = [
      new Paddle(
        config.canvas.width / 2 - config.paddle.width / 2,
        config.court.offset+sidelineWidth
          -(config.line.height+config.paddle.offset+config.paddle.height),
        config.paddle.width, config.paddle.height,
        config.player.speed,
        this.sideLines,
        input1
      ),
      new Paddle(
        config.canvas.width / 2 - config.paddle.width / 2,
        config.court.offset + config.line.height + config.paddle.offset,
        config.paddle.width, config.paddle.height,
        config.computer.speed,
        this.sideLines,
        input2
      )
    ];
    this.scheduleBallLaunch(60);
  }

  update(): boolean {
    if (this.scores.some(score => score >= config.gamePoint)) {
      return true;
    }
    this.paddles.forEach(paddle => paddle.update());
    if (this.ball === null) {
      this.ballLaunchTimer -= 1;
      if (this.ballLaunchTimer <= 0) {
        this.ball = new Ball(
          config.canvas.width / 2 - config.ball.size / 2,
          config.canvas.height / 2 - config.ball.size / 2,
          config.ball.size, config.ball.size,
          config.ball.speed, config.ball.deltaAngle, config.ball.acceleration,
          this.paddles, this.sideLines, this.endLines
        );
      }
    } else {
      this.ball.update();
    }
    return false;
  }

  loop(timestamp: number): void {
    if (timestamp - this.loopTimestamp <= config.secondsPerFrame) {
      requestAnimationFrame(this.loop);
      return;
    }
    const moveToEnding = this.update();
    if (moveToEnding) {
      // Ending.init(Game.playerScore, Game.computerScore);
      // requestAnimationFrame(Ending.loop);
    } else {
      // Game.draw();
      // requestAnimationFrame(Game.loop);
    }
  }

  public onScored(playerId: PlayerID): void {
    this.scores[playerId]++;
    this.scheduleBallLaunch(60);
  }

  private scheduleBallLaunch(frames: number) {
    this.ball = null;
    this.ballLaunchTimer = frames;
  }
}

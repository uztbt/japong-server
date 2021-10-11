export type PlayerID = number;

import { Input, Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { config } from "./config";
import { EndLine, Line } from "./Line";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export interface Transmitter {
  send(eventName: string, any: any): void;
}

export class Game {
  private loopTimestamp: number;
  private scores: number[];
  private paddles: Paddle[];
  private ballLaunchTimer: number;
  private ball: Ball | null;
  private server: PlayerID;
  private sideLines: Line[];
  private endLines: EndLine[];
  private intervalId: number;
  private io: Server<DefaultEventsMap, DefaultEventsMap>;
  private roomName: string;
  private onGameOver: () => void;

  constructor(input0: Input, input1: Input, io: Server<DefaultEventsMap, DefaultEventsMap>, roomName: string, onGameOver: ()=>void) {
    this.io = io;
    this.roomName = roomName;
    this.loopTimestamp = 0;
    this.scores = [0, 0];
    this.ballLaunchTimer = 0;
    this.ball = null;
    this.server = 0;
    this.onGameOver = onGameOver;

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
        input0
      ),
      new Paddle(
        config.canvas.width / 2 - config.paddle.width / 2,
        config.court.offset + config.line.height + config.paddle.offset,
        config.paddle.width, config.paddle.height,
        config.computer.speed,
        this.sideLines,
        input1
      )
    ];
    this.scheduleBallLaunch(60);
    this.intervalId = setInterval(this.loop.bind(this), config.secondsPerFrame);
  }

  update(): boolean {
    if (this.scores.some(score => score >= config.gamePoint)) {
      return true;
    }
    this.paddles.forEach(paddle => paddle.update());
    if (this.ball === null) {
      this.ballLaunchTimer -= 1;
      if (this.ballLaunchTimer <= 0) {
        this.ball = this.launchBall();
      }
    } else {
      this.ball.update();
    }
    return false;
  }

  loop(timestamp: number): void {
    if (timestamp - this.loopTimestamp <= config.secondsPerFrame) {
      return;
    }
    const moveToEnding = this.update();
    if (moveToEnding) {
      this.terminate();
      this.io.to(this.roomName).emit("game over", {scores: this.scores});
      this.onGameOver();
    } else {
      this.sendBoard();
    }
  }

  public onScored(playerId: PlayerID): void {
    this.scores[playerId]++;
    this.server = 1 - this.server;
    this.scheduleBallLaunch(60);
  }

  private scheduleBallLaunch(frames: number) {
    this.ball = null;
    this.ballLaunchTimer = frames;
  }

  private launchBall(): Ball {
    const serverPaddle = this.paddles[this.server];
    const x = serverPaddle.x + serverPaddle.width / 2 - config.ball.size / 2
    const y = this.server === 0 ?
      serverPaddle.y - config.ball.size :
      serverPaddle.y + serverPaddle.height;
      
    return new Ball(x, y,
      config.ball.size, config.ball.size,
      config.ball.speed, config.ball.deltaAngle, config.ball.acceleration,
      this.paddles, this.sideLines, this.endLines, this.server, this.onScored.bind(this)
    );
  }

  private getDrawables() {
    const base = [
      ...this.sideLines.map(sl => sl.serialize()),
      ...this.endLines.map(el => el.serialize()),
      ...this.paddles.map(pd => pd.serialize()),
    ];
    const ball = this.ball?.serialize();
    if (typeof ball === "undefined") {
      return base;
    } else {
      return base.concat(ball);
    }
  }
  
  private sendBoard() {
    this.io.to(this.roomName).emit("board", {
      drawables: this.getDrawables(),
      scores: this.scores
    })
  }

  terminate() {
    clearInterval(this.intervalId);
  }

  getScores(): number[] {
    return this.scores;
  }
}

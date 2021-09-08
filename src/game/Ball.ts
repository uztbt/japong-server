import { config } from "./config";
import { Drawable } from "./Drawable";
import { PlayerID } from "./Game";
import { EndLine, Line } from "./Line";
import { Movable } from "./Movable";
import { Paddle } from "./Paddle";
import { scale } from "./utils";

export class Ball extends Movable {
  private speed: number;
  private angle: number;
  private acceleration: number;
  private lastHitBy: PlayerID | null;
  private boundDownwardScale: (x: number) => number;
  private boundUpwardScale: (x: number) => number;
  private paddles: Paddle[];
  private sideLines: Line[];
  private endLines: EndLine[];
  private onScored: (playerId: PlayerID) => void;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    speed: number,
    deltaAngle: number,
    acceleration: number,
    paddles: Paddle[],
    sideLines: Line[],
    endLines: EndLine[],
    server: PlayerID,
    onScored: (playerId: PlayerID) => void
  ) {
    super(x, y, w, h);
    this.speed = speed;
    this.angle = this.randomAngle(server);
    this.lastHitBy = null;
    this.updateVelocity();
    this.boundDownwardScale = scale(
      [-config.paddle.width / 2 - w / 2, config.paddle.width / 2 + w / 2],
      [Math.PI-deltaAngle, deltaAngle]
    );
    this.boundUpwardScale = scale(
      [-config.paddle.width / 2 - w / 2, config.paddle.width / 2 + w / 2],
      [Math.PI+deltaAngle, 2*Math.PI-deltaAngle]
    );
    this.acceleration = acceleration;
    this.paddles = paddles;
    this.sideLines = sideLines;
    this.endLines = endLines;
    this.onScored = onScored;
  }

  private updateVelocity() {
    const uvx = Math.cos(this.angle);
    const uvy = Math.sin(this.angle);
    this.vx = this.speed * uvx;
    this.vy = this.speed * uvy;
  }

  private randomAngle(server: number): number {
    let offset: number;
    if (server === 0) {
      offset = Math.PI / 2;
    } else {
      offset = Math.PI / 2 * 3;
    }
    const salt = 0.01 * Math.random() - 0.005;
    return offset - salt;
  }

  private flipHorizontally() {
    this.angle = Math.PI - this.angle;
    this.updateVelocity();
  }

  private boundByCollision(paddle: Drawable) {
    const paddleMiddleX = paddle.x + paddle.width / 2;
    const ballMiddleX = this.x + this.width / 2;
    const dx = ballMiddleX - paddleMiddleX;
    const isIncidentDirectionUp = this.vy < 0;
    if (isIncidentDirectionUp) {
      this.angle = this.boundDownwardScale(dx);
    } else {
      this.angle = this.boundUpwardScale(dx);
    }
    this.updateVelocity();
    this.speed *= this.acceleration;
  }

  collisionWithPaddle(paddle: Paddle, player: PlayerID): void {
    if (this.isCollidingWith(paddle) && this.lastHitBy !== player) {
      this.lastHitBy = player;
      this.boundByCollision(paddle);
    }
  }

  private collisionWithSideLines(sideLines: Line[]) {
    // see. https://yuji.page/axis-aligned-bounding-boxes/
    sideLines.forEach(sideLine => {
      if (this.isCollidingWith(sideLine)) {
        const isGoingLeft = this.vx < 0;
        if (isGoingLeft) {
          this.x = sideLine.x + sideLine.width;
        } else {
          this.x = sideLine.x - this.width;
        }
        this.flipHorizontally();
      }
    })
  }

  private collisionWithEndLines(endLines: EndLine[]) {
    endLines.forEach(endLine => {
      if (this.isCollidingWith(endLine)) {
        this.onScored(endLine.ownedBy);
      }
    })
  }

  update(): void {
    this.collisionWithSideLines(this.sideLines);
    this.collisionWithEndLines(this.endLines);
    for (let i = 0; i < 2; i++) {
      this.collisionWithPaddle(this.paddles[i], i);
    }
    this.updatePosition();
  }
}

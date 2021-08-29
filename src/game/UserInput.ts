export enum Command {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  ENTER = "ENTER",
  MOVE = "MOVE"
}

type CommandDictionary = {
  [Command.UP]: boolean,
  [Command.DOWN]: boolean,
  [Command.LEFT]: boolean,
  [Command.RIGHT]: boolean,
  [Command.ENTER]: boolean,
  [Command.MOVE]: boolean
};
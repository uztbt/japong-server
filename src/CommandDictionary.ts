enum Command {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  ENTER = "ENTER",
  MOVE = "MOVE"
}

export type CommandDictionary = {
  [Command.UP]: boolean,
  [Command.DOWN]: boolean,
  [Command.LEFT]: boolean,
  [Command.RIGHT]: boolean,
  [Command.ENTER]: boolean,
  [Command.MOVE]: boolean
};

export function commandDictToString(dict: CommandDictionary) {
  return `UP ${dict[Command.UP]}, DOWN ${dict[Command.DOWN]}, LEFT ${dict[Command.LEFT]}, RIGHT ${dict[Command.RIGHT]}, ENTER ${dict[Command.ENTER]}, MOVE ${dict[Command.MOVE]}`;
}
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CommandDictionary, createDefeultCommandDictionary } from "./CommandDictionary";
import { Game } from "./game/Game";

export type IO = Server<DefaultEventsMap, DefaultEventsMap>;

export type GameRoom = {
  game: Game | null,
  sockets: Socket[],
  commandDicts: CommandDictionary[],
  timeoutIds: NodeJS.Timeout[]
};

/**
 * From AsyncAPI documentation
 */
export type JoinRoom = {
  roomNo: number;
  playerId: number;
  playerName: string;
}

export interface RoomManager {
  start(): void;
  onConnection(socket: Socket): void;
  onJoinRoom(info: JoinRoom): void;
  onCommandDict(roomNo: number, playerId: number, commandDict: CommandDictionary): void;
}

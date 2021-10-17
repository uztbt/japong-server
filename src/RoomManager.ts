import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CommandDictionary, createDefeultCommandDictionary } from "./CommandDictionary";
import { Game } from "./game/Game";

export type IO = Server<DefaultEventsMap, DefaultEventsMap>;

export type GameRoom = {
  game: Game | null,
  sockets: Socket[],
  playerNames: string[],
  commandDicts: CommandDictionary[],
  timeoutIds: NodeJS.Timeout[]
};

/**
 * From AsyncAPI documentation
 */
export type JoinRoom = {
  roomNo: number;
  playerName: string;
}

export interface RoomManager {
  onConnection(socket: Socket): void;
  onJoinRoom(socket: Socket, info: JoinRoom): void;
  onCommandDict(roomNo: number, playerId: number, commandDict: CommandDictionary): void;
}

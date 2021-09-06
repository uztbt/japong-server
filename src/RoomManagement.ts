import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CommandDictionary, createDefeultCommandDictionary } from "./CommandDictionary";
import { Game } from "./game/Game";

type IO = Server<DefaultEventsMap, DefaultEventsMap>;

type GameRoom = {
  game: Game | null,
  sockets: Socket[],
  commandDicts: CommandDictionary[]
};

interface RoomManager {
  start(anything: any): void;
}

export class NaiveRoomManager implements RoomManager {
  private maxRooms: number;
  private rooms: (GameRoom | undefined)[];
  constructor(maxRooms: number) {
    this.maxRooms = maxRooms;
    this.rooms = Array(maxRooms);
  }

  start(io: IO): void {
    io.on('connection', this.onConnection(io));
  }

  private onConnection = (io: IO) => (socket: Socket) => {
    console.log(`accepted a connection from socket.id = ${socket.id}`);
    const operatingRooms = io.of('/').adapter.rooms;
    const roomNo = this.assignRoom(operatingRooms);
    if (roomNo === -1) {
      socket.emit("unavailable", "All rooms are full");
      socket.disconnect();
      return;
    }
    const roomName = `${roomNo}`;
    socket.join(roomName);
    const room = operatingRooms.get(roomName)!;
    console.log(`${socket.id} joined room ${roomName}`);
    socket.emit("joined room", `${roomName}`, room.size);
    const playerId = room.size-1;
    switch (room.size) {
      case 1:
          socket.emit("wait for opponent");
          this.rooms[roomNo] = {
              game: null,
              sockets: [socket],
              commandDicts: [createDefeultCommandDictionary(), createDefeultCommandDictionary()]
          };
          break;
      case 2:
          this.rooms[roomNo]!.sockets.push(socket);
          setTimeout(() => io.to(roomName).emit("countDown", 3), 0);
          setTimeout(() => io.to(roomName).emit("countDown", 2), 1000);
          setTimeout(() => io.to(roomName).emit("countDown", 1), 2000);
          setTimeout(() => {
              this.rooms[roomNo]!.game = new Game(
                  () => this.rooms[roomNo]!.commandDicts[0],
                  () => this.rooms[roomNo]!.commandDicts[1], io, roomName,
                  this.onGameOver(roomNo));
          }, 3000);
          break;
    }
    socket.on("commandDict", (commandDict: CommandDictionary) => {
      this.rooms[roomNo]!.commandDicts[playerId] = commandDict;
    });
    socket.on('disconnect', this.onDisconnect(roomNo, socket.id));
  }

  private onDisconnect = (roomNo: number, socketId: string) => () => {
    console.log(`disconnected user with id = ${socketId}`);
    this.rooms[roomNo]?.game?.terminate();
  }

  private onGameOver = (roomNo: number) => () =>
    this.rooms[roomNo]?.sockets.forEach(socket => socket.disconnect());

  private assignRoom(operatingRooms: Map<string, Set<string>>): number {
    const [vacantRooms, waitingRooms] = this.availableRoomNos(operatingRooms);
    if (waitingRooms.length > 0) {
      return waitingRooms[0];
    } else if (vacantRooms.length > 0) {
      return vacantRooms[0];
    } else {
      return -1;
    }
  }
  
  private availableRoomNos(operatingRooms: Map<string, Set<string>>): [number[], number[]] {
    const vacantRooms: number[] = [];
    const waitingRooms: number[] = [];

    for (let i = 0; i < this.maxRooms; i++) {
      const roomName = `${i}`;
      const sockets = operatingRooms.get(roomName);
      if (typeof sockets === "undefined")
        vacantRooms.push(i);
      else if (sockets!.size < 2)
        waitingRooms.push(i);
    }
    return [vacantRooms, waitingRooms];
  }
}
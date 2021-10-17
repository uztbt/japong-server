import { Socket } from "../node_modules/socket.io/dist";
import { createDefeultCommandDictionary, CommandDictionary } from "./CommandDictionary";
import { Game } from "./game/Game";
import { RoomManager, GameRoom, IO, JoinRoom } from "./RoomManager";

export class NaiveRoomManager implements RoomManager {
    private maxRooms: number;
    private rooms: (GameRoom | undefined)[];
    private io: IO;
    constructor(maxRooms: number, io: IO) {
      this.maxRooms = maxRooms;
      this.rooms = Array(maxRooms);
      this.io = io;
      this.io.on('connection', this.onConnection.bind(this));
    }
    
    onConnection(socket: Socket) {
      console.log(`accepted a connection from socket.id = ${socket.id}`);
      const operatingRooms = this.io.of('/').adapter.rooms;
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
                playerNames: ["Player0 Name"],
                commandDicts: [createDefeultCommandDictionary(), createDefeultCommandDictionary()],
                timeoutIds: []
            };
            break;
        case 2:
          const room = this.rooms[roomNo]!;
            room.sockets.push(socket);
            room.playerNames.push("Player1 Name");
            room.timeoutIds.push(setTimeout(() => this.io.to(roomName).emit("countDown", 3), 0));
            room.timeoutIds.push(setTimeout(() => this.io.to(roomName).emit("countDown", 2), 1000));
            room.timeoutIds.push(setTimeout(() => this.io.to(roomName).emit("countDown", 1), 2000));
            room.timeoutIds.push(setTimeout(() => {
              room.timeoutIds = [];
                this.rooms[roomNo]!.game = new Game(
                    () => this.rooms[roomNo]!.commandDicts[0],
                    () => this.rooms[roomNo]!.commandDicts[1], this.io, roomName,
                    this.onGameOver(roomNo));
            }, 3000));
            break;
      }
      socket.on("commandDict", (commandDict: CommandDictionary) => {
        this.onCommandDict(roomNo, playerId, commandDict);
      });
      socket.on('disconnect', () => this.onDisconnect(roomNo, socket.id));
    }

    onJoinRoom(socket: Socket, info: JoinRoom) {
        console.log(`Received joinRoom message from a client`);
    }

    onCommandDict(roomNo: number, playerId: number, commandDict: CommandDictionary) {
        this.rooms[roomNo]!.commandDicts[playerId] = commandDict;
    }
  
    onDisconnect(roomNo: number, socketId: string) {
      console.log(`disconnected user with id = ${socketId}`);
      const room = this.rooms[roomNo];
      if (room?.game !== null) {
        // Player disconnected in the middle of a game
        room?.game?.terminate();
        room?.timeoutIds.forEach(id => clearTimeout(id));
        const opponent = this.cleanUpSockets(roomNo, socketId);
        opponent?.emit("opponent left");
      }
    }
  
    private onGameOver = (roomNo: number) => () => {
      const room = this.rooms[roomNo]!;
      room.game = null;
      room.commandDicts = [];
      room.timeoutIds = [];
      room.sockets.forEach(socket => socket.disconnect())
    };
  
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
  
    private cleanUpSockets(roomNo: number, mySocketId: string) {
      const sockets = this.rooms[roomNo]?.sockets;
      if (typeof sockets === "undefined") {
        return;
      }
      if (sockets[0].id === mySocketId)
        sockets.shift();
      else
        sockets.pop();
      return sockets[0];
    }
  }
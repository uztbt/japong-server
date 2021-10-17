import { Socket } from "../node_modules/socket.io/dist";
import { CommandDictionary, createDefeultCommandDictionary } from "./CommandDictionary";
import { Game } from "./game/Game";
import { GameRoom, IO, JoinRoom, RoomManager } from "./RoomManager";

export class StandardRoomManager implements RoomManager {
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
        console.log(`Connection requested by socket.id = ${socket.id}`);
        if (this.connectionOverCapacity()) {
            socket.disconnect();
        }
        socket.on('joinRoom', (info: JoinRoom) => {
            this.onJoinRoom.bind(this)(socket, info);
        });
    }

    onJoinRoom(socket: Socket, info: JoinRoom): void {
        const {roomNo, playerName} = info;
        const roomName = `${roomNo};`
        if (this.roomAvailable(roomNo)) {
            socket.join(roomName);
            const playerId = this.roomSize(roomNo) - 1;
            const joinedRoom = {
                roomNo, playerId, playerName
            };
            socket.emit("joinedRoom", joinedRoom);
            console.log(`${playerName} joined room ${roomName} as player ${playerId}`);
            switch(playerId) {
                case 0:
                    this.rooms[roomNo] = {
                        game: null,
                        sockets: [socket],
                        playerNames: [playerName],
                        commandDicts: [
                            createDefeultCommandDictionary(),
                            createDefeultCommandDictionary()
                        ],
                        timeoutIds: []
                    }
                    break;
                case 1:
                    const room = this.rooms[roomNo]!;
                    room.sockets.push(socket);
                    room.playerNames.push(playerName);
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
            socket.on('disconnect', () => this.onDisconnect(roomNo, socket.id));
        } else {
            console.log(`${socket.id} disconnected because ${roomName} is full.`);
            socket.disconnect();
        }
    }

    onDisconnect(roomNo: number, socketId: string) {
        console.log(`disconnected user with id = ${socketId}`);
        const room = this.rooms[roomNo];
        if (room?.game !== null) {
          // Player disconnected in the middle of a game
          room?.game?.terminate();
          room?.timeoutIds.forEach(id => clearTimeout(id));
          const opponent = this.cleanUpSockets(roomNo, socketId);
          opponent?.emit("opponentLeft");
        }
      }

    private onGameOver = (roomNo: number) => () => {
        const room = this.rooms[roomNo]!;
        room.game = null;
        room.commandDicts = [];
        room.timeoutIds = [];
        room.sockets.forEach(socket => socket.disconnect())
      };

    private roomSize(roomNo: number): number {
        if (roomNo < 0 || roomNo >= this.maxRooms) {
            console.error(`roomNo out of bound for roomSize: ${roomNo}`);
            return -1;
        } 
        const operatingRooms = this.io.of('/').adapter.rooms;
        const roomName = `${roomNo}`;
        const room = operatingRooms.get(roomName)!;
        return room.size;
    }

    private connectionOverCapacity(): boolean {
        const [vacant, waiting] = this.availableRoomNos();
        return vacant.length === 0 && waiting.length ===0;
    }

    private roomAvailable(roomNo: number): boolean {
        const [vacant, waiting] = this.availableRoomNos();
        return [...vacant, ...waiting].indexOf(roomNo) !== -1;
    }

    private availableRoomNos(): [number[], number[]] {
        const operatingRooms = this.io.of('/').adapter.rooms;
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

    onCommandDict(roomNo: number, playerId: number, commandDict: CommandDictionary): void {
        throw new Error("Method not implemented.");
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
import {expr} from './expr';
import { createServer } from 'http';
import { executionModes, getConfig } from './config';
import { Socket, Server } from 'socket.io';
import { CommandDictionary, createDefeultCommandDictionary } from './CommandDictionary';
import { findAvailableRoom } from './room';
import { Game } from './game/Game';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as process from 'process';

async function main() {
    const argv = await yargs(hideBin(process.argv))
    .option('mode', {
        choices: executionModes,
        demandOption: true
    }).argv;

    console.log(`Execution mode: ${argv.mode}`);
    const config = getConfig(argv.mode);

    const httpServer = createServer(expr);
    const io = new Server(httpServer, config.socketIOOpts);

    type GameRoom = {
        game: Game | null,
        sockets: Socket[],
        commandDicts: CommandDictionary[]
    };

    const gameRooms: GameRoom[] = [];

    function onGameOver(gameRooms: GameRoom[], roomNo: number) {
        return () => gameRooms[roomNo].sockets.forEach(socket => socket.disconnect());
    }

    io.on("connection", (socket: Socket) => {
        console.log(`accepted a connection from socket.id = ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`disconnected user with id=${socket.id}.`);
            gameRooms[roomNo].game?.terminate();
        })
        const rooms = io.of("/").adapter.rooms;
        const roomNo = findAvailableRoom(rooms, config.maxRooms);
        if (roomNo === -1) {
            socket.emit("unavailable", "All rooms are full");
            socket.disconnect();
            return;
        }
        const roomName = `${roomNo}`;
        socket.join(roomName);
        const room = rooms.get(roomName)!;
        console.log(`joined room ${roomName}`);
        socket.emit("joined room", `${roomName}`, room.size);
        const playerId = room.size-1;
        
        switch (room.size) {
            case 1:
                socket.emit("wait for opponent");
                gameRooms[roomNo] = {
                    game: null,
                    sockets: [socket],
                    commandDicts: [createDefeultCommandDictionary(), createDefeultCommandDictionary()]
                };
                break;
            case 2:
                gameRooms[roomNo].sockets.push(socket);
                setTimeout(() => io.to(roomName).emit("countDown", 3), 0);
                setTimeout(() => io.to(roomName).emit("countDown", 2), 1000);
                setTimeout(() => io.to(roomName).emit("countDown", 1), 2000);
                setTimeout(() => {
                    gameRooms[roomNo].game = new Game(
                        () => gameRooms[roomNo].commandDicts[0],
                        () => gameRooms[roomNo].commandDicts[1], io, roomName,
                        onGameOver(gameRooms, roomNo));
                }, 3000);
                break;
        }
        socket.on("commandDict", (commandDict: CommandDictionary) => {
            console.log(`get commandDict from ${playerId}: ${commandDict}`);
            gameRooms[roomNo].commandDicts[playerId] = commandDict;
        });
    });

    httpServer.listen(config.port, () => {
        console.log(`Listening on *:${config.port}`);
    });
}

main();
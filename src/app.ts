import {expr} from './expr';
import { createServer } from 'http';
import { config } from './config';
import { Socket, Server } from 'socket.io';
import { CommandDictionary, commandDictToString } from './CommandDictionary';
import { findAvailableRoom } from './room';
const port = 3000;

const httpServer = createServer(expr);
const io = new Server(httpServer, config.socketIOOpts);

io.on("connection", (socket: Socket) => {
    console.log(`accepted a connection from socket.id = ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`disconnected user with id=${socket.id}.`);
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
    
    switch (room.size) {
        case 1:
            socket.emit("wait for opponent");
            break;
        case 2:
            setTimeout(() => io.to(roomName).emit("countDown", 3), 0);
            setTimeout(() => io.to(roomName).emit("countDown", 2), 1000);
            setTimeout(() => io.to(roomName).emit("countDown", 1), 2000);
            setTimeout(() => io.to(roomName).emit("countDown", 0), 3000);
            break;
    }
    socket.on("commandDict", (commandDict: CommandDictionary) => {
        console.log(commandDictToString(commandDict));
    });
    // socket.emit("board", [{x: 50, y: 100, w: 50, h: 100}]);
});

httpServer.listen(port, () => {
    console.log(`Listening on *:${port}`);
});
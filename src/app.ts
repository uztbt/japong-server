import {expr} from './expr';
import { createServer } from 'http';
import { options } from './socketioOptions';
import { Socket, Server } from 'socket.io';
const port = 3000;

const httpServer = createServer(expr);
const io = new Server(httpServer);

io.on("connection", (socket: Socket) => {
    console.log(`accepted a connection from socket.id = ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`disconnected user with id=${socket.id}.`);
    })
});

httpServer.listen(port, () => {
    console.log(`Listening on *:${port}`);
});
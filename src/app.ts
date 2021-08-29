import {expr} from './expr';
import { createServer } from 'http';
import { config } from './config';
import { Socket, Server } from 'socket.io';
import { CommandDictionary, commandDictToString } from './CommandDictionary';
const port = 3000;

const httpServer = createServer(expr);
const io = new Server(httpServer, config.socketIOOpts);

io.on("connection", (socket: Socket) => {
    console.log(`accepted a connection from socket.id = ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`disconnected user with id=${socket.id}.`);
    })
    socket.on("commandDict", (commandDict: CommandDictionary) => {
        console.log(commandDictToString(commandDict));
    })
});

httpServer.listen(port, () => {
    console.log(`Listening on *:${port}`);
});
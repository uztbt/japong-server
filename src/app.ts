import express from 'express';
import { createServer } from 'http';
import { executionModes, getConfig } from './config';
import { Server } from 'socket.io';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as process from 'process';
import { NaiveRoomManager } from './NaiveRoomManager';

async function main() {
    const argv = await yargs(hideBin(process.argv))
    .option('mode', {
        choices: executionModes,
        demandOption: true
    }).argv;

    console.log(`Execution mode: ${argv.mode}`);
    const config = getConfig(argv.mode);

    const expressServer = express();
    const httpServer = createServer(expressServer);
    const io = new Server(httpServer, config.socketIOOpts);

    const roomManager = new NaiveRoomManager(config.maxRooms, io);

    httpServer.listen(config.port, () => {
        console.log(`Listening on *:${config.port}`);
    });
}

main();
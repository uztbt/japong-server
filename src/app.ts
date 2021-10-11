import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { executionModes, getConfig } from './config';
import { Server } from 'socket.io';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as process from 'process';
import { NaiveRoomManager, RoomManager } from './RoomManagement';

async function main() {
    const argv = await yargs(hideBin(process.argv))
    .option('mode', {
        choices: executionModes,
        demandOption: true
    }).argv;

    console.log(`Execution mode: ${argv.mode}`);
    const config = getConfig(argv.mode);

    const roomManager = new NaiveRoomManager(config.maxRooms);
    const expressServer = express();
    expressServer.route('/games')
        .get(getGameOverviews(roomManager))
    const httpServer = createServer(expressServer);
    const io = new Server(httpServer, config.socketIOOpts);

    roomManager.start(io);

    httpServer.listen(config.port, () => {
        console.log(`Listening on *:${config.port}`);
    });
}

main();

function getGameOverviews(roomManager: RoomManager) {
    return function(request: Request, response: Response, next: NextFunction) {
        const overview = roomManager.overview();
        response.status(200).json(overview);
    }
}
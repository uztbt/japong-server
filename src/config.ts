import http from 'http';

type ExecutionMode = 'debug' | 'release';

export const executionModes: ReadonlyArray<ExecutionMode> = ['debug', 'release'];

export function getConfig(mode: ExecutionMode) {
  const common = {
    players: 2,
    maxRooms: 10,
    allowReloadInterval: 2000
  };
  const debug = {
    port: 8081,
    socketIOOpts: {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET"],
      },
      allowRequest: preventQuickReload
    }
  };
  const release = {
    port: 8080,
    socketIOOpts: {
      cors: {
        origin: "https://yuji.page",
        methods: ["GET"]
      },
      allowRequest: preventQuickReload
    }
  };

  switch (mode) {
    case "debug":
      return Object.assign({}, common, debug);
    case "release":
      return Object.assign({}, common, release);
  }
};


const remoteAddressCache: Record<string, Date> = {};

function preventQuickReload(req: http.IncomingMessage, callback: (err: string | null | undefined, success: boolean) => void): void {
  console.log(`
    req.socket.remoteAddress = ${JSON.stringify(req.socket.remoteAddress)}
    req.socket.remoteFamily = ${req.socket.remoteFamily}
    `);
  const remoteAddress = req.socket.remoteAddress;
  if (typeof remoteAddress === "undefined") {
    return callback(null, true);
  }
  const lastAccess = remoteAddressCache[remoteAddress];
  const now = new Date();
  if (typeof lastAccess === "undefined") {
    remoteAddressCache[remoteAddress] = now;
    return callback(null, true);
  }
  if (now.valueOf() - lastAccess.valueOf() > getConfig("debug").allowReloadInterval){
    remoteAddressCache[remoteAddress] = now;
    return callback(null, true);
  } else {
    console.log(`Rejecting connection due to a quick reload. now = ${now}, lastAccess = ${lastAccess}`);
    return callback(null, false);
  } 
}
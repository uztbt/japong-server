type ExecutionMode = 'debug' | 'release';
export const executionModes: ReadonlyArray<ExecutionMode> = ['debug', 'release'];

export function getConfig(mode: ExecutionMode) {
  const common = {
    players: 2,
    maxRooms: 5
  };
  const debug = {
    port: 8081,
    socketIOOpts: {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
      }
    }
  };
  const release = {
    port: 8080,
    socketIOOpts: {
      cors: {
        origin: "https://yuji.page",
        methods: ["GET", "POST"]
      }
    }
  };

  switch (mode) {
    case "debug":
      return Object.assign({}, common, debug);
    case "release":
      return Object.assign({}, common, release);
  }
};
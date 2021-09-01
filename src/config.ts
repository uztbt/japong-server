export const config = {
  socketIOOpts: {
    cors: {
      origin: "https://yuji.page",
      // origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  },
  port: 8081,
  players: 2,
  maxRooms: 5
};
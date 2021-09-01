export const config = {
  socketIOOpts: {
    cors: {
      origin: "https://yuji.page",
      methods: ["GET", "POST"]
    }
  },
  port: 8080,
  players: 2,
  maxRooms: 5
};
export const config = {
  socketIOOpts: {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  },
  players: 2,
  maxRooms: 5
};
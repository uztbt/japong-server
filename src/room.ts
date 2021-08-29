export function findAvailableRoom(rooms: Map<string, Set<string>>, maxRoomNum: number): number {
  for (let i = 0; i < maxRoomNum; i++) {
    const sockets = rooms.get(`${i}`);
    if (typeof sockets === "undefined" || sockets!.size < 2)
      return i;
  }
  return -1; // not found
}
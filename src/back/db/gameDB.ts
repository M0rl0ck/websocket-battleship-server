import type { Room, Winner } from "../types";

class GameDB {
  private rooms: Map<string, Room>;
  private winners: Map<string, Winner> = new Map();
  constructor() {
    this.rooms = new Map();
  }

  getRooms() {
    const rooms: Room[] = [];
    for (const room of this.rooms.values()) {
      if (room.roomUsers.length === 1) {
        rooms.push(room);
      }
    }
    return rooms;
  }

  getWinners() {
    const winners: Winner[] = [];
    for (const winner of this.winners.values()) {
      winners.push(winner);
    }
    return winners;
  }
}

const gameDB = new GameDB();

export { gameDB };

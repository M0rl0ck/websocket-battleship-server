import { EventEmitter } from "node:events";
import type { Room, Winner } from "../types";

type EventNames = "update_room" | "update_winners";

class GameDB extends EventEmitter {
  private rooms: Map<string, Room>;
  private winners: Map<string, Winner> = new Map();

  event(event: EventNames) {
    return super.emit(event);
  }

  on(event: EventNames, listener: (name: string) => void) {
    return super.on(event, listener);
  }
  constructor() {
    super();
    this.rooms = new Map();
    this.winners = new Map();
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

  addWinner = (name: string) => {
    if (!this.winners.has(name)) {
      this.winners.set(name, { name, wins: 0 });
    }
  };
}

const gameDB = new GameDB();

export { gameDB, type GameDB };

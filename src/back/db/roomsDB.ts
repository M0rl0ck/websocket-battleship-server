import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { Room, Winner } from "../types";

type EventNames = "update_room" | "update_winners";

type Listener = ((name: string) => void) | (() => void);

class RoomsDB extends EventEmitter {
  private rooms: Map<string, Room>;
  private winners: Map<string, Winner> = new Map();

  emit(event: EventNames) {
    return super.emit(event);
  }

  on(event: EventNames, listener: Listener) {
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

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
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

  checkIsUserHaveRoom = (name: string) => {
    for (const room of this.rooms.values()) {
      if (room.roomUsers.find((user) => user.name === name)) {
        return true;
      }
    }
    return false;
  };

  createRoom(name: string) {
    if (this.checkIsUserHaveRoom(name)) {
      return;
    }
    const roomId = randomUUID();
    const roomUsers: Room["roomUsers"] = [{ name, index: 0 }];
    this.rooms.set(roomId, { roomId, roomUsers: roomUsers });
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
  }
}

const roomsDB = new RoomsDB();

export { roomsDB, type RoomsDB };

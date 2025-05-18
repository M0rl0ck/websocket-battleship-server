import type { WebSocket } from "ws";
import { gameDB, type GameDB } from "../db";
import { usersDB, type UsersDB } from "../db";
import type { IResponse, UpdateRoom, UpdateWinners } from "../types";
import { createRaw } from "../utils";

class Sender {
  private gameDB: GameDB;
  private usersDB: UsersDB;
  constructor(gameDB: GameDB, usersDB: UsersDB) {
    this.gameDB = gameDB;
    this.usersDB = usersDB;
  }

  updateRooms = (ws?: WebSocket) => {
    const rooms = this.gameDB.getRooms();
    const messageData: UpdateRoom = {
      type: "update_room",
      data: rooms,
      id: 0,
    };

    this.sendMessage(messageData, ws);
  };

  updateWinners = () => {
    const winners = this.gameDB.getWinners();
    const messageData: UpdateWinners = {
      type: "update_winners",
      data: winners,
      id: 0,
    };
    this.sendMessage(messageData);
  };

  private sendMessage = (message: IResponse, ws?: WebSocket) => {
    const messageRaw = createRaw(message);
    if (ws) {
      ws.send(messageRaw);
      return;
    }
    this.usersDB.getAuthorized().forEach((ws) => {
      ws.send(messageRaw);
    });
  };
}

const sender = new Sender(gameDB, usersDB);

export { sender, type Sender };

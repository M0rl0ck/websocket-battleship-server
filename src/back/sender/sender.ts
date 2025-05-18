import type { WebSocket } from "ws";
import { roomsDB, type RoomsDB } from "../db";
import { usersDB, type UsersDB } from "../db";
import type { IResponse, UpdateRoom, UpdateWinners } from "../types";
import { createRaw } from "../utils";

class Sender {
  private roomsDB: RoomsDB;
  private usersDB: UsersDB;
  constructor(roomsDB: RoomsDB, usersDB: UsersDB) {
    this.roomsDB = roomsDB;
    this.usersDB = usersDB;
  }

  updateRooms = (ws?: WebSocket) => {
    const rooms = this.roomsDB.getRooms();
    const messageData: UpdateRoom = {
      type: "update_room",
      data: rooms,
      id: 0,
    };

    this.sendMessage(messageData, ws);
  };

  updateWinners = () => {
    const winners = this.roomsDB.getWinners();
    const messageData: UpdateWinners = {
      type: "update_winners",
      data: winners,
      id: 0,
    };
    this.sendMessage(messageData);
  };

  createGame = (
    idGame: number | string,
    idPlayer: number | string,
    ws: WebSocket
  ) => {
    const messageData: IResponse = {
      type: "create_game",
      data: {
        idGame,
        idPlayer,
      },
      id: 0,
    };
    this.sendMessage(messageData, ws);
  };

  sendMessage = (message: IResponse, ws?: WebSocket) => {
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

const sender = new Sender(roomsDB, usersDB);

export { sender, type Sender };

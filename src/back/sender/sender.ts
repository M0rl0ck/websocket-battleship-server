import type { WebSocket } from "ws";
import { roomsDB, type RoomsDB } from "../db";
import { usersDB, type UsersDB } from "../db";
import type {
  AttackData,
  AttackStatus,
  IResponse,
  Ship,
  UpdateRoom,
  UpdateWinners,
} from "../types";
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

  startGame = (playerId: string, ships: Ship[], ws: WebSocket) => {
    const messageData: IResponse = {
      type: "start_game",
      data: {
        ships,
        currentPlayerIndex: playerId,
      },
      id: 0,
    };
    this.sendMessage(messageData, ws);
  };

  turn = (playerId: string, ws: WebSocket) => {
    const messageData: IResponse = {
      type: "turn",
      data: {
        currentPlayer: playerId,
      },
      id: 0,
    };
    this.sendMessage(messageData, ws);
  };

  attack = (messageData: AttackData, status: AttackStatus, ws: WebSocket) => {
    const { x, y, indexPlayer } = messageData;
    const message: IResponse = {
      type: "attack",
      data: {
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status,
      },
      id: 0,
    };
    this.sendMessage(message, ws);
  };

  sendWin = (winPlayer: string, ws: WebSocket) => {
    const messageData: IResponse = {
      type: "finish",
      data: {
        winPlayer,
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

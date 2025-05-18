import { EventEmitter } from "node:events";
import type { UsersDB, RoomsDB } from "../db";
import { usersDB, roomsDB } from "../db";
import { game, type Game } from "../game";
import { sender, type Sender } from "../sender";
import type { LoginRequest, LoginResponse } from "../types";
import type { WebSocket } from "ws";

class Controller extends EventEmitter {
  private userDB: UsersDB;
  private roomsDB: RoomsDB;
  private sender: Sender;
  private game: Game;
  constructor(usersDB: UsersDB, roomsDB: RoomsDB, sender: Sender, game: Game) {
    super();
    this.userDB = usersDB;
    this.roomsDB = roomsDB;
    this.sender = sender;
    this.game = game;
    this.userDB.on("add_user", this.roomsDB.addWinner);
  }

  authorizeUser = (messageData: LoginRequest, ws: WebSocket) => {
    const result = this.userDB.authorizeUser(messageData.data, ws);
    const newMessageData: LoginResponse = {
      type: "reg",
      data: {
        name: messageData.data.name,
        index: messageData.data.name,
        error: false,
        errorText: "",
      },
      id: 0,
    };
    if (!result) {
      newMessageData.data.error = true;
      newMessageData.data.errorText = "Wrong name or password";
    }

    this.sender.sendMessage(newMessageData, ws);
    if (result) {
      this.sender.updateWinners();
      this.sender.updateRooms(ws);
    }
  };

  checkIsAuthorized = (ws: WebSocket) => {
    return this.userDB.isAuthorized(ws);
  };

  createRoom = (ws: WebSocket) => {
    const name = this.userDB.getName(ws);
    if (!name) {
      return;
    }
    this.roomsDB.createRoom(name);
    this.sender.updateRooms();
  };

  addUserToRoom = (roomId: string, ws: WebSocket) => {
    const name = this.userDB.getName(ws);
    if (!name) {
      return;
    }
    const room = this.roomsDB.getRoom(roomId);
    if (room && room.roomUsers[0].name !== name) {
      const player1 = room.roomUsers[0].name;
      this.roomsDB.deleteRoom(roomId);
      this.sender.updateRooms();
      this.createGame(player1, name);
    }
  };

  private createGame = (player1: string, player2: string) => {
    const idGame = this.game.createGame(player1, player2);
    const sessionPlayer1 = this.userDB.getSessionByName(player1);
    const sessionPlayer2 = this.userDB.getSessionByName(player2);
    if (!sessionPlayer1 || !sessionPlayer2) {
      return;
    }
    this.sender.createGame(idGame, player1, sessionPlayer1);
    this.sender.createGame(idGame, player2, sessionPlayer2);
  };
}

const controller = new Controller(usersDB, roomsDB, sender, game);

export { controller };

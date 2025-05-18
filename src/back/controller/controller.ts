import { EventEmitter } from "node:events";
import type { UsersDB, GameDB } from "../db";
import { usersDB, gameDB } from "../db";
import { sender, type Sender } from "../sender";
import type { LoginRequest, LoginResponse } from "../types";
import type { WebSocket } from "ws";

class Controller extends EventEmitter {
  private userDB: UsersDB;
  private gameDB: GameDB;
  private sender: Sender;
  constructor(usersDB: UsersDB, gameDB: GameDB, sender: Sender) {
    super();
    this.userDB = usersDB;
    this.gameDB = gameDB;
    this.sender = sender;
    this.userDB.on("add_user", this.gameDB.addWinner);
    this.gameDB.on("update_winners", this.sender.updateWinners);
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
    this.gameDB.createRoom(name);
    this.sender.updateRooms();
  };
}

const controller = new Controller(usersDB, gameDB, sender);

export { controller };

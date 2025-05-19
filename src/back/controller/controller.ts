import { EventEmitter } from "node:events";
import type { UsersDB, RoomsDB } from "../db";
import { usersDB, roomsDB } from "../db";
import { game, type Game } from "../game";
import { sender, type Sender } from "../sender";
import type { LoginRequest, LoginResponse, AddShips } from "../types";
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

  private createGame = (name1: string, name2: string) => {
    const sessionPlayer1 = this.userDB.getSessionByName(name1);
    const sessionPlayer2 = this.userDB.getSessionByName(name2);
    if (!sessionPlayer1 || !sessionPlayer2) {
      return;
    }
    const player1 = { name: name1, ws: sessionPlayer1 };
    const player2 = { name: name2, ws: sessionPlayer2 };
    const gameSession = this.game.createGame(player1, player2);
    gameSession.players.forEach((player) => {
      this.sender.createGame(gameSession.idGame, player.idPlayer, player.ws);
    });
  };

  addShips = (messageData: AddShips, ws: WebSocket) => {
    const { gameId, ships, indexPlayer } = messageData.data;
    const game = this.game.addShips(gameId, indexPlayer, ships, ws);
    if (
      game.players.every((player) => player.isReady && player.ships !== null)
    ) {
      game.players.forEach((player) => {
        if (player.ships === null) {
          throw new Error("ships are null");
        }
        this.sender.startGame(player.idPlayer, player.ships, player.ws);
      });
      const [{ idPlayer: player1, ws: ws1 }, { idPlayer: player2, ws: ws2 }] =
        game.players;

      this.turn(player1, player2, ws1, ws2);
    }
  };

  private turn = (
    indexPlayer1: string,
    indexPlayer2: string,
    ws1: WebSocket,
    ws2: WebSocket
  ) => {
    let playerId: string;
    if (Math.random() > 0.5) {
      playerId = indexPlayer1;
    } else {
      playerId = indexPlayer2;
    }
    this.sender.turn(playerId, ws1);
    this.sender.turn(playerId, ws2);
  };
}

const controller = new Controller(usersDB, roomsDB, sender, game);

export { controller };

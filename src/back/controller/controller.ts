import { EventEmitter } from "node:events";
import type { UsersDB, RoomsDB } from "../db";
import { usersDB, roomsDB } from "../db";
import { game, type Game } from "../game";
import { sender, type Sender } from "../sender";
import type {
  LoginRequest,
  LoginResponse,
  AddShips,
  AttackData,
  AttackStatus,
} from "../types";
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
      this.turn(gameId);
    }
  };

  private turn = (gameId: string) => {
    const currentPlayer = this.game.currentPlayer(gameId);
    const [ws1, ws2] = this.game.getSockets(gameId);
    this.sender.turn(currentPlayer, ws1);
    this.sender.turn(currentPlayer, ws2);
  };

  private sendAttack = (messageData: AttackData, status: AttackStatus) => {
    const { gameId } = messageData;
    const [ws1, ws2] = this.game.getSockets(gameId);
    this.sender.attack(messageData, status, ws1);
    this.sender.attack(messageData, status, ws2);
  };

  private sendWin = (messageData: AttackData) => {
    const { gameId } = messageData;
    const [ws1, ws2] = this.game.getSockets(gameId);
    this.sender.sendWin(messageData.indexPlayer, ws1);
    this.sender.sendWin(messageData.indexPlayer, ws2);
  };

  attack = (messageData: AttackData) => {
    const { gameId } = messageData;
    const cells = this.game.attack(messageData);
    cells.forEach((cell) => {
      this.sendAttack({ ...messageData, ...cell.position }, cell.status);
    });
    const win = this.game.checkWin(gameId);
    if (win) {
      const winner = this.game.getNameById(gameId, messageData.indexPlayer);
      this.roomsDB.addWinner(winner);
      this.sender.updateWinners();
      this.sendWin(messageData);
      this.game.deleteGame(gameId);
      return;
    }
    if (cells.length === 1 && cells[0].status === "miss") {
      this.game.nextPlayer(gameId);
    }
    this.turn(gameId);
  };
}

const controller = new Controller(usersDB, roomsDB, sender, game);

export { controller };

import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import type { Ship } from "../types";

type Cell = null | number;
type PlayerGame = {
  idPlayer: string;
  name: string;
  ships: Ship[] | null;
  field: Cell[][];
  isReady: boolean;
  ws: WebSocket;
};

type GameSession = {
  idGame: string;
  players: PlayerGame[];
};

type Player = {
  name: string;
  ws: WebSocket;
};

class Game {
  private games: Map<string, GameSession>;
  constructor() {
    this.games = new Map();
  }

  private createPlayer = ({ name, ws }: Player) => {
    return {
      idPlayer: randomUUID(),
      name,
      ships: null,
      field: new Array(10).fill(null).map(() => new Array(10).fill(null)),
      isReady: false,
      ws,
    };
  };

  private fillField = (ships: Ship[], field: Cell[][]) => {
    ships.forEach((ship) => {
      console.log(ship);
      const {
        position: { x, y },
        direction,
        length,
      } = ship;
      const start = direction ? y : x;
      const axis = direction ? x : y;
      for (let i = start; i < start + length; i++) {
        field[i][axis] = ship.length;
      }
    });
  };

  createGame = (player1: Player, player2: Player) => {
    const idGame = randomUUID();
    const player1Game = this.createPlayer(player1);
    const player2Game = this.createPlayer(player2);
    const gameSession: GameSession = {
      idGame,
      players: [player1Game, player2Game],
    };
    this.games.set(idGame, gameSession);
    return gameSession;
  };

  addShips = (
    gameId: string,
    idPlayer: string,
    ships: Ship[],
    ws: WebSocket
  ) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    const player = game.players.find((player) => player.idPlayer === idPlayer);
    if (!player) {
      throw new Error("Player not found");
    }

    if (player.ws !== ws) {
      throw new Error("Wrong player");
    }
    player.ships = ships;
    this.fillField(ships, player.field);
    player.isReady = true;
    return game;
  };
}

const game = new Game();

export { game, type Game };

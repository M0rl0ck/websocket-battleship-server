import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import type { Ship, AttackData, AttackStatus } from "../types";

type Cell = number;
type CellsAroundKilled = {
  position: { x: number; y: number };
  status: AttackStatus;
};
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
  currentPlayer?: string;
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
      field: new Array(10).fill(0).map(() => new Array(10).fill(0)),
      isReady: false,
      ws,
    };
  };

  private fillField = (ships: Ship[], field: Cell[][]) => {
    ships.forEach((ship, index) => {
      console.log(ship);
      const {
        position: { x, y },
        direction,
        length,
      } = ship;
      const start = direction ? y : x;
      for (let i = start; i < start + length; i++) {
        field[direction ? x : i][direction ? i : y] = index + 1;
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

  deleteGame = (idGame: string) => {
    this.games.delete(idGame);
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
    player.ships = [...ships];
    this.fillField(player.ships, player.field);
    console.log(player.field);
    player.isReady = true;
    return game;
  };

  getNameById = (gameId: string, idPlayer: string) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    const player = game.players.find((player) => player.idPlayer === idPlayer);
    if (!player) {
      throw new Error("Player not found");
    }
    return player.name;
  };

  nextPlayer = (gameId: string) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    const [{ idPlayer: player1 }, { idPlayer: player2 }] = game.players;
    if (!game.currentPlayer) {
      game.currentPlayer = Math.random() > 0.5 ? player1 : player2;
    } else {
      game.currentPlayer = game.currentPlayer === player1 ? player2 : player1;
    }
    return game.currentPlayer;
  };

  currentPlayer = (gameId: string) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    return game.currentPlayer ? game.currentPlayer : this.nextPlayer(gameId);
  };

  getSockets = (gameId: string) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    return game.players.map((player) => player.ws);
  };

  private checkKill = (field: Cell[][], ship: Ship): boolean => {
    const {
      direction,
      length,
      position: { x, y },
    } = ship;
    const start = direction ? y : x;
    for (let i = start; i < start + length; i++) {
      if (field[direction ? x : i][direction ? i : y] > 0) {
        return false;
      }
    }
    return true;
  };

  checkWin = (gameId: string) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    const { currentPlayer } = game;
    const enemyField = game.players.find(
      (player) => player.idPlayer !== currentPlayer
    )?.field;
    if (enemyField) {
      return !enemyField.some((row) => row.some((cell) => cell > 0));
    }
  };

  private getCellsAroundKilled = (field: number[][], ship: Ship) => {
    const {
      direction,
      length,
      position: { x, y },
    } = ship;
    const start = direction ? y : x;
    const axis = direction ? x : y;
    const cells: CellsAroundKilled[] = [];
    for (let i = start - 1; i < start + length + 1; i++) {
      for (let j = axis - 1; j < axis + 2; j++) {
        const [x1, y1] = [direction ? j : i, direction ? i : j];
        if (x1 < 0 || x1 > 9 || y1 < 0 || y1 > 9) {
          continue;
        }
        if (field[x1][y1] === 0) {
          field[x1][y1] = -2;
          const cell: CellsAroundKilled = {
            position: { x: x1, y: y1 },
            status: "miss",
          };
          cells.push(cell);
        } else if (field[x1][y1] === -1) {
          cells.push({ position: { x: x1, y: y1 }, status: "killed" });
        }
      }
    }

    return cells;
  };

  attack = (attackData: AttackData): CellsAroundKilled[] => {
    const result: CellsAroundKilled[] = [];
    const game = this.games.get(attackData.gameId);
    if (game) {
      const { currentPlayer } = game;
      if (currentPlayer === attackData.indexPlayer) {
        const enemy = game.players.find(
          (player) => player.idPlayer !== attackData.indexPlayer
        );

        if (enemy && enemy.ships) {
          const { field, ships } = enemy;
          const { x, y } = attackData;
          const cell = field[x][y];
          if (cell === 0) {
            field[x][y] = -2;
            result.push({ position: { x, y }, status: "miss" });
          } else if (cell > 0) {
            const index = field[x][y] - 1;
            field[x][y] = -1;
            const status = this.checkKill(field, ships[index])
              ? "killed"
              : "shot";
            if (status === "shot") {
              result.push({ position: { x, y }, status });
            } else {
              result.push(...this.getCellsAroundKilled(field, ships[index]));
            }
          }
        }
      }
    }
    return result;
  };
}

const game = new Game();

export { game, type Game };

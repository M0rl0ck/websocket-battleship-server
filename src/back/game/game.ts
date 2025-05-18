import { randomUUID } from "node:crypto";

type PlayerGame = {
  idPlayer: string;
  name: string;
};

type GameSession = {
  idGame: string;
  players: PlayerGame[];
};

class Game {
  private games: Map<string, GameSession>;
  constructor() {
    this.games = new Map();
  }

  createGame = (player1: string, player2: string) => {
    const idGame = randomUUID();
    const player1Game = { idPlayer: randomUUID(), name: player1 };
    const player2Game = { idPlayer: randomUUID(), name: player2 };
    const gameSession: GameSession = {
      idGame,
      players: [player1Game, player2Game],
    };
    this.games.set(idGame, gameSession);
    return idGame;
  };
}

const game = new Game();

export { game, type Game };

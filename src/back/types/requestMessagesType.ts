import { Ship } from "./types";

type LoginRequest = {
  type: "reg";
  data: {
    name: string;
    password: string;
  };
  id: 0;
};

type CreateRoom = {
  type: "create_room";
  data: "";
  id: 0;
};

type AddUserToRoom = {
  type: "add_user_to_room";
  data: {
    indexRoom: number | string;
  };
  id: 0;
};

type AddShips = {
  type: "add_ships";
  data: {
    gameId: string;
    ships: Ship[];
    indexPlayer: string /* id of the player in the current game session */;
  };
  id: 0;
};

type AttackData = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string /* id of the player in the current game session */;
};

type Attack = {
  type: "attack";
  data: AttackData;
  id: 0;
};

type RandomAttack = {
  type: "randomAttack";
  data: {
    gameId: number | string;
    indexPlayer:
      | number
      | string /* id of the player in the current game session */;
  };
  id: 0;
};

type IRequestData = {
  type: string;
  data: string;
  id: 0;
};

export type IRequest =
  | LoginRequest
  | CreateRoom
  | AddUserToRoom
  | AddShips
  | Attack
  | RandomAttack;

export { IRequestData, LoginRequest, AddShips, AttackData };

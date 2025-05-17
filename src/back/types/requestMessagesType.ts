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
    gameId: number | string;
    ships: [
      {
        position: {
          x: number;
          y: number;
        };
        direction: boolean;
        length: number;
        type: "small" | "medium" | "large" | "huge";
      },
    ];
    indexPlayer:
      | number
      | string /* id of the player in the current game session */;
  };
  id: 0;
};

type Attack = {
  type: "attack";
  data: {
    gameId: number | string;
    x: number;
    y: number;
    indexPlayer:
      | number
      | string /* id of the player in the current game session */;
  };
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

export type IRequest =
  | LoginRequest
  | CreateRoom
  | AddUserToRoom
  | AddShips
  | Attack
  | RandomAttack;

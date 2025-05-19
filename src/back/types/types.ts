type RoomUser = {
  name: string;
  index: number | string;
};

type Room = {
  roomId: string;
  roomUsers: RoomUser[];
};

type Winner = {
  name: string;
  wins: number;
};

type User = {
  name: string;
  password: string;
};

type Ship = {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

export { Room, Winner, User, Ship };

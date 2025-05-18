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

export { Room, Winner, User };

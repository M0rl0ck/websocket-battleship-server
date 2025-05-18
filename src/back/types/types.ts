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

export { Room, Winner };

import { usersDB } from "../db";
import { gameDB } from "../db";
import { createRaw } from "./utils";
import type { IResponse, UpdateRoom, UpdateWinners } from "../types";
import type { WebSocket } from "ws";

const updateRooms = (ws?: WebSocket) => {
  const rooms = gameDB.getRooms();
  const messageData: UpdateRoom = {
    type: "update_room",
    data: rooms,
    id: 0,
  };

  sendMessage(messageData, ws);
};

const updateWinners = (ws?: WebSocket) => {
  const winners = gameDB.getWinners();
  const messageData: UpdateWinners = {
    type: "update_winners",
    data: winners,
    id: 0,
  };
  sendMessage(messageData, ws);
};

const sendMessage = (message: IResponse, ws?: WebSocket) => {
  const messageRaw = createRaw(message);
  if (ws) {
    ws.send(messageRaw);
    return;
  }
  usersDB.getAuthorized().forEach((ws) => {
    ws.send(messageRaw);
  });
};

export { updateRooms, updateWinners };

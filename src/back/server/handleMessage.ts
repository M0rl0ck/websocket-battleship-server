import { usersDB } from "../db";
import type { LoginResponse } from "../types";
import type { RawData, WebSocket } from "ws";
import { parseRaw, createRaw } from "./utils";
import { updateRooms, updateWinners } from "./handlers";

export const handleMessage = (message: RawData, ws: WebSocket) => {
  const messageData = parseRaw(message);
  if (messageData.type === "reg") {
    const result = usersDB.authorizeUser(messageData.data, ws);
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

    ws.send(createRaw(newMessageData));
    updateRooms(ws);
    updateWinners(ws);
    return;
  }
};

// const privateHandleMessage = (message: IRequest, ws: WebSocket) => {
//   const messageData: IResponse | null = null;
//   if (!usersDB.isAuthorized(ws)) {
//     return;
//   }
//   switch (message.type) {
//     case "add_ships":
//       break;
//     case "add_user_to_room":
//       break;
//     case "create_room":
//       break;
//     case "attack":
//       break;
//     case "randomAttack":
//       break;
//     default:
//       break;
//   }
//   return messageData;
// };

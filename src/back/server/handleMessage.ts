import { controller } from "../controller/controller";
import type { RawData, WebSocket } from "ws";
import { parseRaw } from "../utils/utils";

export const handleMessage = (message: RawData, ws: WebSocket) => {
  const messageData = parseRaw(message);
  if (messageData.type === "reg") {
    controller.authorizeUser(messageData, ws);

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
